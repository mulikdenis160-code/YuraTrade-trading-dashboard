import {
  MIN_ENTRY_BUFFER_MS,
  SIGNAL_CANDLE_SECONDS,
  SIGNAL_COPY_DELAY_MS,
  SIGNAL_QUOTE_WAIT_MS,
} from "./signal-config.ts";
import { nextCandleEntryWindow } from "./signal-entry-window.ts";

type TimedCandle = { time: number };

export function signalReleaseAt(
  candles: TimedCandle[],
  nowMs: number,
): number | null {
  const window = nextCandleEntryWindow(candles, nowMs);
  if (!window) return null;

  const minimumRemaining =
    SIGNAL_COPY_DELAY_MS +
    MIN_ENTRY_BUFFER_MS +
    SIGNAL_QUOTE_WAIT_MS +
    1_000;
  let countdownStartsAt: number;

  if (nowMs < window.opensAtMs) {
    countdownStartsAt = window.opensAtMs;
  } else if (window.closesAtMs - nowMs >= minimumRemaining) {
    countdownStartsAt = nowMs;
  } else if (nowMs < window.closesAtMs) {
    countdownStartsAt = window.closesAtMs;
  } else {
    countdownStartsAt = window.closesAtMs + SIGNAL_CANDLE_SECONDS * 1_000;
  }

  return countdownStartsAt + SIGNAL_COPY_DELAY_MS;
}

export function visibleSignalReleaseAt(releaseAtMs: number, nowMs: number): number {
  return Math.max(releaseAtMs, nowMs + SIGNAL_COPY_DELAY_MS);
}
