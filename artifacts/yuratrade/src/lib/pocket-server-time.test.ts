import assert from "node:assert/strict";
import test from "node:test";
import {
  estimatePocketServerClockOffsetSeconds,
  pocketHistoryCandleLocalTime,
  pocketHistoryRequestTime,
} from "./pocket-server-time.ts";

test("server clock offset accepts Pocket Option timestamps in seconds or milliseconds", () => {
  const localNowMs = 1_800_000_000_000;
  assert.equal(
    estimatePocketServerClockOffsetSeconds(localNowMs / 1000 + 7200, localNowMs),
    7200,
  );
  assert.equal(
    estimatePocketServerClockOffsetSeconds(localNowMs + 7200_000, localNowMs),
    7200,
  );
});

test("invalid and implausibly distant feed timestamps are not used for clock sync", () => {
  const localNowMs = 1_800_000_000_000;
  assert.equal(estimatePocketServerClockOffsetSeconds(0, localNowMs), null);
  assert.equal(
    estimatePocketServerClockOffsetSeconds(localNowMs / 1000 + 15 * 60 * 60, localNowMs),
    null,
  );
});

test("history request timestamps use server time rounded down to the candle boundary", () => {
  assert.equal(pocketHistoryRequestTime(1_800_000_123_000, 7200, 60), 1_800_007_320);
  assert.equal(pocketHistoryRequestTime(1_800_000_123_000, 7200, 300), 1_800_007_200);
});

test("history candle times are converted back from server clock to local epoch time", () => {
  assert.equal(pocketHistoryCandleLocalTime(1_800_007_200, 7200), 1_800_000_000);
});

test("history request timestamps reject invalid periods", () => {
  assert.throws(() => pocketHistoryRequestTime(1_800_000_000_000, 7200, 0));
});
