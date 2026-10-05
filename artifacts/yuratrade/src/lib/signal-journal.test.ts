import assert from "node:assert/strict";
import test from "node:test";
import {
  readSignalJournal,
  markExpiredPendingSignals,
  recordSignalOutcome,
  recordSignalStarted,
  signalJournalCsv,
  signalRecordId,
  summarizeSignals,
  type StartedSignal,
  type SignalJournalEntry,
} from "./signal-journal.ts";

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

Object.defineProperty(globalThis, "window", {
  value: fakeWindow,
  configurable: true,
});

test("signal records are local, idempotent, and settle only once", () => {
  const signal: StartedSignal = {
    id: "",
    symbol: "EURUSD_otc",
    name: 'EUR/USD "OTC"',
    group: "fx",
    direction: "call",
    openPrice: 1.0842,
    payout: 92,
    seconds: 60,
    analysisSeconds: 60,
    step: 0,
    startedAt: 1_750_000_000_000,
    ruleScore: 0.31,
    aiProbability: 0.64,
    aiExpectedValue: 0.22,
    aiBrierScore: 0.19,
    aiBaselineBrier: 0.25,
    aiSamples: 420,
    aiValidationTrades: 18,
    aiValidationReturn: 0.14,
    strategyVersion: "consensus-filter-v1",
    note: "Trend agrees",
    bars: [[1.08, 1.09, 1.07, 1.0842]],
  };
  signal.id = signalRecordId(signal);

  assert.equal(recordSignalStarted(signal), true);
  assert.equal(recordSignalStarted(signal), true);
  assert.equal(readSignalJournal().length, 1);
  assert.equal(recordSignalOutcome(signal.id, 1.085, "win"), true);
  assert.equal(recordSignalOutcome(signal.id, 1.086, "loss"), false);
  assert.equal(readSignalJournal()[0].outcome, "win");
  assert.equal(readSignalJournal()[0].aiProbability, 0.64);
});

test("journal statistics use payout-aware break-even and one-unit returns", () => {
  const base: Omit<SignalJournalEntry, "id" | "outcome" | "payout"> = {
    symbol: "EURUSD_otc",
    name: "EUR/USD OTC",
    group: "fx",
    direction: "call",
    openPrice: 1.08,
    seconds: 60,
    analysisSeconds: 60,
    step: 0,
    startedAt: 1,
    ruleScore: 0.3,
    strategyVersion: "consensus-filter-v1",
    note: "",
    bars: [],
  };
  const entries: SignalJournalEntry[] = [
    { ...base, id: "win", payout: 92, outcome: "win" },
    { ...base, id: "loss", payout: 80, outcome: "loss" },
    { ...base, id: "draw", payout: 92, outcome: "draw" },
    { ...base, id: "pending", payout: 92, outcome: "pending" },
  ];
  const summary = summarizeSignals(entries);

  assert.equal(summary.total, 4);
  assert.equal(summary.settled, 3);
  assert.equal(summary.pending, 1);
  assert.equal(summary.decided, 2);
  assert.equal(summary.hitRate, 50);
  assert.ok(Math.abs(summary.netUnits + 0.08) < 1e-10);
  assert.ok(summary.breakEvenRate !== null && summary.breakEvenRate > 53 && summary.breakEvenRate < 55);
});

test("CSV export escapes text fields and includes candle inputs", () => {
  const csv = signalJournalCsv(readSignalJournal());
  assert.match(csv, /EUR\/USD ""OTC""/);
  assert.match(csv, /"candles"/);
  assert.match(csv, /"analysisSeconds"/);
  assert.match(csv, /"aiProbability"/);
  assert.match(csv, /\[\[1\.08,1\.09,1\.07,1\.0842\]\]/);
});

test("expired pending signals become unverified and stay out of hit-rate totals", () => {
  const signal: StartedSignal = {
    id: "",
    symbol: "GBPUSD_otc",
    name: "GBP/USD OTC",
    group: "fx",
    direction: "put",
    openPrice: 1.27,
    payout: 80,
    seconds: 60,
    analysisSeconds: 60,
    step: 0,
    startedAt: 1_750_000_100_000,
    ruleScore: 0.2,
    strategyVersion: "expiry-adaptive-filter-v1",
    note: "",
    bars: [],
  };
  signal.id = signalRecordId(signal);
  recordSignalStarted(signal);

  const entries = markExpiredPendingSignals(signal.startedAt + signal.seconds * 1000 + 120_001, 120_000);
  const saved = entries.find((entry) => entry.id === signal.id);

  assert.equal(saved?.outcome, "unverified");
  const summary = summarizeSignals(saved ? [saved] : []);
  assert.equal(summary.unverified, 1);
  assert.equal(summary.settled, 0);
  assert.equal(summary.hitRate, null);
});

test.after(() => {
  if (previousWindow) Object.defineProperty(globalThis, "window", previousWindow);
  else Reflect.deleteProperty(globalThis, "window");
});