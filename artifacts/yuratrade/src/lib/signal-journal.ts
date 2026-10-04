import { analysisPeriodForExpiry, ANALYSIS_PERIODS_SECONDS } from "./expiry.ts";

export type JournalGroup = "fx" | "crypto" | "stock" | "commodity";
export type JournalOutcome = "pending" | "win" | "loss" | "draw";

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
  outcome: JournalOutcome;
  ruleScore: number;
  strategyVersion: string;
  note: string;
  bars: Array<[number, number, number, number]>;
};

export type StartedSignal = Omit<SignalJournalEntry, "outcome" | "closePrice" | "settledAt">;

export type SignalSummary = {
  total: number;
  settled: number;
  pending: number;
  wins: number;
  losses: number;
  draws: number;
  decided: number;
  hitRate: number | null;
  breakEvenRate: number | null;
  netUnits: number;
};

const STORAGE_KEY = "vprime_signal_journal_v1";
const JOURNAL_EVENT = "vprime:signal-journal-updated";
const MAX_ENTRIES = 500;
const groups = new Set<JournalGroup>(["fx", "crypto", "stock", "commodity"]);
const outcomes = new Set<JournalOutcome>(["pending", "win", "loss", "draw"]);

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
    step: Math.max(0, Math.min(3, Number(entry.step))),
    startedAt: Number(entry.startedAt),
    ...(Number.isFinite(entry.settledAt) ? { settledAt: Number(entry.settledAt) } : {}),
    outcome: entry.outcome as JournalOutcome,
    ruleScore: Number.isFinite(entry.ruleScore) ? Number(entry.ruleScore) : 0,
    strategyVersion: typeof entry.strategyVersion === "string" ? entry.strategyVersion : "unknown",
    note: typeof entry.note === "string" ? entry.note.slice(0, 4000) : "",
    bars,
  };
}

export function readSignalJournal(): SignalJournalEntry[] {
  const local = storage();
  if (!local) return [];
  try {
    const raw = local.getItem(STORAGE_KEY);
    if (!raw) return [];
    const decoded: unknown = JSON.parse(raw);
    if (!Array.isArray(decoded)) return [];
    return decoded
      .map(normalizeEntry)
      .filter((entry): entry is SignalJournalEntry => entry !== null)
      .sort((a, b) => b.startedAt - a.startedAt)
      .slice(0, MAX_ENTRIES);
  } catch {
    return [];
  }
}

function writeSignalJournal(entries: SignalJournalEntry[]) {
  const local = storage();
  if (!local) return false;
  try {
    local.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
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
  if (index < 0 || entries[index].outcome !== "pending") return false;
  const next = [...entries];
  next[index] = { ...next[index], closePrice, outcome, settledAt: Date.now() };
  return writeSignalJournal(next);
}

export function summarizeSignals(entries: SignalJournalEntry[]): SignalSummary {
  let wins = 0;
  let losses = 0;
  let draws = 0;
  let pending = 0;
  let netUnits = 0;
  let breakEvenTotal = 0;
  let decided = 0;

  for (const entry of entries) {
    if (entry.outcome === "pending") {
      pending += 1;
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
    ["ruleScore", (entry) => entry.ruleScore],
    ["strategyVersion", (entry) => entry.strategyVersion],
    ["candles", (entry) => JSON.stringify(entry.bars)],
  ];
  const quote = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;
  return [
    columns.map(([name]) => quote(name)).join(","),
    ...entries.map((entry) => columns.map(([, read]) => quote(read(entry))).join(",")),
  ].join("\r\n");
}