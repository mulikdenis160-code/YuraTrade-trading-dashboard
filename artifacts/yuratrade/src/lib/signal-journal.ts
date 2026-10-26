import { analysisPeriodForExpiry, ANALYSIS_PERIODS_SECONDS } from "./expiry.ts";
import { SIGNAL_BATCH_TARGET } from "./signal-batch.ts";
import { MAX_OVERLAYS } from "./signal-config.ts";

export type JournalGroup = "fx" | "crypto" | "stock" | "commodity";
export type JournalOutcome = "pending" | "unverified" | "win" | "loss" | "draw" | "overlay";

export type SignalJournalEntry = {
  id: string;
  symbol: string;
  name: string;
  group: JournalGroup;
  direction: "call" | "put";
  openPrice: number;
  closePrice?: number;
  payout: number;
  seconds: number;
  analysisSeconds: number;
  step: number;
  startedAt: number;
  settledAt?: number;
  batchRunId?: string;
  batchPosition?: number;
  outcome: JournalOutcome;
  ruleScore?: number;
  aiConfidence?: number;
  aiProbability?: number;
  aiExpectedValue?: number;
  aiBrierScore?: number;
  aiBaselineBrier?: number;
  aiSamples?: number;
  aiValidationTrades?: number;
  aiValidationReturn?: number;
  strategyVersion: string;
  note: string;
  bars: Array<[number, number, number, number]>;
};

export type StartedSignal = Omit<SignalJournalEntry, "outcome" | "closePrice" | "settledAt">;

export type SignalSummary = {
  total: number;
  settled: number;
  pending: number;
  unverified: number;
  wins: number;
  losses: number;
  draws: number;
  decided: number;
  hitRate: number | null;
  breakEvenRate: number | null;
  netUnits: number;
};

export type SignalJournalTotals = Pick<
  SignalSummary,
  "settled" | "wins" | "losses" | "draws" | "hitRate"
>;
type SignalJournalTotalsByGroup = Record<JournalGroup, SignalJournalTotals>;

const STORAGE_KEY = "vprime_signal_journal_v1";
const JOURNAL_EVENT = "vprime:signal-journal-updated";
const MAX_ENTRIES = 500;
const groups = new Set<JournalGroup>(["fx", "crypto", "stock", "commodity"]);
const outcomes = new Set<JournalOutcome>(["pending", "unverified", "win", "loss", "draw", "overlay"]);

export function classifySignalAttempt(
  direction: "call" | "put",
  move: -1 | 0 | 1,
  step: number,
): Exclude<JournalOutcome, "pending" | "unverified"> {
  if (move === 0) return "draw";
  const won = direction === "call" ? move > 0 : move < 0;
  if (won) return "win";
  return step < MAX_OVERLAYS ? "overlay" : "loss";
}

export function signalPriceMove(openPrice: number, closePrice: number): -1 | 0 | 1 {
  if (closePrice > openPrice) return 1;
  if (closePrice < openPrice) return -1;
  return 0;
}

export function signalRecordId(signal: Pick<StartedSignal, "symbol" | "startedAt" | "step">) {
  return `${signal.startedAt}:${signal.step}:${signal.symbol}`;
}

