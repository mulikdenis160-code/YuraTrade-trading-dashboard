import assert from "node:assert/strict";
import test from "node:test";
import { SIGNAL_COPY_DELAY_MS } from "./signal-config.ts";
import { signalReleaseAt, visibleSignalReleaseAt, signalEntryExpiresAt, entryConfirmationExpiresAt, signalEntryIsLive } from "./signal-release-time.ts";

test("prepared signals expire before the target minute loses its entry buffer", () => {
  const expires = signalEntryExpiresAt(70_000);
  assert.equal(expires, 105_000);
  assert.equal(signalEntryIsLive(expires, 104_999), true);
  assert.equal(signalEntryIsLive(expires, 105_000), false);
  assert.equal(signalEntryIsLive(expires, 600_000), false);
  assert.equal(signalEntryIsLive(Number.NaN, 0), false);
});

test("a newer confirmation timestamp cannot relabel an old quote as fresh", () => {
  const validUntil = entryConfirmationExpiresAt(39_000, 40_000, 45_000);
  assert.equal(validUntil, 41_000);
  assert.equal(entryConfirmationExpiresAt(39_000, 41_000, 45_000), 41_000);
  assert.equal(signalEntryIsLive(validUntil, 41_000), false);
  assert.equal(entryConfirmationExpiresAt(43_900, 44_000, 44_500), 44_500);
});

const candles = Array.from({ length: 3 }, (_, index) => ({
  time: 1_800_000_000 + index * 60,
}));

test("ready signal releases after the copy countdown in a safe entry window", () => {
  const latestClosed = candles[2].time;
  const nowMs = (latestClosed + 60) * 1_000 + 20_000;
  assert.equal(signalReleaseAt(candles, nowMs), nowMs + SIGNAL_COPY_DELAY_MS);
});

test("near a minute boundary, countdown ends in the next safe minute", () => {
  const latestClosed = candles[2].time;
  const currentWindowClosesAt = (latestClosed + 120) * 1_000;
  const nowMs = currentWindowClosesAt - 20_000;
  assert.equal(
    signalReleaseAt(candles, nowMs),
    currentWindowClosesAt + SIGNAL_COPY_DELAY_MS,
  );
});

test("delayed candle timestamps do not push the signal countdown into an old minute", () => {
  const latestClosed = candles[2].time;
  const currentWindowClosesAt = (latestClosed + 120) * 1_000;
  const nowMs = currentWindowClosesAt + 5_000;
  assert.equal(signalReleaseAt(candles, nowMs), nowMs + SIGNAL_COPY_DELAY_MS);
});

test("signal countdown remains visible for the full copy delay after preparation", () => {
  const nowMs = 1_800_000_000_000;
  assert.equal(
    visibleSignalReleaseAt(nowMs + 2_000, nowMs),
    nowMs + SIGNAL_COPY_DELAY_MS,
  );
  assert.equal(
    visibleSignalReleaseAt(nowMs + 60_000, nowMs),
    nowMs + 25_000,
  );
  assert.equal(
    visibleSignalReleaseAt(nowMs + 70_000, nowMs),
    nowMs + 25_000,
  );
});
