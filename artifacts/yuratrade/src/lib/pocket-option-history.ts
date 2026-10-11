export type HistoricalCandle = {
  time: number;
  open: number;
  close: number;
  high: number;
  low: number;
};

export type ParsedHistoryPage = {
  candles: HistoricalCandle[];
  rejectedRows: number;
};

export type TimedPriceTick = { time: number; price: number };

export function appendCoveredFastCandles(
  candles: HistoricalCandle[],
  ticks: TimedPriceTick[],
  periodSeconds: number,
  nowMs: number,
  maxGapCandles = 8,
): HistoricalCandle[] {
  if (
    candles.length === 0 ||
    ticks.length === 0 ||
    !Number.isInteger(periodSeconds) ||
    periodSeconds <= 0
  ) return candles;

  const periodMs = periodSeconds * 1000;
  const orderedCandles = [...candles].sort((a, b) => a.time - b.time);
  const latestKnownTimeMs = orderedCandles.at(-1)!.time * 1000;
  const formingCandleStartMs = Math.floor(nowMs / periodMs) * periodMs;
  const missingCount = Math.floor((formingCandleStartMs - periodMs - latestKnownTimeMs) / periodMs);
  if (missingCount <= 0 || missingCount > maxGapCandles) return candles;

  const grouped = new Map<number, TimedPriceTick[]>();
  for (const tick of ticks) {
    if (
      !Number.isFinite(tick.time) ||
      !Number.isFinite(tick.price) ||
      tick.time <= latestKnownTimeMs ||
      tick.time >= formingCandleStartMs ||
      tick.price <= 0
    ) continue;
    const candleTimeMs = Math.floor(tick.time / periodMs) * periodMs;
    const group = grouped.get(candleTimeMs) ?? [];
    group.push(tick);
    grouped.set(candleTimeMs, group);
  }

  const reconstructed: HistoricalCandle[] = [];
  for (let index = 1; index <= missingCount; index += 1) {
    const candleTimeMs = latestKnownTimeMs + index * periodMs;
    const group = (grouped.get(candleTimeMs) ?? []).sort((a, b) => a.time - b.time);
    if (group.length < 4) return candles;
    const coverageMs = group.at(-1)!.time - group[0]!.time;
    if (coverageMs < periodMs * 0.7) return candles;
    const prices = group.map((tick) => tick.price);
    reconstructed.push({
      time: candleTimeMs / 1000,
      open: prices[0]!,
      high: Math.max(...prices),
      low: Math.min(...prices),
      close: prices.at(-1)!,
    });
  }

  return [...orderedCandles, ...reconstructed];
}

export function parsePocketOptionHistory(data: unknown[]): ParsedHistoryPage {
  const candles: HistoricalCandle[] = [];

  for (const row of data) {
    if (!row || typeof row !== "object" || Array.isArray(row)) continue;
    const candle = row as Record<string, unknown>;
    const time = Number(candle.time);
    const open = Number(candle.open);
    const close = Number(candle.close);
    const high = Number(candle.high);
    const low = Number(candle.low);

    if (
      ![time, open, close, high, low].every(Number.isFinite) ||
      time <= 0 ||
      open <= 0 ||
      close <= 0 ||
      low <= 0 ||
      high < Math.max(open, close) ||
      low > Math.min(open, close) ||
      high < low
    ) {
      continue;
    }

    candles.push({ time, open, close, high, low });
  }

  candles.sort((a, b) => a.time - b.time);
  return { candles, rejectedRows: data.length - candles.length };
}
