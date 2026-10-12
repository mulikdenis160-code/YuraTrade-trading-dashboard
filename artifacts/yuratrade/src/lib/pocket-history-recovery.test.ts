import assert from "node:assert/strict";
import { test } from "node:test";
import { scheduleHistoryRecovery } from "./pocket-history-recovery.ts";
import { createKeyedAsyncQueue } from "./async-keyed-queue.ts";

test("lost history request is retried once and can complete after five seconds", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  let retries = 0, expired = 0;
  const recovery = scheduleHistoryRecovery({ timeoutMs: 8000, retry: () => retries++, expire: () => expired++, fail: () => assert.fail() });
  t.mock.timers.tick(2500);
  assert.equal(retries, 1);
  t.mock.timers.tick(3500);
  assert.equal(expired, 0);
  recovery.stop(); // Delayed validated history arrives at six seconds.
  t.mock.timers.tick(10000);
  assert.equal(retries, 1);
  assert.equal(expired, 0);
});

test("completed or disconnected history does not send a delayed retry", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  let sent = 0;
  const r = scheduleHistoryRecovery({ timeoutMs: 8000, retry: () => sent++, expire: () => assert.fail(), fail: () => assert.fail() });
  r.stop();
  t.mock.timers.tick(10000);
  assert.equal(sent, 0);
});

test("missing history expires at the original deadline without retry loops", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  let sent = 0, expired = 0;
  scheduleHistoryRecovery({ timeoutMs: 8000, retry: () => sent++, expire: () => expired++, fail: () => assert.fail() });
  t.mock.timers.tick(2500);
  t.mock.timers.tick(5500);
  t.mock.timers.tick(20000);
  assert.equal(sent, 1);
  assert.equal(expired, 1);
});

test("failed resend stops deadline and reports one failure", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  let failures = 0;
  scheduleHistoryRecovery({ timeoutMs: 8000, retry: () => { throw new Error("disconnected"); }, expire: () => assert.fail(), fail: () => failures++ });
  t.mock.timers.tick(2500);
  t.mock.timers.tick(10000);
  assert.equal(failures, 1);
});

test("signal requests precede queued warmup while preserving one active chart", async () => {
  const run = createKeyedAsyncQueue();
  const order: string[] = [];
  let release!: () => void;
  const active = run("chart", async () => { order.push("active"); await new Promise<void>(r => { release = r; }); }, -1);
  const warm = run("chart", async () => { order.push("warm"); }, -1);
  const signal = run("chart", async () => { order.push("signal"); });
  const signal2 = run("chart", async () => { order.push("signal2"); });
  await Promise.resolve();
  assert.deepEqual(order, ["active"]);
  release();
  await Promise.all([active, warm, signal, signal2]);
  assert.deepEqual(order, ["active", "signal", "signal2", "warm"]);
  // A failure must not poison the queue for subsequent requests.
  await assert.rejects(run("chart", async () => { throw new Error("failed"); }));
  assert.equal(await run("chart", async () => "recovered"), "recovered");
});