function storage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function normalizeEntry(value: unknown): SignalJournalEntry | null {
  if (!value || typeof value !== "object") return null;
  const entry = value as Partial<SignalJournalEntry>;
  if (
    typeof entry.id !== "string" ||
    typeof entry.symbol !== "string" ||
    typeof entry.name !== "string" ||
    !groups.has(entry.group as JournalGroup) ||
    (entry.direction !== "call" && entry.direction !== "put") ||
    !outcomes.has(entry.outcome as JournalOutcome) ||
    !Number.isFinite(entry.openPrice) ||
    !Number.isFinite(entry.payout) ||
    !Number.isFinite(entry.seconds) ||
    !Number.isFinite(entry.startedAt) ||
    !Number.isFinite(entry.step)
  ) {
    return null;
  }

  const bars = Array.isArray(entry.bars)
    ? entry.bars
        .filter(
          (bar): bar is [number, number, number, number] =>
            Array.isArray(bar) && bar.length === 4 && bar.every((price) => Number.isFinite(price)),
        )
        .slice(-32)
    : [];
  const seconds = Math.max(60, Math.min(14400, Math.round(Number(entry.seconds) / 60) * 60));
  const legacyAnalysisSeconds = [60, 120, 180, 300, 900].includes(seconds)
    ? seconds
    : analysisPeriodForExpiry(seconds);
  const providedAnalysisSeconds = Number(entry.analysisSeconds);
  const analysisSeconds = (ANALYSIS_PERIODS_SECONDS as readonly number[]).includes(providedAnalysisSeconds)
    ? providedAnalysisSeconds
    : legacyAnalysisSeconds;
  const step = Math.max(0, Math.min(3, Number(entry.step)));
  const closePrice = Number(entry.closePrice);
  const outcome =
    entry.outcome === "draw" &&
    Number.isFinite(closePrice) &&
    signalPriceMove(Number(entry.openPrice), closePrice) !== 0
      ? classifySignalAttempt(
          entry.direction,
          signalPriceMove(Number(entry.openPrice), closePrice),
          step,
        )
      : (entry.outcome as JournalOutcome);

  return {
    id: entry.id,
    symbol: entry.symbol,
    name: entry.name,
    group: entry.group as JournalGroup,
    direction: entry.direction,
    openPrice: Number(entry.openPrice),
    ...(Number.isFinite(entry.closePrice) ? { closePrice: Number(entry.closePrice) } : {}),
    payout: Math.max(0, Math.min(100, Number(entry.payout))),
    seconds,
    analysisSeconds,
    step,
    startedAt: Number(entry.startedAt),
    ...(Number.isFinite(entry.settledAt) ? { settledAt: Number(entry.settledAt) } : {}),
    ...(typeof entry.batchRunId === "string" && entry.batchRunId.length <= 120
      ? { batchRunId: entry.batchRunId }
      : {}),
    ...(Number.isFinite(entry.batchPosition)
      ? {
          batchPosition: Math.max(
            1,
            Math.min(SIGNAL_BATCH_TARGET, Math.floor(Number(entry.batchPosition))),
          ),
        }
      : {}),
    outcome,
    ...(Number.isFinite(entry.ruleScore) ? { ruleScore: Number(entry.ruleScore) } : {}),
    ...(Number.isFinite(entry.aiConfidence)
      ? { aiConfidence: Math.max(0, Math.min(100, Math.round(Number(entry.aiConfidence)))) }
      : {}),
    ...(Number.isFinite(entry.aiProbability)
      ? { aiProbability: Math.max(0, Math.min(1, Number(entry.aiProbability))) }
      : {}),
    ...(Number.isFinite(entry.aiExpectedValue) ? { aiExpectedValue: Number(entry.aiExpectedValue) } : {}),
    ...(Number.isFinite(entry.aiBrierScore) ? { aiBrierScore: Number(entry.aiBrierScore) } : {}),
    ...(Number.isFinite(entry.aiBaselineBrier) ? { aiBaselineBrier: Number(entry.aiBaselineBrier) } : {}),
    ...(Number.isFinite(entry.aiSamples) ? { aiSamples: Math.max(0, Number(entry.aiSamples)) } : {}),
    ...(Number.isFinite(entry.aiValidationTrades)
      ? { aiValidationTrades: Math.max(0, Number(entry.aiValidationTrades)) }
      : {}),
    ...(Number.isFinite(entry.aiValidationReturn) ? { aiValidationReturn: Number(entry.aiValidationReturn) } : {}),
    strategyVersion: typeof entry.strategyVersion === "string" ? entry.strategyVersion : "unknown",
    note: typeof entry.note === "string" ? entry.note.slice(0, 4000) : "",
    bars,
  };
}

type StoredSignalJournal = {
  entries: SignalJournalEntry[];
  totals: SignalJournalTotalsByGroup;
};

function totalsFromEntries(entries: SignalJournalEntry[]): SignalJournalTotalsByGroup {
  return {
    fx: totalsForGroup(entries, "fx"),
    crypto: totalsForGroup(entries, "crypto"),
    stock: totalsForGroup(entries, "stock"),
    commodity: totalsForGroup(entries, "commodity"),
  };
}

