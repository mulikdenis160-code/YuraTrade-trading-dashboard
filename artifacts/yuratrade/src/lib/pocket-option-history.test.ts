import assert from "node:assert/strict";
import test from "node:test";
import { parsePocketOptionHistory } from "./pocket-option-history.ts";

test("Pocket Option history keeps complete valid OHLC rows and sorts by timestamp", () => {
  const parsed = parsePocketOptionHistory([
    { time: 120, open: "1.2", close: "1.3", high: "1.4", low: "1.1" },
    { time: 60, open: 1, close: 1.1, high: 1.2, low: 0.9 },
  ]);

  assert.deepEqual(parsed.candles.map((candle) => candle.time), [60, 120]);
  assert.equal(parsed.rejectedRows, 0);
});

test("Pocket Option history rejects missing or impossible OHLC instead of inventing wicks", () => {
  const parsed = parsePocketOptionHistory([
    { time: 60, open: 1, close: 1.1, low: 0.9 },
    { time: 120, open: 1, close: 1.1, high: 1.2 },
    { time: 180, open: 1, close: 1.1, high: 1.05, low: 0.95 },
    { time: 240, open: 1, close: 1.1, high: 1.2, low: 1.05 },
    { time: 300, open: 1, close: 1.1, high: 1.2, low: 0.9 },
  ]);

  assert.deepEqual(parsed.candles.map((candle) => candle.time), [300]);
  assert.equal(parsed.rejectedRows, 4);
});

test("Pocket Option history rejects nonpositive prices and invalid timestamps", () => {
  const parsed = parsePocketOptionHistory([
    { time: 0, open: 1, close: 1.1, high: 1.2, low: 0.9 },
    { time: 60, open: 0, close: 1.1, high: 1.2, low: 0.9 },
    { time: 120, open: 1, close: 1.1, high: 1.2, low: -0.9 },
  ]);

  assert.equal(parsed.candles.length, 0);
  assert.equal(parsed.rejectedRows, 3);
});
