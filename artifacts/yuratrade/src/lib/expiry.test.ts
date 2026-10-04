import assert from "node:assert/strict";
import test from "node:test";
import {
  analysisPeriodForExpiry,
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

test("analysis candle interval scales with the selected expiration", () => {
  assert.equal(analysisPeriodForExpiry(5 * 60), 60);
  assert.equal(analysisPeriodForExpiry(6 * 60), 180);
  assert.equal(analysisPeriodForExpiry(15 * 60), 180);
  assert.equal(analysisPeriodForExpiry(16 * 60), 300);
  assert.equal(analysisPeriodForExpiry(60 * 60), 300);
  assert.equal(analysisPeriodForExpiry(61 * 60), 900);
  assert.equal(analysisPeriodForExpiry(4 * 60 * 60), 900);
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