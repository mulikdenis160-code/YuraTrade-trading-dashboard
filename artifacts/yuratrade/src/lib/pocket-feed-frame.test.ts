import assert from "node:assert/strict";
import test from "node:test";
import {
  buildPocketAuthFrame,
  buildPocketHistoryRequest,
  buildPocketSubscriptionFrames,
  findPocketRows,
  parsePocketFastHistory,
  parsePocketSocketIoEvent,
  pocketFeedUrlForAuth,
} from "./pocket-feed-frame.ts";

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

test("rejects malformed fast-history payloads", () => {
  assert.equal(parsePocketFastHistory({ asset: "AUDNZD_otc", period: 60, history: [] }), null);
  assert.equal(parsePocketFastHistory({ asset: 12, period: 60, history: [[1800000000, 1.12]] }), null);
});

test("ignores malformed Socket.IO event frames", () => {
  assert.equal(parsePocketSocketIoEvent('42["updateStream"'), null);
  assert.equal(parsePocketSocketIoEvent('0{"sid":"abc"}'), null);
});
