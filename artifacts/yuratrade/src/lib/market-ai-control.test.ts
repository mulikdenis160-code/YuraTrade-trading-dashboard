import assert from "node:assert/strict";
import test from "node:test";
import { createMarketAiController, marketAiFailure, MarketAiServiceError, retryAfterMilliseconds } from "./market-ai-control.ts";

test("429 observes RetryInfo and blocks every other pair without another provider call", async () => {
  let now = 1_000;
  let calls = 0;
  const control = createMarketAiController({ now: () => now });
  const error = { status: 429, message: JSON.stringify({ error: { details: [
    { "@type": "type.googleapis.com/google.rpc.RetryInfo", retryDelay: "30.5s" },
  ] } }) };
  await assert.rejects(control.run("first-pair", async () => { calls++; throw error; }, 11_000),
    (failure: MarketAiServiceError) => failure.code === "ai_rate_limited" && failure.retryAfterMs === 30_500);
  now += 10_000;
  await assert.rejects(control.run("another-pair", async () => { calls++; return 1; }, 21_000),
    (failure: MarketAiServiceError) => failure.retryAfterMs === 20_500);
  assert.equal(calls, 1);
  now = 32_000;
  assert.equal(await control.run("fresh-request", async () => { calls++; return 2; }, 42_000), 2);
  assert.equal(calls, 2);
});

test("zero or daily quotas are reported as account quota failures without leaking response text", () => {
  const failure = marketAiFailure({ status: 429, message: JSON.stringify({ error: {
    message: "sensitive raw provider error",
    details: [{ "@type": "type.googleapis.com/google.rpc.QuotaFailure", violations: [
      { quotaId: "GenerateRequestsPerDay", quotaValue: "0" },
    ] }],
  } }) });
  assert.equal(failure.code, "ai_quota_exhausted");
  assert.doesNotMatch(failure.message, /sensitive/);
  assert.equal(failure.toResult().retryAcrossPairs, false);
});

test("a short 503 failure retries once within the original budget", async () => {
  let now = 0;
  let calls = 0;
  const control = createMarketAiController({ now: () => now, sleep: async ms => { now += ms; } });
  const result = await control.run("one", async remaining => {
    calls++;
    if (calls === 1) throw { status: 503 };
    assert.equal(remaining, 9_000);
    return "valid response";
  }, 10_000);
  assert.equal(result, "valid response");
  assert.equal(calls, 2);
  assert.equal(control.unavailable(), undefined);
});

test("explicit provider delays and nearly exhausted budgets are never bypassed", async () => {
  let calls = 0;
  const control = createMarketAiController({ now: () => 0, sleep: async () => assert.fail("must not wait") });
  await assert.rejects(control.run("delayed", async () => {
    calls++; throw new MarketAiServiceError("ai_unavailable", "wait", 5_000, 503, true);
  }, 10_000));
  assert.equal(calls, 1);
  let now = 0;
  const late = createMarketAiController({ now: () => now, sleep: async () => assert.fail("budget too short") });
  await assert.rejects(late.run("late", async () => { now = 7_000; throw { status: 503 }; }, 10_000));
});

test("repeated transient failure stops after two calls and opens a short cooldown", async () => {
  let now = 0;
  let calls = 0;
  const control = createMarketAiController({ now: () => now, sleep: async ms => { now += ms; } });
  await assert.rejects(control.run("first", async () => { calls++; throw { status: 503 }; }, 10_000));
  await assert.rejects(control.run("second", async () => { calls++; return 1; }, 10_000));
  assert.equal(calls, 2);
});

test("identical requests share work and distinct concurrent requests wait for their turn", async () => {
  let release!: (value: number) => void;
  const gate = new Promise<number>(resolve => { release = resolve; });
  let calls = 0;
  const control = createMarketAiController();
  const deadline = Date.now() + 10_000;
  const first = control.run("same", async () => { calls++; return gate; }, deadline);
  const same = control.run("same", async () => { calls++; return 99; }, deadline);
  const different = control.run("different", async () => { calls++; return 100; }, deadline);
  await Promise.resolve();
  assert.equal(calls, 1);
  release(42);
  assert.deepEqual(await Promise.all([first, same, different]), [42, 42, 100]);
  assert.equal(calls, 2);
  assert.equal(control.unavailable(), undefined);
});

test("a queued request does not call Gemini after its deadline expires", async () => {
  let now = 0;
  let release!: (value: number) => void;
  const gate = new Promise<number>(resolve => { release = resolve; });
  let calls = 0;
  const control = createMarketAiController({ now: () => now });
  const first = control.run("first", async () => gate, 10_000);
  const queued = control.run("queued", async () => { calls++; return 2; }, 5_000);
  now = 6_000;
  release(1);
  assert.equal(await first, 1);
  await assert.rejects(queued, (failure: MarketAiServiceError) => failure.code === "ai_timeout");
  assert.equal(calls, 0);
});

test("aborting a backoff stops retrying and releases the active slot", async () => {
  const abort = new AbortController();
  let calls = 0;
  const control = createMarketAiController({ now: () => 0, sleep: async () => { abort.abort(); } });
  await assert.rejects(control.run("cancelled", async () => { calls++; throw { status: 503 }; }, 10_000, abort.signal), { name: "AbortError" });
  assert.equal(calls, 1);
  assert.equal(control.unavailable(), undefined);
});

test("configuration failures never retry, and Retry-After supports seconds and HTTP dates", async () => {
  let calls = 0;
  const control = createMarketAiController({ now: () => 0 });
  await assert.rejects(control.run("bad-key", async () => { calls++; throw { status: 403 }; }, 10_000),
    (failure: MarketAiServiceError) => failure.code === "ai_configuration");
  assert.equal(calls, 1);
  assert.equal(retryAfterMilliseconds("2.5"), 2_500);
  assert.equal(retryAfterMilliseconds("Thu, 01 Jan 1970 00:00:10 GMT", 5_000), 5_000);
  assert.equal(retryAfterMilliseconds("invalid"), null);
  assert.equal(retryAfterMilliseconds("9".repeat(400)), null);
});

test("errors from a retained HMR controller keep their provider cooldown metadata", () => {
  const foreign = Object.assign(new Error("provider pause"), { name: "MarketAiServiceError",
    code: "ai_quota_exhausted", status: 429, retryAfterMs: 2_884_000, retryDelayProvided: true });
  const normalized = marketAiFailure(foreign);
  assert.equal(normalized.code, "ai_quota_exhausted");
  assert.equal(normalized.retryAfterMs, 2_884_000);
  assert.equal(normalized.retryDelayProvided, true);
});
