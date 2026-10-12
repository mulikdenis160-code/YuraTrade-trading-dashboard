/** `time` is the candle's Unix opening time; its close is `time + periodSeconds`. */
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
export type FastHistoryCoverageDiagnostic = {
  latestKnownTimeMs: number;
  formingCandleStartMs: number;
  candleOffsetMs: number;
  missingCount: number;
  reconstructedCount: number;
  blockedAtIndex: number | null;
  blockedTickCount: number | null;
  blockedCoverageMs: number | null;
};

export function mergePocketHistoryByTime(
  cached: HistoricalCandle[],
  incoming: HistoricalCandle[],
  limit = 128,
): HistoricalCandle[] {
  const byTime = new Map(cached.map((candle) => [candle.time, candle]));
  for (const candle of incoming) byTime.set(candle.time, candle);
  return [...byTime.values()]
    .sort((a, b) => a.time - b.time)
    .slice(-limit);
}

export function appendCoveredFastCandles(
  candles: HistoricalCandle[],
  ticks: TimedPriceTick[],
  periodSeconds: number,
  nowMs: number,
  maxGapCandles = 8,
  onCoverage?: (diagnostic: FastHistoryCoverageDiagnostic) => void,
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
  // Keep the broker's candle anchor. OTC candle boundaries can be offset
  // from Unix-minute boundaries; flooring to epoch time mis-buckets fast ticks.
  const formingCandleStartMs =
    latestKnownTimeMs +
    Math.floor((nowMs - latestKnownTimeMs) / periodMs) * periodMs;
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
    const candleIndex = Math.floor((tick.time - latestKnownTimeMs) / periodMs);
    if (candleIndex < 1 || candleIndex > missingCount) continue;
    const candleTimeMs = latestKnownTimeMs + candleIndex * periodMs;
    const group = grouped.get(candleTimeMs) ?? [];
    group.push(tick);
    grouped.set(candleTimeMs, group);
  }

  const reconstructed: HistoricalCandle[] = [];
  let blockedAtIndex: number | null = null;
  let blockedTickCount: number | null = null;
  let blockedCoverageMs: number | null = null;
  for (let index = 1; index <= missingCount; index += 1) {
    const candleTimeMs = latestKnownTimeMs + index * periodMs;
    const group = (grouped.get(candleTimeMs) ?? []).sort((a, b) => a.time - b.time);
    if (group.length < 4) {
      blockedAtIndex = index;
      blockedTickCount = group.length;
      blockedCoverageMs = group.length > 1 ? group.at(-1)!.time - group[0]!.time : 0;
      break;
    }
    const coverageMs = group.at(-1)!.time - group[0]!.time;
    if (coverageMs < periodMs * 0.7) {
      blockedAtIndex = index;
      blockedTickCount = group.length;
      blockedCoverageMs = coverageMs;
      break;
    }
    const prices = group.map((tick) => tick.price);
    reconstructed.push({
      time: candleTimeMs / 1000,
      open: prices[0]!,
      high: Math.max(...prices),
      low: Math.min(...prices),
      close: prices.at(-1)!,
    });
  }

  onCoverage?.({
    latestKnownTimeMs,
    formingCandleStartMs,
    candleOffsetMs: latestKnownTimeMs % periodMs,
    missingCount,
    reconstructedCount: reconstructed.length,
    blockedAtIndex,
    blockedTickCount,
    blockedCoverageMs,
  });
  return reconstructed.length > 0
    ? [...orderedCandles, ...reconstructed]
    : candles;
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

/** Fast history tuples are [open time, open, close, high, low, volume]. */
export function parsePocketFastCandles(data: unknown[]): ParsedHistoryPage {
  return parsePocketOptionHistory(data.map((row) => {
    if (!Array.isArray(row) || row.length < 5) return null;
    const rawTime = Number(row[0]);
    return {
      time: rawTime >= 1_000_000_000_000 ? rawTime / 1000 : rawTime,
      open: row[1],
      close: row[2],
      high: row[3],
      low: row[4],
    };
  }));
}

/** Cache only closed candles; live ticks may complete later missing intervals. */
export function reconcileClosedPocketHistory(
  cached: HistoricalCandle[],
  incoming: HistoricalCandle[],
  ticks: TimedPriceTick[],
  periodSeconds: number,
  nowMs: number,
  limit = 128,
): HistoricalCandle[] {
  const closed = mergePocketHistoryByTime(cached, incoming, limit)
    .filter((candle) => (candle.time + periodSeconds) * 1000 <= nowMs);
  return appendCoveredFastCandles(closed, ticks, periodSeconds, nowMs).slice(-limit);
}
