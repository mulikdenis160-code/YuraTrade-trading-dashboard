import assert from "node:assert/strict";
import test from "node:test";
import {
  buildPocketAuthFrame,
  buildPocketHistoryRequest,
  buildPocketSubscriptionFrames,
  buildPocketQuoteSubscriptionFrames,
  createPocketEventDecoder,
  findPocketRows,
  parsePocketFastHistory,
  parsePocketFastCandleHistory,
  parsePocketHistoryResponse,
  parsePocketSocketIoEvent,
  pocketFeedUrlForAuth,
  pocketHistoryMatchesRequest,
} from "./pocket-feed-frame.ts";

test("fast candle history works without tick history and keeps its asset and period", () => {
  const result = parsePocketFastCandleHistory({ asset: "CHFJPY_otc", period: 60,
    candles: [[120, 178.052, 178.095, 178.117, 177.993, 96]] });
  assert.ok(result);
  assert.equal(result.asset, "CHFJPY_otc");
  assert.equal(result.periodSeconds, 60);
  assert.equal(result.history.candles[0].close, 178.095);
  assert.equal(parsePocketFastCandleHistory({ asset: "CHFJPY_otc", period: 0, candles: [[120, 1, 1, 1, 1]] }), null);
  assert.equal(parsePocketFastCandleHistory({ asset: "CHFJPY_otc", period: 60, candles: [[120, 1, 2, 1, 1]] }), null);
});

test("late history replies cannot satisfy a newer request or a different candle period", () => {
  const request = { asset: "AUDUSD_otc", index: 123, periodSeconds: 60 };
  const response = parsePocketHistoryResponse(JSON.stringify({ asset: request.asset, data: [], index: 123, period: 60 }));
  assert.ok(response);
  assert.equal(pocketHistoryMatchesRequest(response, request), true);
  assert.equal(pocketHistoryMatchesRequest({ ...response, index: 122 }, request), false);
  assert.equal(pocketHistoryMatchesRequest({ ...response, periodSeconds: 300 }, request), false);
  assert.equal(pocketHistoryMatchesRequest({ ...response, asset: "EURUSD_otc" }, request), false);
  assert.equal(pocketHistoryMatchesRequest({ asset: request.asset, data: [] }, request), true);
});

test("quote subscriptions do not switch the shared chart away from an in-flight history request", () => {
  assert.deepEqual(buildPocketQuoteSubscriptionFrames("AUDUSD_otc"), [
    '42["subscribeSymbol","AUDUSD_otc"]',
    '42["subfor","AUDUSD_otc"]',
  ]);
});

test("decodes split fast history instead of losing its JSON attachment", () => {
  const decode = createPocketEventDecoder();
  assert.equal(decode('451-["updateHistoryNewFast",{"_placeholder":true,"num":0}]'), null);
  const payload = { asset: "AUDUSD_otc", period: 60, history: [[1800000000, 1.25]] };
  assert.deepEqual(decode(JSON.stringify(payload)), { name: "updateHistoryNewFast", payload });
  assert.equal(decode(JSON.stringify(payload)), null);
});

test("split events survive heartbeat and decode nested attachments in order", () => {
  const decode = createPocketEventDecoder();
  assert.equal(decode('452-["updateAssets",[{"_placeholder":true,"num":1},{"_placeholder":true,"num":0}]]'), null);
  assert.equal(decode("2"), null);
  assert.equal(decode('["first"]'), null);
  assert.deepEqual(decode('["second"]'), { name: "updateAssets", payload: [["second"], ["first"]] });
});

test("decoder discards malformed attachments and superseded headers", () => {
  const decode = createPocketEventDecoder();
  decode('451-["old",{"_placeholder":true,"num":0}]');
  assert.deepEqual(decode('42["successauth",{}]'), { name: "successauth", payload: {} });
  assert.equal(decode('{}'), null);
  decode('451-["old",{"_placeholder":true,"num":0}]');
  assert.equal(decode('{bad'), null);
  assert.equal(decode('{}'), null);
});

test("requests optimized fast history without changing Pocket Option credentials", () => {
  const frame = buildPocketAuthFrame(
    '42["auth",{"session":"redacted-session","isDemo":0,"uid":123}]',
  );
  assert.ok(frame);
  const [, payload] = JSON.parse(frame.slice(2)) as [string, Record<string, unknown>];
  assert.equal(payload.session, "redacted-session");
  assert.equal(payload.isDemo, 0);
  assert.equal(payload.uid, 123);
  assert.equal(payload.platform, 2);
  assert.equal(payload.isFastHistory, true);
  assert.equal(payload.isOptimized, true);
});

test("rejects malformed auth when building the fast-history handshake", () => {
  assert.equal(buildPocketAuthFrame("invalid"), null);
  assert.equal(buildPocketAuthFrame('42["auth",null]'), null);
  assert.equal(buildPocketAuthFrame('42["updateAssets",[]]'), null);
});

