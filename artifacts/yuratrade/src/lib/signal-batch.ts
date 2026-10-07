import { isValidExpirySeconds } from "./expiry.ts";

export const SIGNAL_BATCH_TARGET = 20;
export const SIGNAL_BATCH_RETRY_DELAY_MS = 15_000;
export const SIGNAL_BATCH_MAX_SEARCH_FAILURES = 3;

export type SignalBatchStatus = "running" | "stopping" | "paused" | "completed" | "stopped";
export type SignalBatchOutcome = "win" | "loss" | "draw";

export type SignalBatchRun = {
  id: string;
  status: SignalBatchStatus;
  target: number;
  completed: number;
  expirySeconds: number;
  startedAt: number;
  finishedAt?: number;
  wins: number;
  losses: number;
  draws: number;
  consecutiveFailures: number;
  nextAttemptAt: number;
  lastError?: string;
};

const STORAGE_KEY = "prime_signal_batch_v1";
const BATCH_EVENT = "prime:signal-batch-updated";
const statuses = new Set<SignalBatchStatus>(["running", "stopping", "paused", "completed", "stopped"]);

function storage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function normalizeBatch(value: unknown): SignalBatchRun | null {
  if (typeof value !== "object" || value === null) return null;
  const batch = value as Partial<SignalBatchRun>;
  if (
    typeof batch.id !== "string" ||
    !statuses.has(batch.status as SignalBatchStatus) ||
    !Number.isFinite(batch.expirySeconds) ||
    !isValidExpirySeconds(Number(batch.expirySeconds)) ||
    !Number.isFinite(batch.startedAt)
  ) {
    return null;
  }
  const target = SIGNAL_BATCH_TARGET;
  const completed = Math.max(0, Math.min(target, Math.floor(Number(batch.completed) || 0)));
  return {
    id: batch.id,
    status: batch.status as SignalBatchStatus,
    target,
    completed,
    expirySeconds: Number(batch.expirySeconds),
    startedAt: Number(batch.startedAt),
    ...(Number.isFinite(batch.finishedAt) ? { finishedAt: Number(batch.finishedAt) } : {}),
    wins: Math.max(0, Math.floor(Number(batch.wins) || 0)),
    losses: Math.max(0, Math.floor(Number(batch.losses) || 0)),
    draws: Math.max(0, Math.floor(Number(batch.draws) || 0)),
    consecutiveFailures: Math.max(0, Math.floor(Number(batch.consecutiveFailures) || 0)),
    nextAttemptAt: Number.isFinite(batch.nextAttemptAt) ? Number(batch.nextAttemptAt) : Number(batch.startedAt),
    ...(typeof batch.lastError === "string" && batch.lastError.trim()
      ? { lastError: batch.lastError.trim().slice(0, 500) }
      : {}),
  };
}

function writeSignalBatch(batch: SignalBatchRun) {
  const local = storage();
  if (!local) return false;
  try {
    local.setItem(STORAGE_KEY, JSON.stringify(batch));
    window.dispatchEvent(new Event(BATCH_EVENT));
    return true;
  } catch {
    return false;
  }
}

export function readSignalBatch(): SignalBatchRun | null {
  const local = storage();
  if (!local) return null;
  try {
    const raw = local.getItem(STORAGE_KEY);
    return raw ? normalizeBatch(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

function createBatchId() {
  return `signal-test-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function startSignalBatch(expirySeconds: number, now = Date.now()) {
  if (!isValidExpirySeconds(expirySeconds)) return null;
  const batch: SignalBatchRun = {
    id: createBatchId(),
    status: "running",
    target: SIGNAL_BATCH_TARGET,
    completed: 0,
    expirySeconds,
    startedAt: now,
    wins: 0,
    losses: 0,
    draws: 0,
    consecutiveFailures: 0,
    nextAttemptAt: now,
  };
  return writeSignalBatch(batch) ? batch : null;
}

export function completeSignalBatchAttempt(
  id: string,
  position: number,
  outcome: SignalBatchOutcome,
  now = Date.now(),
) {
  const batch = readSignalBatch();
  if (
    !batch ||
    batch.id !== id ||
    (batch.status !== "running" && batch.status !== "stopping" && batch.status !== "paused") ||
    position !== batch.completed + 1
  ) {
    return batch;
  }
  const completed = batch.completed + 1;
  const next: SignalBatchRun = {
    ...batch,
    status: batch.status === "stopping"
      ? "stopped"
      : completed >= batch.target
        ? "completed"
        : batch.status === "paused"
          ? "paused"
          : "running",
    completed,
    wins: batch.wins + Number(outcome === "win"),
    losses: batch.losses + Number(outcome === "loss"),
    draws: batch.draws + Number(outcome === "draw"),
    consecutiveFailures: 0,
    nextAttemptAt: now,
    lastError: undefined,
    ...(completed >= batch.target || batch.status === "stopping" ? { finishedAt: now } : {}),
  };
  return writeSignalBatch(next) ? next : batch;
}

export function recordSignalBatchSearchFailure(id: string, reason: string, now = Date.now()) {
  const batch = readSignalBatch();
  if (!batch || batch.id !== id || batch.status !== "running") return batch;
  const consecutiveFailures = batch.consecutiveFailures + 1;
  const paused = consecutiveFailures >= SIGNAL_BATCH_MAX_SEARCH_FAILURES;
  const next: SignalBatchRun = {
    ...batch,
    status: paused ? "paused" : "running",
    consecutiveFailures,
    nextAttemptAt: paused ? now : now + SIGNAL_BATCH_RETRY_DELAY_MS,
    lastError: reason.trim().slice(0, 500) || "Не удалось подготовить следующий сигнал.",
  };
  return writeSignalBatch(next) ? next : batch;
}

export function resetSignalBatchSearchFailures(id: string, now = Date.now()) {
  const batch = readSignalBatch();
  if (
    !batch ||
    batch.id !== id ||
    batch.status !== "running" ||
    (batch.consecutiveFailures === 0 && !batch.lastError)
  ) {
    return batch;
  }
  const next: SignalBatchRun = {
    ...batch,
    consecutiveFailures: 0,
    nextAttemptAt: now,
    lastError: undefined,
  };
  return writeSignalBatch(next) ? next : batch;
}

export function pauseSignalBatch(id: string, reason: string) {
  const batch = readSignalBatch();
  if (!batch || batch.id !== id || (batch.status !== "running" && batch.status !== "stopping")) {
    return batch;
  }
  const next: SignalBatchRun = {
    ...batch,
    status: "paused",
    lastError: reason.trim().slice(0, 500) || "Пакетный тест приостановлен.",
  };
  return writeSignalBatch(next) ? next : batch;
}

export function resumeSignalBatch(id: string, now = Date.now()) {
  const batch = readSignalBatch();
  if (!batch || batch.id !== id || batch.status !== "paused") return batch;
  const next: SignalBatchRun = {
    ...batch,
    status: "running",
    consecutiveFailures: 0,
    nextAttemptAt: now,
    lastError: undefined,
  };
  return writeSignalBatch(next) ? next : batch;
}

export function requestSignalBatchStop(hasActiveAttempt: boolean, now = Date.now()) {
  const batch = readSignalBatch();
  if (!batch || (batch.status !== "running" && batch.status !== "paused")) return batch;
  const next: SignalBatchRun = {
    ...batch,
    status: hasActiveAttempt ? "stopping" : "stopped",
    ...(hasActiveAttempt ? {} : { finishedAt: now }),
  };
  return writeSignalBatch(next) ? next : batch;
}

export function subscribeToSignalBatch(listener: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(BATCH_EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(BATCH_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}