function totalsForGroup(entries: SignalJournalEntry[], group: JournalGroup): SignalJournalTotals {
  const summary = summarizeSignals(entries.filter((entry) => entry.group === group));
  return {
    settled: summary.settled,
    wins: summary.wins,
    losses: summary.losses,
    draws: summary.draws,
    hitRate: summary.hitRate,
  };
}

function normalizeStoredTotals(value: unknown): SignalJournalTotalsByGroup | null {
  if (typeof value !== "object" || value === null) return null;
  const candidate = value as Partial<Record<JournalGroup, unknown>>;
  const count = (input: unknown) =>
    Number.isFinite(input) && Number(input) >= 0
      ? Math.min(Number.MAX_SAFE_INTEGER, Math.floor(Number(input)))
      : null;
  const normalized = {} as SignalJournalTotalsByGroup;
  for (const group of groups) {
    const rawGroup = candidate[group];
    if (typeof rawGroup !== "object" || rawGroup === null) return null;
    const groupTotals = rawGroup as Partial<SignalJournalTotals>;
    const wins = count(groupTotals.wins);
    const losses = count(groupTotals.losses);
    const draws = count(groupTotals.draws);
    if (wins === null || losses === null || draws === null) return null;
    const decided = wins + losses;
    normalized[group] = {
      settled: wins + losses + draws,
      wins,
      losses,
      draws,
      hitRate: decided > 0 ? (wins / decided) * 100 : null,
    };
  }
  return normalized;
}

function emptyStoredTotals(): SignalJournalTotalsByGroup {
  const empty: SignalJournalTotals = {
    settled: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    hitRate: null,
  };
  return { fx: { ...empty }, crypto: { ...empty }, stock: { ...empty }, commodity: { ...empty } };
}

function isCountedOutcome(outcome: JournalOutcome | undefined): outcome is "win" | "loss" | "draw" {
  return outcome === "win" || outcome === "loss" || outcome === "draw";
}

function readStoredSignalJournal(local: Storage): StoredSignalJournal | null {
  const raw = local.getItem(STORAGE_KEY);
  if (!raw) return null;
  const decoded: unknown = JSON.parse(raw);
  const envelope =
    typeof decoded === "object" &&
    decoded !== null &&
    !Array.isArray(decoded) &&
    (decoded as { version?: unknown }).version === 2
      ? (decoded as { entries?: unknown; totals?: unknown })
      : null;
  const rawEntries = Array.isArray(decoded) ? decoded : envelope?.entries;
  if (!Array.isArray(rawEntries)) return null;
  const entries = rawEntries
    .map(normalizeEntry)
    .filter((entry): entry is SignalJournalEntry => entry !== null)
    .sort((a, b) => b.startedAt - a.startedAt)
    .slice(0, MAX_ENTRIES);
  const totals = normalizeStoredTotals(envelope?.totals) ?? totalsFromEntries(entries);
  const entriesById = new Map(entries.map((entry) => [entry.id, entry]));
  for (const rawEntry of rawEntries) {
    if (!rawEntry || typeof rawEntry !== "object") continue;
    const previous = rawEntry as Partial<SignalJournalEntry>;
    if (previous.outcome !== "draw" || typeof previous.id !== "string") continue;
    const corrected = entriesById.get(previous.id);
    if (!corrected || corrected.outcome === "draw") continue;
    const groupTotals = totals[corrected.group];
    const wins = groupTotals.wins + Number(corrected.outcome === "win");
    const losses = groupTotals.losses + Number(corrected.outcome === "loss");
    const draws = Math.max(0, groupTotals.draws - 1);
    const settled = Math.max(0, groupTotals.settled - 1) +
      Number(corrected.outcome === "win" || corrected.outcome === "loss");
    const decided = wins + losses;
    totals[corrected.group] = {
      settled,
      wins,
      losses,
      draws,
      hitRate: decided > 0 ? (wins / decided) * 100 : null,
    };
  }
  return {
    entries,
    totals,
  };
}

export function readSignalJournal(): SignalJournalEntry[] {
  const local = storage();
  if (!local) return [];
  try {
    return readStoredSignalJournal(local)?.entries ?? [];
  } catch {
    return [];
  }
}

