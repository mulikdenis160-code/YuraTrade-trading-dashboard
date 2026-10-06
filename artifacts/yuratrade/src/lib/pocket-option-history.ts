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
