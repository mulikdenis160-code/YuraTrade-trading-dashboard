import assert from "node:assert/strict";
import test from "node:test";
import {
  MAX_OVERLAYS,
  MAX_SIGNAL_ATTEMPTS,
  SIGNAL_ANALYSIS_TIMEOUT_MS,
  SIGNAL_COPY_DELAY_MS,
  SIGNAL_COPY_DELAY_SECONDS,
  SIGNAL_PAIR_SEARCH_LIMIT,
  SIGNAL_PREPARATION_TIMEOUT_MS,
} from "./signal-config.ts";
import { settleSignalRequest, waitForSignalRequest } from "./signal-request.ts";

test("all users can receive three additional overlays after the first signal", () => {
  assert.equal(MAX_OVERLAYS, 3);
  assert.equal(MAX_SIGNAL_ATTEMPTS, 4);
});

test("the pair-copy window lasts exactly ten seconds", () => {
  assert.equal(SIGNAL_COPY_DELAY_SECONDS, 10);
  assert.equal(SIGNAL_COPY_DELAY_MS, 10_000);
});

test("Gemini is capped at five seconds and full preparation has a separate bounded wait", async () => {
  assert.equal(SIGNAL_ANALYSIS_TIMEOUT_MS, 5_000);
  assert.equal(SIGNAL_PREPARATION_TIMEOUT_MS, 15_000);
  assert.equal(SIGNAL_PAIR_SEARCH_LIMIT, 4);
  const request = settleSignalRequest(Promise.resolve("ready"));
  assert.equal(
    await waitForSignalRequest(request, SIGNAL_PREPARATION_TIMEOUT_MS, "timed out"),
    "ready",
  );
});

test("an unresolved signal request stops waiting at its deadline", async () => {
  const request = settleSignalRequest(new Promise<string>(() => {}));
  await assert.rejects(
    waitForSignalRequest(request, 10, "timed out"),
    /timed out/,
  );
});
