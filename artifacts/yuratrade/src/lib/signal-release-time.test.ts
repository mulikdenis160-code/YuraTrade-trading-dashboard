import assert from "node:assert/strict";
import test from "node:test";
import { SIGNAL_COPY_DELAY_MS } from "./signal-config.ts";
import { signalReleaseAt, visibleSignalReleaseAt } from "./signal-release-time.ts";

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

test("stale candle timestamps schedule release in a future minute", () => {
  const latestClosed = candles[2].time;
  const currentWindowClosesAt = (latestClosed + 120) * 1_000;
  const nowMs = currentWindowClosesAt + 5_000;
  assert.equal(
    signalReleaseAt(candles, nowMs),
    currentWindowClosesAt + 60_000 + SIGNAL_COPY_DELAY_MS,
  );
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
