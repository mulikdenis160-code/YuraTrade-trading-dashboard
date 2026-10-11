import assert from "node:assert/strict";
import test from "node:test";
import {
  buildPocketSubscriptionFrames,
  findPocketRows,
  parsePocketSocketIoEvent,
  pocketFeedUrlForAuth,
} from "./pocket-feed-frame.ts";

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

test("ignores malformed Socket.IO event frames", () => {
  assert.equal(parsePocketSocketIoEvent('42["updateStream"'), null);
  assert.equal(parsePocketSocketIoEvent('0{"sid":"abc"}'), null);
});
