import assert from "node:assert/strict";
import test from "node:test";
import { createKeyedAsyncQueue } from "./async-keyed-queue.ts";
import {
  createRotatingCandidateSelector,
  loadCandidatesInParallel,
} from "./signal-candidate-pool.ts";

test("candidate searches rotate through the full eligible pool in small batches", () => {
  const select = createRotatingCandidateSelector(4);
  const pairs = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

  assert.deepEqual(select(pairs), ["A", "B", "C", "D"]);
  assert.deepEqual(select(pairs), ["E", "F", "G", "H"]);
  assert.deepEqual(select(pairs), ["I", "J", "A", "B"]);
  assert.deepEqual(select(pairs), ["C", "D", "E", "F"]);
});

test("broader eight-pair batches cover more candidates while continuing to rotate", () => {
  const select = createRotatingCandidateSelector(8);
  const pairs = Array.from({ length: 12 }, (_, index) => `PAIR_${index + 1}`);

  assert.deepEqual(select(pairs), pairs.slice(0, 8));
  assert.deepEqual(select(pairs), [...pairs.slice(8), ...pairs.slice(0, 4)]);
});

test("candidate search handles empty and smaller-than-batch pools", () => {
  const select = createRotatingCandidateSelector(4);

  assert.deepEqual(select([]), []);
  assert.deepEqual(select(["A", "B"]), ["A", "B"]);
  assert.deepEqual(select(["A", "B"]), ["A", "B"]);
});

test("candidate selector rejects invalid batch sizes", () => {
  assert.throws(() => createRotatingCandidateSelector(0), /positive integer/);
  assert.throws(() => createRotatingCandidateSelector(1.5), /positive integer/);
});

test("candidate history loads start in parallel and retain independent failures", async () => {
  const started: number[] = [];
  const pending: Array<(value: number) => void> = [];
  const resultPromise = loadCandidatesInParallel([1, 2, 3], async (item) => {
    started.push(item);
    if (item === 2) throw new Error("history failed");
    return new Promise<number>((resolve) => pending.push(resolve));
  });

  assert.deepEqual(started, [1, 2, 3]);
  assert.equal(pending.length, 2);
  pending[0]!(10);
  pending[1]!(30);
  const results = await resultPromise;

  assert.deepEqual(results, [
    { ok: true, item: 1, value: 10 },
    { ok: false, item: 2, error: new Error("history failed") },
    { ok: true, item: 3, value: 30 },
  ]);
});

test("history requests serialize per pair but run independently across pairs", async () => {
  const run = createKeyedAsyncQueue();
  let releaseFirst: () => void = () => {};
  let firstStarted = false;
  let secondStarted = false;
  let otherPairStarted = false;
  const first = run("EURUSD_otc", async () => {
    firstStarted = true;
    await new Promise<void>((resolve) => {
      releaseFirst = resolve;
    });
    return "first";
  });
  const second = run("EURUSD_otc", async () => {
    secondStarted = true;
    return "second";
  });
  const otherPair = run("GBPUSD_otc", async () => {
    otherPairStarted = true;
    return "other";
  });

  await Promise.resolve();
  await Promise.resolve();
  assert.equal(firstStarted, true);
  assert.equal(secondStarted, false);
  assert.equal(otherPairStarted, true);

  releaseFirst();
  assert.deepEqual(await Promise.all([first, second, otherPair]), [
    "first",
    "second",
    "other",
  ]);
  assert.equal(secondStarted, true);
});
