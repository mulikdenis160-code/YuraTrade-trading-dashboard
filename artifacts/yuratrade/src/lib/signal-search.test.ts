import assert from "node:assert/strict";
import test from "node:test";
import { searchSignalPairs } from "./signal-search.ts";

test("provider rate limits stop pair search after one request and retain the retry delay", async () => {
  let chosen = 0;
  let prepared = 0;
  const result = await searchSignalPairs({
    choose: async () => ({ symbol: `pair-${++chosen}` }),
    prepare: async () => { prepared++; return { decision: "pass" as const, reason: "rate limit", retryAcrossPairs: false, retryAfterMs: 30_000 }; },
    excluded: [], maxPairs: 8, deadlineAtMs: 10_000, now: () => 0, timeoutMessage: "timeout",
  });
  assert.deepEqual(result, { decision: "pass", reason: "rate limit", retryAcrossPairs: false, retryAfterMs: 30_000 });
  assert.equal(chosen, 1);
  assert.equal(prepared, 1);
});

test("pair history failure tries another pair and retains exclusion history", async () => {
  const exclusions: string[][] = [];
  const result = await searchSignalPairs({
    choose: async excluded => { exclusions.push(excluded); return { symbol: exclusions.length === 1 ? "first" : "second" }; },
    prepare: async pair => pair.symbol === "first"
      ? { decision: "pass" as const, reason: "missing candles", retryAcrossPairs: true }
      : { decision: "signal" as const, direction: "call" },
    excluded: ["previous"], maxPairs: 8, deadlineAtMs: 10_000, now: () => 0, timeoutMessage: "timeout",
  });
  assert.equal(result.decision, "signal");
  assert.deepEqual(exclusions, [["previous"], ["previous", "first"]]);
});

test("expired and cancelled searches make no RPC requests", async () => {
  const common = { choose: async () => { assert.fail("no request expected"); return { symbol: "pair" }; },
    prepare: async () => ({ decision: "signal" as const }), excluded: [], maxPairs: 8, deadlineAtMs: 10, now: () => 10, timeoutMessage: "expired" };
  await assert.rejects(searchSignalPairs(common), /expired/);
  await assert.rejects(searchSignalPairs({ ...common, now: () => 0, cancelled: () => true }), { name: "AbortError" });
});

test("late model responses cannot be published after the common deadline", async () => {
  let now = 0;
  await assert.rejects(searchSignalPairs({ choose: async () => ({ symbol: "pair" }),
    prepare: async () => { now = 11_000; return { decision: "signal" as const }; },
    excluded: [], maxPairs: 8, deadlineAtMs: 10_000, now: () => now, timeoutMessage: "expired",
  }), /expired/);
});

test("RPC failures are not mistaken for a bad pair and repeated across eight symbols", async () => {
  let requests = 0;
  await assert.rejects(searchSignalPairs({ choose: async () => ({ symbol: "pair" }),
    prepare: async () => { requests++; throw new Error("server unreachable"); },
    excluded: [], maxPairs: 8, deadlineAtMs: 10_000, now: () => 0, timeoutMessage: "expired",
  }), /server unreachable/);
  assert.equal(requests, 1);
});
