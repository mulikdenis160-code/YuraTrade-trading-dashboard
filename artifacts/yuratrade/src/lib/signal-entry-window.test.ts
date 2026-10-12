import assert from "node:assert/strict";
import test from "node:test";
import { nextCandleEntryWindow } from "./signal-entry-window.ts";

const candles = Array.from({ length: 3 }, (_, index) => ({
  time: 1_800_000_000 + index * 60,
}));

test("permits entry in the next minute while at least 15 seconds remain", () => {
  const lastClosed = candles[2].time;
  const nowMs = (lastClosed + 60) * 1000 + 45_000;
  const window = nextCandleEntryWindow(candles, nowMs);
  assert.equal(window?.canEnter, true);
  assert.equal(window?.remainingMs, 15_000);
});

test("rejects entry when fewer than 15 seconds remain in the minute", () => {
  const lastClosed = candles[2].time;
  const window = nextCandleEntryWindow(
    candles,
    (lastClosed + 60) * 1000 + 45_001,
  );
  assert.equal(window?.canEnter, false);
});

test("rejects entry before the next minute candle opens", () => {
  const lastClosed = candles[2].time;
  const window = nextCandleEntryWindow(
    candles,
    (lastClosed + 60) * 1000 - 1,
  );
  assert.equal(window?.canEnter, false);
});

test("returns no entry window until there is a fully closed candle", () => {
  assert.equal(nextCandleEntryWindow(candles, candles[0].time * 1000), null);
});

test("delayed candle history does not shift the live minute-entry window into the past", () => {
  const lastClosed = candles[2].time;
  const nowMs = (lastClosed + 60) * 1000 + 180_010;
  const window = nextCandleEntryWindow(candles, nowMs);
  assert.equal(window?.opensAtMs, Math.floor(nowMs / 60_000) * 60_000);
  assert.equal(window?.canEnter, true);
  assert.equal(window?.remainingMs, 59_990);
});
