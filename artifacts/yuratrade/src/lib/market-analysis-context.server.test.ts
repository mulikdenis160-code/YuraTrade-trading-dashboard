import assert from "node:assert/strict";
import test from "node:test";
import {
  buildMarketAnalysisContext,
  higherTimeframeForAnalysis,
} from "./market-analysis-context.server.ts";
import type { MarketCandle } from "./signal-model.server.ts";

function risingCandles(count: number, startTime = 6_000, interval = 60): MarketCandle[] {
  const candles: MarketCandle[] = [];
  let close = 1;
  for (let index = 0; index < count; index += 1) {
    const open = close;
    close += 0.0001;
    candles.push({
      time: startTime + index * interval,
      open,
      high: close + 0.00005,
      low: open - 0.00005,
      close,
    });
  }
  return candles;
}

test("analysis context adds indicator and complete higher-timeframe evidence", () => {
  const candles = risingCandles(100);
  const latestCloseTime = candles.at(-1)!.time + 60;
  const context = buildMarketAnalysisContext(candles, 60, latestCloseTime + 30);

  assert.equal(higherTimeframeForAnalysis(60), 300);
  assert.equal(context.dataQuality.closedCandleCount, 100);
  assert.equal(context.dataQuality.isFresh, true);
  assert.equal(context.higherTimeframe?.candleSeconds, 300);
  assert.equal(context.higherTimeframe?.candles.length, 20);
  assert.ok(context.technicalIndicators.recentReturnBps.bars5! > 0);
  assert.ok(context.technicalIndicators.ema.ema9Vs21Bps! > 0);
  assert.ok(context.technicalIndicators.ema.ema21Slope5Bps! > 0);
  assert.equal(context.technicalIndicators.rsi14, 100);
  assert.notEqual(context.technicalIndicators.macdHistogramBps, null);
  assert.ok(Number.isFinite(context.technicalIndicators.macdHistogramBps));
  assert.ok(context.technicalIndicators.atr14Bps! > 0);
  assert.ok(context.technicalIndicators.prior20HighDistanceBps! < 0);
  assert.ok(context.technicalIndicators.prior20LowDistanceBps! > 0);
});

test("open candles are excluded and stale histories are marked unsafe", () => {
  const candles = risingCandles(40);
  const lastCandle = candles.at(-1)!;
  const duringLastCandle = buildMarketAnalysisContext(
    candles,
    60,
    lastCandle.time + 30,
  );
  assert.equal(duringLastCandle.dataQuality.closedCandleCount, 39);
  assert.equal(duringLastCandle.dataQuality.droppedOpenCandles, 1);
  assert.equal(duringLastCandle.dataQuality.isFresh, true);

  const stale = buildMarketAnalysisContext(
    candles,
    60,
    lastCandle.time + 60 * 5,
  );
  assert.equal(stale.dataQuality.isFresh, false);
});

test("gaps are reported and incomplete higher-timeframe buckets are not fabricated", () => {
  const candles = risingCandles(20).filter((_, index) => index !== 7);
  const context = buildMarketAnalysisContext(candles, 60, 8_000);

  assert.equal(context.dataQuality.missingIntervals, 1);
  assert.equal(context.higherTimeframe?.candles.length, 3);
});

test("longer candle intervals use appropriately broader context", () => {
  assert.equal(higherTimeframeForAnalysis(180), 900);
  assert.equal(higherTimeframeForAnalysis(300), 900);
  assert.equal(higherTimeframeForAnalysis(900), 3_600);
  assert.equal(higherTimeframeForAnalysis(120), null);
});
