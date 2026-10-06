import assert from "node:assert/strict";
import test from "node:test";
import {
  MAX_OVERLAYS,
  MAX_SIGNAL_ATTEMPTS,
  SIGNAL_COPY_DELAY_MS,
  SIGNAL_COPY_DELAY_SECONDS,
} from "./signal-config.ts";

test("all users can receive three additional overlays after the first signal", () => {
  assert.equal(MAX_OVERLAYS, 3);
  assert.equal(MAX_SIGNAL_ATTEMPTS, 4);
});

test("the pair-copy window lasts exactly ten seconds", () => {
  assert.equal(SIGNAL_COPY_DELAY_SECONDS, 10);
  assert.equal(SIGNAL_COPY_DELAY_MS, 10_000);
});
