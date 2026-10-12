import type { MarketCandle } from "./signal-model.server.ts";

type NullableNumber = number | null;

export const ADX14_PERIOD = 14;
export const ADX14_MIN_HISTORY_CANDLES = ADX14_PERIOD * 2;

export type MarketTechnicalIndicators = {
  recentReturnBps: {
    bars5: NullableNumber;
    bars14: NullableNumber;
    bars30: NullableNumber;
  };
  ema: {
    ema9Vs21Bps: NullableNumber;
    ema21Slope5Bps: NullableNumber;
    ema50Slope5Bps: NullableNumber;
  };
  rsi14: NullableNumber;
  macdHistogramBps: NullableNumber;
  bollingerZ20: NullableNumber;
  atr14Bps: NullableNumber;
  atr5To14Ratio: NullableNumber;
  prior20HighDistanceBps: NullableNumber;
  prior20LowDistanceBps: NullableNumber;
  directionalMovement: {
    adx14: NullableNumber;
    plusDi14: NullableNumber;
    minusDi14: NullableNumber;
  };
};

export type MarketAnalysisContext = {
  candles: MarketCandle[];
  dataQuality: {
    closedCandleCount: number;
    droppedOpenCandles: number;
    missingIntervals: number;
    latestClosedCandleTime: number | null;
    latestClosedAgeSeconds: number | null;
    isFresh: boolean;
  };
  technicalIndicators: MarketTechnicalIndicators;
  higherTimeframe: {
    candleSeconds: number;
    candles: MarketCandle[];
    technicalIndicators: MarketTechnicalIndicators;
  } | null;
};

export function higherTimeframeForAnalysis(candleSeconds: number) {
  switch (candleSeconds) {
    case 60:
      return 300;
    case 180:
    case 300:
      return 900;
    case 900:
      return 3600;
    default:
      return null;
  }
}

function isValidCandle(candle: MarketCandle) {
  return (
    Number.isFinite(candle.time) &&
    Number.isFinite(candle.open) &&
    Number.isFinite(candle.high) &&
    Number.isFinite(candle.low) &&
    Number.isFinite(candle.close) &&
    candle.time > 0 &&
    candle.open > 0 &&
    candle.high > 0 &&
    candle.low > 0 &&
    candle.close > 0 &&
    candle.high >= candle.low &&
    candle.high >= Math.max(candle.open, candle.close) &&
    candle.low <= Math.min(candle.open, candle.close)
  );
}

function round(value: number): number | null {
  return Number.isFinite(value) ? Number(value.toFixed(3)) : null;
}

function basisPoints(value: number, base: number) {
  return base > 0 ? round(((value / base) - 1) * 10_000) : null;
}

function signedMagnitudeBps(value: number, base: number) {
  return base > 0 ? round((value / base) * 10_000) : null;
}

