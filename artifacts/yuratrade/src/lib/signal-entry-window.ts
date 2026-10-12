import {
  MIN_ENTRY_BUFFER_MS,
  SIGNAL_CANDLE_SECONDS,
} from "./signal-config.ts";

type TimedCandle = { time: number };

export type SignalEntryWindow = {
  opensAtMs: number;
  closesAtMs: number;
  remainingMs: number;
  canEnter: boolean;
};

export function nextCandleEntryWindow(
  candles: TimedCandle[],
  nowMs: number,
): SignalEntryWindow | null {
  const candleMs = SIGNAL_CANDLE_SECONDS * 1000;
  const lastClosed = candles.reduce<TimedCandle | null>((latest, candle) => {
    if (!Number.isFinite(candle.time) || candle.time * 1000 + candleMs > nowMs) return latest;
    return !latest || candle.time > latest.time ? candle : latest;
  }, null);
  if (!lastClosed) return null;

  // Historical candles can lag the live quote feed. Their timestamps validate
  // that closed history exists, but must not be used to infer the current entry
  // minute or an old minute will make every otherwise-valid signal fail.
  const opensAtMs = Math.floor(nowMs / candleMs) * candleMs;
  const closesAtMs = opensAtMs + candleMs;
  const remainingMs = closesAtMs - nowMs;
  return {
    opensAtMs,
    closesAtMs,
    remainingMs,
    canEnter: nowMs >= opensAtMs && remainingMs >= MIN_ENTRY_BUFFER_MS,
  };
}
