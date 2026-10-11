import assert from "node:assert/strict";
import test from "node:test";
import {
  buildPocketSubscriptionFrames,
  findPocketRows,
  parsePocketSocketIoEvent,
} from "./pocket-feed-frame.ts";

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