export function readSignalJournalTotals(group: JournalGroup = "fx"): SignalJournalTotals {
  const local = storage();
  if (!local) return emptyStoredTotals()[group];
  try {
    return readStoredSignalJournal(local)?.totals[group] ?? emptyStoredTotals()[group];
  } catch {
    return emptyStoredTotals()[group];
  }
}

function writeSignalJournal(entries: SignalJournalEntry[]) {
  const local = storage();
  if (!local) return false;
  try {
    const previous = readStoredSignalJournal(local);
    const nextEntries = entries.slice(0, MAX_ENTRIES);
    const previousById = new Map((previous?.entries ?? []).map((entry) => [entry.id, entry]));
    const totals = previous?.totals ?? emptyStoredTotals();
    const nextTotals = { ...totals };
    for (const entry of nextEntries) {
      const priorOutcome = previousById.get(entry.id)?.outcome;
      if (!isCountedOutcome(priorOutcome) && isCountedOutcome(entry.outcome)) {
        const groupTotals = nextTotals[entry.group];
        const wins = groupTotals.wins + Number(entry.outcome === "win");
        const losses = groupTotals.losses + Number(entry.outcome === "loss");
        const draws = groupTotals.draws + Number(entry.outcome === "draw");
        const decided = wins + losses;
        nextTotals[entry.group] = {
          settled: wins + losses + draws,
          wins,
          losses,
          draws,
          hitRate: decided > 0 ? (wins / decided) * 100 : null,
        };
      }
    }
    local.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 2, entries: nextEntries, totals: nextTotals }),
    );
    if (typeof window !== "undefined") window.dispatchEvent(new Event(JOURNAL_EVENT));
    return true;
  } catch {
    return false;
  }
}

export function recordSignalStarted(signal: StartedSignal) {
  const entry = normalizeEntry({ ...signal, outcome: "pending" });
  if (!entry) return false;
  const entries = readSignalJournal();
  if (entries.some((saved) => saved.id === entry.id)) return true;
  return writeSignalJournal([entry, ...entries].sort((a, b) => b.startedAt - a.startedAt));
}

export function recordSignalOutcome(
  id: string,
  closePrice: number,
  outcome: Exclude<JournalOutcome, "pending">,
) {
  if (!Number.isFinite(closePrice)) return false;
  const entries = readSignalJournal();
  const index = entries.findIndex((entry) => entry.id === id);
  if (index < 0) return false;
  if (entries[index].outcome !== "pending") return entries[index].outcome === outcome;
  const next = [...entries];
  next[index] = { ...next[index], closePrice, outcome, settledAt: Date.now() };
  return writeSignalJournal(next);
}

export function markExpiredPendingSignals(now = Date.now(), graceMs = 120_000) {
  const entries = readSignalJournal();
  let changed = false;
  const next = entries.map((entry) => {
    if (entry.outcome !== "pending" || now <= entry.startedAt + entry.seconds * 1000 + graceMs) {
      return entry;
    }
    changed = true;
    return { ...entry, outcome: "unverified" as const };
  });
  if (changed) writeSignalJournal(next);
  return changed ? next : entries;
}

export function markSignalUnverified(id: string, settledAt = Date.now()) {
  const entries = readSignalJournal();
  const index = entries.findIndex((entry) => entry.id === id);
  if (index < 0) return false;
  if (entries[index].outcome !== "pending") return entries[index].outcome === "unverified";
  const next = [...entries];
  next[index] = { ...next[index], outcome: "unverified", settledAt };
  return writeSignalJournal(next);
}

export function summarizeSignals(entries: SignalJournalEntry[]): SignalSummary {
  let wins = 0;
  let losses = 0;
  let draws = 0;
  let pending = 0;
  let unverified = 0;
  let netUnits = 0;
  let breakEvenTotal = 0;
  let decided = 0;

  for (const entry of entries) {
    if (entry.outcome === "pending") {
      pending += 1;
      continue;
    }
    if (entry.outcome === "overlay") continue;
    if (entry.outcome === "unverified") {
      unverified += 1;
      continue;
    }
    if (entry.outcome === "draw") {
      draws += 1;
      continue;
    }
    decided += 1;
    breakEvenTotal += 100 / (100 + entry.payout);
    if (entry.outcome === "win") {
      wins += 1;
      netUnits += entry.payout / 100;
    } else {
      losses += 1;
      netUnits -= 1;
    }
  }

  const settled = wins + losses + draws;
  return {
    total: entries.length,
    settled,
    pending,
    unverified,
    wins,
    losses,
    draws,
    decided,
    hitRate: decided > 0 ? (wins / decided) * 100 : null,
    breakEvenRate: decided > 0 ? (breakEvenTotal / decided) * 100 : null,
    netUnits,
  };
}

