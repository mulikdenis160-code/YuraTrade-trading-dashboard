import assert from "node:assert/strict";
import test from "node:test";
import {
  appendCoveredFastCandles,
  mergePocketHistoryByTime,
  parsePocketOptionHistory,
} from "./pocket-option-history.ts";

test("older provider responses cannot erase newer cached candles", () => {
  const cached = [
    { time: 120, open: 1, close: 1.2, high: 1.3, low: 0.9 },
    { time: 180, open: 1.2, close: 1.4, high: 1.5, low: 1.1 },
  ];
  const olderResponse = [
    { time: 60, open: 0.9, close: 1, high: 1.1, low: 0.8 },
    { time: 120, open: 1, close: 1.1, high: 1.2, low: 0.9 },
  ];

  const merged = mergePocketHistoryByTime(cached, olderResponse);
  assert.deepEqual(merged.map((candle) => candle.time), [60, 120, 180]);
  assert.equal(merged.at(-1)?.time, 180);
  assert.equal(merged.find((candle) => candle.time === 120)?.close, 1.1);
});

test("fast-history ticks fill every missing closed minute only with adequate coverage", () => {
  const base = [{ time: 60, open: 1, close: 1, high: 1, low: 1 }];
  const ticks = [];
  for (let minute = 2; minute <= 5; minute += 1) {
    for (const second of [1, 15, 30, 45]) {
      ticks.push({ time: (minute * 60 + second) * 1000, price: 1 + minute / 100 });
    }
  }

  const result = appendCoveredFastCandles(base, ticks, 60, 360_000);
  assert.deepEqual(result.map((candle) => candle.time), [60, 120, 180, 240, 300]);
  assert.equal(result.at(-1)?.close, 1.05);
});

test("fast-history reconstruction follows Pocket candle boundaries with a non-minute Unix offset", () => {
  const base = [{ time: 62, open: 1, close: 1, high: 1, low: 1 }];
  const ticks = [];
  for (let minute = 1; minute <= 3; minute += 1) {
    for (const second of [1, 15, 30, 45]) {
      ticks.push({ time: (62 + minute * 60 + second) * 1000, price: 1 + minute / 100 });
    }
  }

  const result = appendCoveredFastCandles(base, ticks, 60, 302_000);
  assert.deepEqual(result.map((candle) => candle.time), [62, 122, 182, 242]);
  assert.equal(result.at(-1)?.close, 1.03);
});

test("fast-history preserves the valid contiguous candles before an incomplete newest candle", () => {
  const base = [{ time: 60, open: 1, close: 1, high: 1, low: 1 }];
  const ticks = [
    { time: 121_000, price: 1.01 },
    { time: 135_000, price: 1.02 },
    { time: 150_000, price: 1.03 },
    { time: 165_000, price: 1.04 },
    { time: 181_000, price: 1.05 },
    { time: 195_000, price: 1.06 },
    { time: 210_000, price: 1.07 },
    { time: 225_000, price: 1.08 },
    { time: 241_000, price: 1.09 },
    { time: 245_000, price: 1.1 },
    { time: 250_000, price: 1.11 },
  ];

  const result = appendCoveredFastCandles(base, ticks, 60, 300_000);
  assert.deepEqual(result.map((candle) => candle.time), [60, 120, 180]);
  assert.equal(result.at(-1)?.close, 1.08);
});

test("fast-history data never fills partial coverage or the currently forming candle", () => {
  const base = [{ time: 60, open: 1, close: 1, high: 1, low: 1 }];
  const incomplete = [
    { time: 121_000, price: 1.02 },
    { time: 135_000, price: 1.03 },
    { time: 150_000, price: 1.04 },
  ];
  assert.equal(appendCoveredFastCandles(base, incomplete, 60, 180_000), base);

  const currentOnly = [241_000, 256_000, 271_000, 280_000].map((time, index) => ({
    time,
    price: 1.05 + index / 100,
  }));
  assert.equal(appendCoveredFastCandles(base, currentOnly, 60, 285_000), base);
});

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