test("selects the demo endpoint for demo auth and the live endpoint for real auth", () => {
  assert.equal(
    pocketFeedUrlForAuth('42["auth",{"session":"redacted","isDemo":1,"uid":123,"platform":2}]'),
    "wss://demo-api-eu.po.market/socket.io/?EIO=4&transport=websocket",
  );
  assert.equal(
    pocketFeedUrlForAuth('42["auth",{"session":"redacted","isDemo":0,"uid":123,"platform":2}]'),
    "wss://api-eu.po.market/socket.io/?EIO=4&transport=websocket",
  );
});

test("rejects malformed or non-auth frames when selecting Pocket Option region", () => {
  assert.equal(pocketFeedUrlForAuth('42["updateAssets",[]]'), null);
  assert.equal(pocketFeedUrlForAuth('42["auth",{"session":"redacted"}]'), null);
  assert.equal(pocketFeedUrlForAuth("not an auth frame"), null);
});

test("builds both Pocket Option market stream subscription frames", () => {
  assert.deepEqual(buildPocketSubscriptionFrames("AUDNZD_otc", 60), [
    '42["subscribeSymbol","AUDNZD_otc"]',
    '42["changeSymbol",{"asset":"AUDNZD_otc","period":60}]',
    '42["subfor","AUDNZD_otc"]',
  ]);
});

test("Pocket Option history request preserves the requested provider window", () => {
  assert.deepEqual(
    buildPocketHistoryRequest("AUDNZD_otc", 60, 1_800_000_000, 179176900000, 9_000),
    {
      asset: "AUDNZD_otc",
      index: 179176900000,
      offset: 9_000,
      period: 60,
      time: 1_800_000_000,
    },
  );
});

test("parses a Socket.IO event and its inline updateStream payload", () => {
  const parsed = parsePocketSocketIoEvent(
    '42["updateStream",[["EURUSD_otc",1800000000,1.12345]]]',
  );
  assert.deepEqual(parsed, {
    name: "updateStream",
    payload: [["EURUSD_otc", 1800000000, 1.12345]],
  });
  assert.deepEqual(
    findPocketRows(
      parsed?.payload,
      (row) => typeof row[0] === "string" && row.length >= 3,
    ),
    [["EURUSD_otc", 1800000000, 1.12345]],
  );
});

test("finds market rows nested in Socket.IO event objects", () => {
  const parsed = parsePocketSocketIoEvent(
    '42["updateStream",{"data":{"ticks":[["EURUSD_otc",1800000000,1.12345]]}}]',
  );
  assert.deepEqual(
    findPocketRows(
      parsed?.payload,
      (row) => typeof row[0] === "string" && row.length >= 3,
    ),
    [["EURUSD_otc", 1800000000, 1.12345]],
  );
});

test("parses Pocket Option updateHistoryNewFast tick history", () => {
  const parsed = parsePocketSocketIoEvent(
    '42["updateHistoryNewFast",{"asset":"AUDNZD_otc","period":60,"history":[[1800000000,1.12],[1800000015,1.13]]}]',
  );
  assert.deepEqual(parsePocketFastHistory(parsed?.payload), {
    asset: "AUDNZD_otc",
    periodSeconds: 60,
    ticks: [
      { time: 1800000000, price: 1.12 },
      { time: 1800000015, price: 1.13 },
    ],
  });
});

test("parses plain Pocket Option history response", () => {
  const data = [[1800000000, 1.12, 1.13, 1.11, 1.125]];
  assert.deepEqual(
    parsePocketHistoryResponse(JSON.stringify({ asset: "AUDNZD_otc", data })),
    { asset: "AUDNZD_otc", data },
  );
});

test("parses Socket.IO-wrapped Pocket Option history response", () => {
  const data = [[1800000000, 1.12, 1.13, 1.11, 1.125]];
  assert.deepEqual(
    parsePocketHistoryResponse(
      `42${JSON.stringify(["loadHistoryPeriod", { asset: "AUDNZD_otc", data }])}`,
    ),
    { asset: "AUDNZD_otc", data },
  );
});

test("ignores Socket.IO messages that are not history responses", () => {
  assert.equal(
    parsePocketHistoryResponse('42["updateStream",[["AUDNZD_otc",1.12,1800000000]]]' ),
    null,
  );
});

test("rejects malformed fast-history payloads", () => {
  assert.equal(parsePocketFastHistory({ asset: "AUDNZD_otc", period: 60, history: [] }), null);
  assert.equal(parsePocketFastHistory({ asset: 12, period: 60, history: [[1800000000, 1.12]] }), null);
});

test("ignores malformed Socket.IO event frames", () => {
  assert.equal(parsePocketSocketIoEvent('42["updateStream"'), null);
  assert.equal(parsePocketSocketIoEvent('0{"sid":"abc"}'), null);
});
