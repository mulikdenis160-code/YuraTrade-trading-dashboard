import assert from "node:assert/strict";
import test from "node:test";
import {
  analysisPeriodForExpiry,
  alternativeExpiryMinutes,
  formatExpiry,
  isValidExpirySeconds,
  lookbackForExpiry,
} from "./expiry.ts";

test("expirations cover whole minutes from one minute through four hours", () => {
  assert.equal(isValidExpirySeconds(60), true);
  assert.equal(isValidExpirySeconds(14_400), true);
  assert.equal(isValidExpirySeconds(0), false);
  assert.equal(isValidExpirySeconds(90), false);
  assert.equal(isValidExpirySeconds(14_460), false);
});

test("signal analysis always uses one-minute candles for every expiration", () => {
  assert.equal(analysisPeriodForExpiry(5 * 60), 60);
  assert.equal(analysisPeriodForExpiry(6 * 60), 60);
  assert.equal(analysisPeriodForExpiry(15 * 60), 60);
  assert.equal(analysisPeriodForExpiry(16 * 60), 60);
  assert.equal(analysisPeriodForExpiry(60 * 60), 60);
  assert.equal(analysisPeriodForExpiry(61 * 60), 60);
  assert.equal(analysisPeriodForExpiry(4 * 60 * 60), 60);
});

test("alternative expirations choose the nearest options when all use one-minute candles", () => {
  assert.deepEqual(alternativeExpiryMinutes(1), [2]);
  assert.deepEqual(alternativeExpiryMinutes(5), [3]);
  assert.deepEqual(alternativeExpiryMinutes(10), [5]);
  assert.deepEqual(alternativeExpiryMinutes(240), [180]);
});

test("lookback grows for longer expirations and labels hours clearly", () => {
  assert.equal(lookbackForExpiry(60, 60), 12);
  assert.equal(lookbackForExpiry(60 * 60, 300), 18);
  assert.equal(lookbackForExpiry(4 * 60 * 60, 900), 24);
  assert.equal(formatExpiry(60), "1 мин");
  assert.equal(formatExpiry(3_600), "1 ч");
  assert.equal(formatExpiry(4 * 3_600), "4 ч");
  assert.equal(formatExpiry(5_400), "1 ч 30 мин");
});