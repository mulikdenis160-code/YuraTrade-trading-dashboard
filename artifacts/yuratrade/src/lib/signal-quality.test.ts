import assert from "node:assert/strict";
import test from "node:test";
import { MIN_RULE_SCORE, assessSignalQuality } from "./signal-quality.ts";

test("signal filter accepts a sufficiently strong agreement", () => {
  const result = assessSignalQuality(0.31, 0.4, 0.2);
  assert.equal(result.agrees, true);
  assert.equal(result.eligible, true);
  assert.equal(result.qualityScore, 0.31);
});

test("signal filter rejects weak, conflicting, and neutral evidence", () => {
  assert.equal(assessSignalQuality(MIN_RULE_SCORE - 0.001, 0.4, 0.2).eligible, false);
  assert.equal(assessSignalQuality(0.5, 0.4, -0.2).eligible, false);
  assert.equal(assessSignalQuality(0.5, 0, 0.2).eligible, false);
  assert.equal(assessSignalQuality(Number.NaN, 0.4, 0.2).eligible, false);
});