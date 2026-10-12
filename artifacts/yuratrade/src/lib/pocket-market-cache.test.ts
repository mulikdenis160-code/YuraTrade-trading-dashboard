import assert from "node:assert/strict";
import test from "node:test";
import { historyForPeriod, storePeriodHistory, refreshPeriodHistories, type PocketMarketCache } from "./pocket-market-cache.ts";

const candle = (time: number) => ({ time, open: 1, close: 1, high: 1, low: 1 });

test("entry minute history does not overwrite the five-minute analysis cache", () => {
  const state: PocketMarketCache = { ticks: [], history: [], historyPeriodSeconds: null };
  storePeriodHistory(state, 300, [candle(300)]);
  storePeriodHistory(state, 60, [candle(540)]);
  assert.deepEqual(historyForPeriod(state, 300), [candle(300)]);
  assert.deepEqual(historyForPeriod(state, 60), [candle(540)]);
  assert.deepEqual(historyForPeriod(state, 900), []);
});

test("live ticks refresh each cached period without making an incomplete long candle valid", () => {
  const state: PocketMarketCache = { ticks: [], history: [], historyPeriodSeconds: null };
  storePeriodHistory(state, 300, [candle(300)]);
  storePeriodHistory(state, 60, [candle(540)]);
  state.ticks = [601_000, 615_000, 630_000, 645_000].map(time => ({ time, price: 1.1 }));
  refreshPeriodHistories(state, 660_000);
  assert.equal(historyForPeriod(state, 60).at(-1)?.time, 600);
  assert.equal(historyForPeriod(state, 300).at(-1)?.time, 300);
});

test("legacy caches survive initialization of another analysis period", () => {
  const state: PocketMarketCache = { ticks: [], history: [candle(60)], historyPeriodSeconds: 60 };
  storePeriodHistory(state, 900, [candle(900)]);
  assert.deepEqual(historyForPeriod(state, 60), [candle(60)]);
  assert.equal(historyForPeriod(state, 900).at(-1)?.time, 900);
});
