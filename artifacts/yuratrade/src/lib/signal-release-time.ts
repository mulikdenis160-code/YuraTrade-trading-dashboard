import {
  MAX_SIGNAL_COUNTDOWN_MS,
  MIN_ENTRY_BUFFER_MS,
  SIGNAL_CANDLE_SECONDS,
  SIGNAL_COPY_DELAY_MS,
  SIGNAL_QUOTE_WAIT_MS,
  MAX_QUOTE_AGE_MS,
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
  const minimumReleaseAt = nowMs + SIGNAL_COPY_DELAY_MS;
  const maximumReleaseAt = nowMs + MAX_SIGNAL_COUNTDOWN_MS;
  return Math.min(Math.max(releaseAtMs, minimumReleaseAt), maximumReleaseAt);
}

export function signalEntryExpiresAt(releaseAtMs: number): number {
  const minuteMs = SIGNAL_CANDLE_SECONDS * 1000;
  return Math.floor(releaseAtMs / minuteMs) * minuteMs + minuteMs - MIN_ENTRY_BUFFER_MS;
}

export function entryConfirmationExpiresAt(quoteAtMs: number, confirmedAtMs: number, signalExpiresAtMs: number): number {
  return Math.min(quoteAtMs + MAX_QUOTE_AGE_MS, signalEntryExpiresAt(confirmedAtMs), signalExpiresAtMs);
}

export function signalEntryIsLive(expiresAtMs: number, nowMs = Date.now()): boolean {
  return Number.isFinite(expiresAtMs) && Number.isFinite(nowMs) && nowMs < expiresAtMs;
}