export function summarizeByMarket(entries: SignalJournalEntry[]) {
  const buckets = new Map<string, SignalJournalEntry[]>();
  for (const entry of entries) {
    const key = `${entry.symbol}\u0000${entry.seconds}`;
    buckets.set(key, [...(buckets.get(key) ?? []), entry]);
  }

  return [...buckets.values()]
    .map((group) => ({
      symbol: group[0].symbol,
      name: group[0].name,
      seconds: group[0].seconds,
      summary: summarizeSignals(group),
    }))
    .sort(
      (a, b) =>
        b.summary.decided - a.summary.decided ||
        a.name.localeCompare(b.name) ||
        a.seconds - b.seconds,
    );
}

export function recentlyUsedSignalSymbols(
  entries: SignalJournalEntry[],
  now = Date.now(),
  cooldownMs = 15 * 60_000,
  limit = 12,
) {
  const recent = entries
    .filter((entry) => {
      if (entry.group !== "fx") return false;
      if (entry.outcome === "pending") return true;
      return (entry.settledAt ?? entry.startedAt) >= now - cooldownMs;
    })
    .sort(
      (a, b) =>
        (b.settledAt ?? b.startedAt) - (a.settledAt ?? a.startedAt) ||
        b.startedAt - a.startedAt,
    );
  const symbols = new Set<string>();
  for (const entry of recent) {
    symbols.add(entry.symbol);
    if (symbols.size >= Math.max(0, Math.min(24, Math.floor(limit)))) break;
  }
  return [...symbols];
}

export function subscribeToSignalJournal(listener: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(JOURNAL_EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(JOURNAL_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}

export function signalJournalCsv(entries: SignalJournalEntry[]) {
  const columns: Array<[string, (entry: SignalJournalEntry) => string | number]> = [
    ["startedAt", (entry) => new Date(entry.startedAt).toISOString()],
    ["batchRunId", (entry) => entry.batchRunId ?? ""],
    ["batchPosition", (entry) => entry.batchPosition ?? ""],
    ["symbol", (entry) => entry.symbol],
    ["name", (entry) => entry.name],
    ["direction", (entry) => entry.direction],
    ["seconds", (entry) => entry.seconds],
    ["analysisSeconds", (entry) => entry.analysisSeconds],
    ["payout", (entry) => entry.payout],
    ["openPrice", (entry) => entry.openPrice],
    ["closePrice", (entry) => entry.closePrice ?? ""],
    ["outcome", (entry) => entry.outcome],
    ["step", (entry) => entry.step],
    ["ruleScore", (entry) => entry.ruleScore ?? ""],
    ["aiConfidence", (entry) => entry.aiConfidence ?? ""],
    ["aiProbability", (entry) => entry.aiProbability ?? ""],
    ["aiExpectedValue", (entry) => entry.aiExpectedValue ?? ""],
    ["aiBrierScore", (entry) => entry.aiBrierScore ?? ""],
    ["aiBaselineBrier", (entry) => entry.aiBaselineBrier ?? ""],
    ["aiSamples", (entry) => entry.aiSamples ?? ""],
    ["aiValidationTrades", (entry) => entry.aiValidationTrades ?? ""],
    ["aiValidationReturn", (entry) => entry.aiValidationReturn ?? ""],
    ["strategyVersion", (entry) => entry.strategyVersion],
    ["candles", (entry) => JSON.stringify(entry.bars)],
  ];
  const quote = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;
  return [
    columns.map(([name]) => quote(name)).join(","),
    ...entries.map((entry) => columns.map(([, read]) => quote(read(entry))).join(",")),
  ].join("\r\n");
}