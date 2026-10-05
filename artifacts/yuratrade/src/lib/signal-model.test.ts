import assert from "node:assert/strict";
import test from "node:test";
import type { SignalJournalEntry } from "./signal-journal.ts";
import { assessSignalModel, MIN_MODEL_SAMPLES } from "./signal-model.ts";

function entry(index: number, outcome: SignalJournalEntry["outcome"]): SignalJournalEntry {
  const won = outcome === "win";
  const base = 1.1 + index * 0.00001;
  const bars = Array.from({ length: 8 }, (_, barIndex) => {
    const open = base + barIndex * 0.0001;
    const close = open + (won ? 0.00008 : -0.00008);
    return [open, Math.max(open, close) + 0.00002, Math.min(open, close) - 0.00002, close] as [
      number,
      number,
      number,
      number,
    ];
  });
  return {
    id: `signal-${index}`,
    symbol: "EURUSD",
    name: "EUR/USD",
    group: "fx",
    direction: "call",
    openPrice: base,
    payout: 92,
    seconds: 60,
    analysisSeconds: 60,
    step: 0,
    startedAt: index,
    settledAt: index + 60_000,
    outcome,
    ruleScore: won ? 0.9 : 0.2,
    strategyVersion: "test-only",
    note: "",
    bars,
  };
}

test("signal model waits for enough resolved outcomes", () => {
  const history = Array.from({ length: MIN_MODEL_SAMPLES - 1 }, (_, index) =>
    entry(index, index % 2 === 0 ? "win" : "loss"),
  );
  const result = assessSignalModel(history, entry(1000, "win"));
  assert.equal(result.status, "collecting");
  assert.equal(result.sampleCount, MIN_MODEL_SAMPLES - 1);
  assert.equal(result.probability, undefined);
});

test("signal model only exposes a probability after forward-time validation beats baseline", () => {
  const history = Array.from({ length: 140 }, (_, index) =>
    entry(index, index % 2 === 0 ? "win" : "loss"),
  );
  const result = assessSignalModel(history, entry(1000, "win"));
  assert.equal(result.status, "ready");
  assert.ok(result.probability !== undefined && result.probability > 0.5 && result.probability <= 1);
  assert.ok(result.brierScore !== undefined && result.baselineBrier !== undefined);
  assert.ok(result.brierScore < result.baselineBrier);
});

test("signal model ignores draws, pending outcomes, and non-FX history", () => {
  const history = Array.from({ length: 110 }, (_, index) =>
    entry(index, index % 2 === 0 ? "win" : "loss"),
  );
  history.push(entry(111, "draw"), entry(112, "pending"));
  history.push({ ...entry(113, "win"), group: "crypto" });
  const result = assessSignalModel(history, entry(1000, "win"));
  assert.equal(result.sampleCount, 110);
  assert.equal(result.status, "collecting");
});
