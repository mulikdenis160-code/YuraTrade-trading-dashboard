import assert from "node:assert/strict";
import test from "node:test";
import {
  MAX_OVERLAYS,
  MAX_SIGNAL_ATTEMPTS,
  SIGNAL_ANALYSIS_TIMEOUT_MS,
  SIGNAL_COPY_DELAY_MS,
  SIGNAL_COPY_DELAY_SECONDS,
  SIGNAL_HISTORY_PAGE_TIMEOUT_MS,
  SIGNAL_PAIR_SEARCH_LIMIT,
  SIGNAL_PREPARATION_TIMEOUT_MS,
  SIGNAL_QUOTE_WAIT_MS,
} from "./signal-config.ts";
import { settleSignalRequest, waitForSignalRequest } from "./signal-request.ts";
import {
  levelForBalance,
  levelForPocketAccount,
  markSignalUsed,
  signalsUsedToday,
} from "./levels.ts";

test("all users can receive three additional overlays after the first signal", () => {
  assert.equal(MAX_OVERLAYS, 3);
  assert.equal(MAX_SIGNAL_ATTEMPTS, 4);
});

test("daily tier limits are doubled while the Deep tier stays unlimited", () => {
  assert.equal(levelForBalance(49.99), null);
  assert.equal(levelForBalance(50)?.deposit, 60);
  assert.equal(levelForBalance(59.99)?.daily, 10);
  assert.equal(levelForBalance(60)?.daily, 10);
  assert.equal(levelForBalance(149.99)?.daily, 10);
  assert.equal(levelForBalance(150)?.deposit, 200);
  assert.equal(levelForBalance(399.99)?.deposit, 200);
  assert.equal(levelForBalance(400)?.deposit, 500);
  assert.equal(levelForBalance(200)?.daily, 40);
  assert.equal(levelForBalance(500)?.daily, null);
});

test("a designated Pocket Option account gets unlimited tier without admin access", () => {
  assert.equal(levelForPocketAccount("142163888", 0, "apex")?.id, "apex");
  assert.equal(levelForPocketAccount("142163888", 0, "apex")?.daily, null);
  assert.equal(levelForPocketAccount("142163889", 0), null);
});

test("daily signal counts are isolated by Pocket Option ID", () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  const values = new Map<string, string>();
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    },
  });
  try {
    assert.equal(signalsUsedToday("123456789"), 0);
    assert.equal(markSignalUsed("123456789"), 1);
    assert.equal(signalsUsedToday("123456789"), 1);
    assert.equal(signalsUsedToday("987654321"), 0);
  } finally {
    if (original) {
      Object.defineProperty(globalThis, "localStorage", original);
    } else {
      Reflect.deleteProperty(globalThis, "localStorage");
    }
  }
});

test("the pair-copy window lasts exactly ten seconds", () => {
  assert.equal(SIGNAL_COPY_DELAY_SECONDS, 10);
  assert.equal(SIGNAL_COPY_DELAY_MS, 10_000);
});

test("Gemini and full signal preparation fit within a twenty-second search budget", async () => {
  assert.equal(SIGNAL_ANALYSIS_TIMEOUT_MS, 10_000);
  assert.equal(SIGNAL_PREPARATION_TIMEOUT_MS, 20_000);
  assert.equal(SIGNAL_HISTORY_PAGE_TIMEOUT_MS, 8_000);
  assert.equal(SIGNAL_QUOTE_WAIT_MS, 2_000);
  assert.equal(SIGNAL_PAIR_SEARCH_LIMIT, 8);
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
