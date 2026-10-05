import assert from "node:assert/strict";
import test from "node:test";
import { createRotatingCandidateSelector } from "./signal-candidate-pool.ts";

test("candidate searches rotate through the full eligible pool in small batches", () => {
  const select = createRotatingCandidateSelector(4);
  const pairs = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

  assert.deepEqual(select(pairs), ["A", "B", "C", "D"]);
  assert.deepEqual(select(pairs), ["E", "F", "G", "H"]);
  assert.deepEqual(select(pairs), ["I", "J", "A", "B"]);
  assert.deepEqual(select(pairs), ["C", "D", "E", "F"]);
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
