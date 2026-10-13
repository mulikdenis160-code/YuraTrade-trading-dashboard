import assert from "node:assert/strict";
import { test } from "node:test";
import { prepareRecovery } from "./signal-recovery.ts";

test("recovery accepts an AI response after the ordinary ten-second timeout", async () => {
  let now = 0;
  const result = await prepareRecovery({ now: () => now, timeoutMessage: "timeout", prepare: async budget => {
    assert.equal(budget, 45000);
    now += 25000;
    return { decision: "signal" as const, direction: "call" };
  } });
  assert.equal(result.decision, "signal");
});

test("one AI timeout can recover with a newly prepared signal", async () => {
  let now = 0, calls = 0;
  const result = await prepareRecovery({ now: () => now, delay: async ms => { now += ms; }, timeoutMessage: "timeout", prepare: async () => {
    calls++;
    if (calls === 1) { now += 30000; return { decision: "pass" as const, reason: "timeout", failureCode: "ai_timeout", retryAcrossPairs: false }; }
    return { decision: "signal" as const };
  } });
  assert.equal(result.decision, "signal");
  assert.equal(calls, 2);
});

test("quota, configuration, invalid responses and feed failures are never blindly retried", async () => {
  for (const failureCode of ["ai_rate_limited", "ai_quota_exhausted", "ai_configuration", "ai_invalid_response", undefined]) {
    let calls = 0;
    const result = await prepareRecovery({ timeoutMessage: "timeout", prepare: async () => {
      calls++; return { decision: "pass" as const, reason: "unavailable", failureCode, retryAcrossPairs: false, retryAfterMs: 60000 };
    } });
    assert.equal(result.decision, "pass");
    assert.equal(calls, 1);
  }
});

test("repeated model timeouts stop after two attempts", async () => {
  let calls = 0;
  const result = await prepareRecovery({ delay: async () => {}, timeoutMessage: "timeout", prepare: async () => {
    calls++; return { decision: "pass" as const, reason: "timeout", failureCode: "ai_timeout" };
  } });
  assert.equal(result.decision, "pass");
  assert.equal(calls, 2);
});

test("the second server request fits the remaining overall budget", async () => {
  let now = 0, calls = 0;
  const budgets: number[] = [];
  await prepareRecovery({ now: () => now, delay: async ms => { now += ms; }, timeoutMessage: "timeout", prepare: async budget => {
    calls++; budgets.push(budget);
    if (calls === 1) { now += 44000; return { decision: "pass" as const, reason: "timeout", failureCode: "ai_timeout" }; }
    return { decision: "signal" as const };
  } });
  assert.deepEqual(budgets, [45000, 14000]);
});

test("leaving recovery during backoff prevents another model request", async () => {
  let cancelled = false, calls = 0;
  await assert.rejects(prepareRecovery({ cancelled: () => cancelled, delay: async () => { cancelled = true; }, timeoutMessage: "timeout", prepare: async () => {
    calls++; return { decision: "pass" as const, reason: "busy", failureCode: "ai_busy", retryAfterMs: 1000 };
  } }), { name: "AbortError" });
  assert.equal(calls, 1);
});

test("unknown RPC failure stops without another generation request", async () => {
  let calls = 0;
  await assert.rejects(prepareRecovery({ timeoutMessage: "timeout", prepare: async () => {
    calls++; throw new Error("RPC disconnected");
  } }), /RPC disconnected/);
  assert.equal(calls, 1);
});
