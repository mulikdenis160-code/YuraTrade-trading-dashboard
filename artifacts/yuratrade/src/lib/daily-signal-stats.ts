import type { SignalJournalTotals } from "./signal-journal.ts";

export const DAILY_SIGNAL_STATS_STORAGE_KEY = "vprime_daily_signal_stats_v1";

export type DailySignalStatsSnapshot = {
  dayKey: string;
  stats: SignalJournalTotals;
};

export function localSignalStatsDayKey(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

export function millisecondsUntilNextLocalDay(date: Date) {
  const nextDay = new Date(date);
  nextDay.setHours(24, 0, 0, 0);
  return Math.max(1, nextDay.getTime() - date.getTime());
}

export function normalizeDailySignalStatsSnapshot(value: unknown): DailySignalStatsSnapshot | null {
  if (typeof value !== "object" || value === null) return null;
  const candidate = value as Partial<DailySignalStatsSnapshot>;
  if (
    typeof candidate.dayKey !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(candidate.dayKey) ||
    typeof candidate.stats !== "object" ||
    candidate.stats === null
  ) {
    return null;
  }
  const stats = candidate.stats as Partial<SignalJournalTotals>;
  const count = (input: unknown) =>
    Number.isSafeInteger(input) && Number(input) >= 0 ? Number(input) : null;
  const wins = count(stats.wins);
  const losses = count(stats.losses);
  const draws = count(stats.draws);
  if (wins === null || losses === null || draws === null) return null;
  const decided = wins + losses;
  return {
    dayKey: candidate.dayKey,
    stats: {
      settled: wins + losses + draws,
      wins,
      losses,
      draws,
      hitRate: decided > 0 ? (wins / decided) * 100 : null,
    },
  };
}

export function resolveDailySignalStatsSnapshot(
  saved: DailySignalStatsSnapshot | null,
  today: string,
  current: SignalJournalTotals,
): DailySignalStatsSnapshot {
  if (
    saved?.dayKey === today &&
    saved.stats.settled === current.settled &&
    saved.stats.wins === current.wins &&
    saved.stats.losses === current.losses &&
    saved.stats.draws === current.draws &&
    saved.stats.hitRate === current.hitRate
  ) {
    return saved;
  }
  return { dayKey: today, stats: current };
}
