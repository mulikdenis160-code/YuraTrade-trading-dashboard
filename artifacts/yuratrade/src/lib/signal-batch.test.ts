import assert from "node:assert/strict";
import test from "node:test";
import {
  completeSignalBatchAttempt,
  pauseSignalBatch,
  readSignalBatch,
  recordSignalBatchSearchFailure,
  requestSignalBatchStop,
  resumeSignalBatch,
  SIGNAL_BATCH_MAX_SEARCH_FAILURES,
  SIGNAL_BATCH_TARGET,
  signalBatchWinRate,
  startSignalBatch,
} from "./signal-batch.ts";

const values = new Map<string, string>();
const previousWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
const fakeWindow = {
  localStorage: {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  },
  dispatchEvent: () => true,
  addEventListener: () => {},
  removeEventListener: () => {},
} as unknown as Window;

Object.defineProperty(globalThis, "window", { value: fakeWindow, configurable: true });

test("a signal batch counts only completed series and finishes at twenty", () => {
  values.clear();
  const started = startSignalBatch(120, 10_000);
  assert.ok(started);
  assert.equal(started.target, SIGNAL_BATCH_TARGET);

  let current = started;
  for (let position = 1; position <= SIGNAL_BATCH_TARGET; position += 1) {
    current = completeSignalBatchAttempt(
      started.id,
      position,
      position % 4 === 0 ? "loss" : position % 5 === 0 ? "draw" : "win",
      10_000 + position,
    )!;
    assert.equal(current?.completed, position);
  }

  assert.equal(current.status, "completed");
  assert.equal(current.completed, 20);
  assert.equal(current.wins, 12);
  assert.equal(current.losses, 5);
  assert.equal(current.draws, 3);
  assert.equal(completeSignalBatchAttempt(started.id, 20, "loss")?.completed, 20);
  assert.equal(readSignalBatch()?.losses, 5);
});

test("batch win rate uses only verified wins and losses and is empty without decisive outcomes", () => {
  assert.equal(signalBatchWinRate({ wins: 3, losses: 1 }), 75);
  assert.equal(signalBatchWinRate({ wins: 0, losses: 0 }), null);
});

test("search errors retry and then pause until resumed", () => {
  values.clear();
  const started = startSignalBatch(300, 20_000)!;
  let current = recordSignalBatchSearchFailure(started.id, "Ошибка сети", 21_000)!;
  assert.equal(current.status, "running");
  assert.equal(current.nextAttemptAt, 36_000);

  current = recordSignalBatchSearchFailure(started.id, "Нет данных", 37_000)!;
  current = recordSignalBatchSearchFailure(started.id, "Нет данных", 53_000)!;
  assert.equal(SIGNAL_BATCH_MAX_SEARCH_FAILURES, 3);
  assert.equal(current.status, "paused");
  assert.equal(current.completed, 0);
  assert.equal(resumeSignalBatch(started.id, 60_000)?.status, "running");
  assert.equal(readSignalBatch()?.consecutiveFailures, 0);
});

test("stop requests finish the active signal series before stopping", () => {
  values.clear();
  const started = startSignalBatch(120, 30_000)!;
  assert.equal(requestSignalBatchStop(true, 31_000)?.status, "stopping");
  const stopped = completeSignalBatchAttempt(started.id, 1, "loss", 40_000);
  assert.equal(stopped?.status, "stopped");
  assert.equal(stopped?.losses, 1);

  values.clear();
  const idle = startSignalBatch(120, 50_000)!;
  assert.equal(requestSignalBatchStop(false, 51_000)?.status, "stopped");
});

test("pausing during a live series records its real outcome but does not start the next one", () => {
  values.clear();
  const started = startSignalBatch(120, 60_000)!;
  assert.equal(pauseSignalBatch(started.id, "Paused by user")?.status, "paused");

  const paused = completeSignalBatchAttempt(started.id, 1, "draw", 70_000);
  assert.equal(paused?.status, "paused");
  assert.equal(paused?.completed, 1);
  assert.equal(paused?.draws, 1);
  assert.equal(resumeSignalBatch(started.id, 80_000)?.status, "running");
  assert.equal(readSignalBatch()?.completed, 1);
});

test("invalid expiry values cannot start a batch", () => {
  values.clear();
  assert.equal(startSignalBatch(61), null);
  assert.equal(readSignalBatch(), null);
});

test.after(() => {
  if (previousWindow) Object.defineProperty(globalThis, "window", previousWindow);
  else Reflect.deleteProperty(globalThis, "window");
});