function average(values: number[]) {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function emaSeries(values: number[], period: number): Array<number | null> {
  const result: Array<number | null> = Array.from({ length: values.length }, () => null);
  if (values.length < period) return result;

  const seed = average(values.slice(0, period));
  if (seed === null) return result;

  let current = seed;
  result[period - 1] = current;
  const smoothing = 2 / (period + 1);
  for (let index = period; index < values.length; index += 1) {
    const value = values[index];
    if (value === undefined) continue;
    current = (value - current) * smoothing + current;
    result[index] = current;
  }
  return result;
}

function rsi(closes: number[], period = 14): number | null {
  if (closes.length <= period) return null;

  let averageGain = 0;
  let averageLoss = 0;
  for (let index = 1; index <= period; index += 1) {
    const current = closes[index];
    const previous = closes[index - 1];
    if (current === undefined || previous === undefined) return null;
    const change = current - previous;
    averageGain += Math.max(0, change);
    averageLoss += Math.max(0, -change);
  }
  averageGain /= period;
  averageLoss /= period;

  for (let index = period + 1; index < closes.length; index += 1) {
    const current = closes[index];
    const previous = closes[index - 1];
    if (current === undefined || previous === undefined) return null;
    const change = current - previous;
    averageGain = (averageGain * (period - 1) + Math.max(0, change)) / period;
    averageLoss = (averageLoss * (period - 1) + Math.max(0, -change)) / period;
  }

  if (averageLoss === 0) return averageGain === 0 ? 50 : 100;
  return round(100 - 100 / (1 + averageGain / averageLoss));
}

function averageTrueRange(candles: MarketCandle[], period: number) {
  if (candles.length < period) return null;
  const ranges = candles.map((candle, index) => {
    const previousClose = candles[index - 1]?.close ?? candle.open;
    return Math.max(
      candle.high - candle.low,
      Math.abs(candle.high - previousClose),
      Math.abs(candle.low - previousClose),
    );
  });
  return average(ranges.slice(-period));
}

function directionalMovement(candles: MarketCandle[], period = ADX14_PERIOD) {
  const unavailable = { adx14: null, plusDi14: null, minusDi14: null };
  if (candles.length < period * 2) return unavailable;

  const trueRanges: number[] = [];
  const plusMoves: number[] = [];
  const minusMoves: number[] = [];
  for (let index = 1; index < candles.length; index += 1) {
    const current = candles[index];
    const previous = candles[index - 1];
    if (!current || !previous) return unavailable;

    const upMove = current.high - previous.high;
    const downMove = previous.low - current.low;
    trueRanges.push(Math.max(
      current.high - current.low,
      Math.abs(current.high - previous.close),
      Math.abs(current.low - previous.close),
    ));
    plusMoves.push(upMove > downMove && upMove > 0 ? upMove : 0);
    minusMoves.push(downMove > upMove && downMove > 0 ? downMove : 0);
  }

  if (trueRanges.length < period * 2 - 1) return unavailable;
  let smoothedTrueRange = trueRanges.slice(0, period).reduce((sum, value) => sum + value, 0);
  let smoothedPlus = plusMoves.slice(0, period).reduce((sum, value) => sum + value, 0);
  let smoothedMinus = minusMoves.slice(0, period).reduce((sum, value) => sum + value, 0);
  const dxValues: number[] = [];

  const appendDx = () => {
    if (smoothedTrueRange <= 0) {
      dxValues.push(0);
      return;
    }
    const plusDi = (smoothedPlus / smoothedTrueRange) * 100;
    const minusDi = (smoothedMinus / smoothedTrueRange) * 100;
    const sum = plusDi + minusDi;
    dxValues.push(sum === 0 ? 0 : (Math.abs(plusDi - minusDi) / sum) * 100);
  };

  appendDx();
  for (let index = period; index < trueRanges.length; index += 1) {
    const trueRange = trueRanges[index];
    const plusMove = plusMoves[index];
    const minusMove = minusMoves[index];
    if (trueRange === undefined || plusMove === undefined || minusMove === undefined) continue;
    smoothedTrueRange = smoothedTrueRange - smoothedTrueRange / period + trueRange;
    smoothedPlus = smoothedPlus - smoothedPlus / period + plusMove;
    smoothedMinus = smoothedMinus - smoothedMinus / period + minusMove;
    appendDx();
  }

  if (dxValues.length < period || smoothedTrueRange <= 0) return unavailable;
  let adx = average(dxValues.slice(0, period));
  if (adx === null) return unavailable;
  for (let index = period; index < dxValues.length; index += 1) {
    const dx = dxValues[index];
    if (dx !== undefined) adx = ((adx * (period - 1)) + dx) / period;
  }

  return {
    adx14: round(adx),
    plusDi14: round((smoothedPlus / smoothedTrueRange) * 100),
    minusDi14: round((smoothedMinus / smoothedTrueRange) * 100),
  };
}

function macdHistogram(closes: number[]) {
  const fast = emaSeries(closes, 12);
  const slow = emaSeries(closes, 26);
  const macd: number[] = [];
  for (let index = 0; index < closes.length; index += 1) {
    const fastValue = fast[index];
    const slowValue = slow[index];
    if (fastValue !== null && fastValue !== undefined && slowValue !== null && slowValue !== undefined) {
      macd.push(fastValue - slowValue);
    }
  }

  const signal = emaSeries(macd, 9);
  const macdValue = macd.at(-1);
  const signalValue = signal.at(-1);
  const lastClose = closes.at(-1);
  if (macdValue === undefined || signalValue === null || signalValue === undefined || lastClose === undefined) {
    return null;
  }
  return signedMagnitudeBps(macdValue - signalValue, lastClose);
}

function bollingerZScore(closes: number[], period = 20) {
  const sample = closes.slice(-period);
  if (sample.length < period) return null;
  const mean = average(sample);
  if (mean === null) return null;
  const variance = sample.reduce((sum, value) => sum + (value - mean) ** 2, 0) / period;
  const standardDeviation = Math.sqrt(variance);
  const lastClose = sample.at(-1);
  if (lastClose === undefined) return null;
  if (standardDeviation === 0) return 0;
  return round((lastClose - mean) / standardDeviation);
}

function returnOverBars(closes: number[], bars: number) {
  const latest = closes.at(-1);
  const earlier = closes.at(-(bars + 1));
  if (latest === undefined || earlier === undefined) return null;
  return basisPoints(latest, earlier);
}

function emaSlope(ema: Array<number | null>, bars: number) {
  const latest = ema.at(-1);
  const earlier = ema.at(-(bars + 1));
  if (latest === null || latest === undefined || earlier === null || earlier === undefined) return null;
  return basisPoints(latest, earlier);
}

function technicalIndicators(candles: MarketCandle[]): MarketTechnicalIndicators {
  const closes = candles.map((candle) => candle.close);
  const lastClose = closes.at(-1);
  const ema9 = emaSeries(closes, 9);
  const ema21 = emaSeries(closes, 21);
  const ema50 = emaSeries(closes, 50);
  const currentEma9 = ema9.at(-1);
  const currentEma21 = ema21.at(-1);
  const priorCandles = candles.slice(-21, -1);
  const priorHigh = priorCandles.length === 20
    ? Math.max(...priorCandles.map((candle) => candle.high))
    : null;
  const priorLow = priorCandles.length === 20
    ? Math.min(...priorCandles.map((candle) => candle.low))
    : null;
  const atr5 = averageTrueRange(candles, 5);
  const atr14 = averageTrueRange(candles, 14);
  const directional = directionalMovement(candles);

  return {
    recentReturnBps: {
      bars5: returnOverBars(closes, 5),
      bars14: returnOverBars(closes, 14),
      bars30: returnOverBars(closes, 30),
    },
    ema: {
      ema9Vs21Bps:
        currentEma9 !== null && currentEma9 !== undefined &&
        currentEma21 !== null && currentEma21 !== undefined
          ? basisPoints(currentEma9, currentEma21)
          : null,
      ema21Slope5Bps: emaSlope(ema21, 5),
      ema50Slope5Bps: emaSlope(ema50, 5),
    },
    rsi14: rsi(closes),
    macdHistogramBps: macdHistogram(closes),
    bollingerZ20: bollingerZScore(closes),
    atr14Bps: atr14 !== null && lastClose !== undefined
      ? signedMagnitudeBps(atr14, lastClose)
      : null,
    atr5To14Ratio:
      atr5 !== null && atr14 !== null && atr14 > 0
        ? round(atr5 / atr14)
        : null,
    prior20HighDistanceBps:
      priorHigh !== null && lastClose !== undefined
        ? basisPoints(priorHigh, lastClose)
        : null,
    prior20LowDistanceBps:
      priorLow !== null && lastClose !== undefined
        ? basisPoints(lastClose, priorLow)
        : null,
    directionalMovement: directional,
  };
}

function aggregateHigherTimeframe(
  candles: MarketCandle[],
  candleSeconds: number,
  higherSeconds: number,
) {
  const ratio = higherSeconds / candleSeconds;
  if (!Number.isInteger(ratio) || ratio < 2) return [];

  const buckets = new Map<number, Map<number, MarketCandle>>();
  for (const candle of candles) {
    const start = Math.floor(candle.time / higherSeconds) * higherSeconds;
    const slot = Math.round((candle.time - start) / candleSeconds);
    const expectedTime = start + slot * candleSeconds;
    if (
      slot < 0 ||
      slot >= ratio ||
      Math.abs(candle.time - expectedTime) > Math.max(1, candleSeconds * 0.01)
    ) {
      continue;
    }
    const bucket = buckets.get(start) ?? new Map<number, MarketCandle>();
    bucket.set(slot, candle);
    buckets.set(start, bucket);
  }

  const aggregated: MarketCandle[] = [];
  for (const [time, bucket] of [...buckets.entries()].sort(([a], [b]) => a - b)) {
    if (bucket.size !== ratio) continue;
    const bars = Array.from({ length: ratio }, (_, slot) => bucket.get(slot));
    if (bars.some((bar) => bar === undefined)) continue;
    const completeBars = bars as MarketCandle[];
    const first = completeBars[0];
    const last = completeBars.at(-1);
    if (!first || !last) continue;
    aggregated.push({
      time,
      open: first.open,
      high: Math.max(...completeBars.map((bar) => bar.high)),
      low: Math.min(...completeBars.map((bar) => bar.low)),
      close: last.close,
    });
  }
  return aggregated.slice(-32);
}

function countMissingIntervals(candles: MarketCandle[], candleSeconds: number) {
  let missing = 0;
  for (let index = 1; index < candles.length; index += 1) {
    const previous = candles[index - 1];
    const current = candles[index];
    if (!previous || !current) continue;
    const elapsed = current.time - previous.time;
    if (elapsed > candleSeconds * 1.5) {
      missing += Math.max(1, Math.round(elapsed / candleSeconds) - 1);
    }
  }
  return missing;
}

export function buildMarketAnalysisContext(
  inputCandles: MarketCandle[],
  candleSeconds: number,
  nowSeconds = Math.floor(Date.now() / 1000),
): MarketAnalysisContext {
  if (!Number.isInteger(candleSeconds) || candleSeconds <= 0) {
    throw new Error("Интервал свечей должен быть положительным числом секунд.");
  }

  const uniqueByTime = new Map<number, MarketCandle>();
  for (const candle of inputCandles) {
    if (isValidCandle(candle)) uniqueByTime.set(candle.time, candle);
  }
  const normalized = [...uniqueByTime.values()].sort((a, b) => a.time - b.time);
  const closedCandles = normalized.filter((candle) => candle.time + candleSeconds <= nowSeconds);
  const candles = closedCandles.slice(-128);
  const latest = candles.at(-1);
  const latestClosedAgeSeconds = latest
    ? Math.max(0, Math.round(nowSeconds - (latest.time + candleSeconds)))
    : null;
  const higherSeconds = higherTimeframeForAnalysis(candleSeconds);
  const higherCandles = higherSeconds
    ? aggregateHigherTimeframe(candles, candleSeconds, higherSeconds)
    : [];

  return {
    candles,
    dataQuality: {
      closedCandleCount: candles.length,
      droppedOpenCandles: normalized.length - closedCandles.length,
      missingIntervals: countMissingIntervals(candles, candleSeconds),
      latestClosedCandleTime: latest?.time ?? null,
      latestClosedAgeSeconds,
      isFresh: latestClosedAgeSeconds !== null && latestClosedAgeSeconds <= candleSeconds + 5,
    },
    technicalIndicators: technicalIndicators(candles),
    higherTimeframe: higherSeconds
      ? {
          candleSeconds: higherSeconds,
          candles: higherCandles,
          technicalIndicators: technicalIndicators(higherCandles),
        }
      : null,
  };
}
