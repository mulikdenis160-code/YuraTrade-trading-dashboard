import { useEffect, useState } from "react";
import {
  readSignalJournalTotals,
  type SignalJournalTotals,
} from "@/lib/signal-journal";
import {
  DAILY_SIGNAL_STATS_STORAGE_KEY,
  localSignalStatsDayKey,
  millisecondsUntilNextLocalDay,
  normalizeDailySignalStatsSnapshot,
  resolveDailySignalStatsSnapshot,
  type DailySignalStatsSnapshot,
} from "@/lib/daily-signal-stats";
import { subscribeToSignalJournal } from "@/lib/signal-journal";
import { useLanguage } from "@/lib/language";

const emptyStats: SignalJournalTotals = {
  settled: 0,
  wins: 0,
  losses: 0,
  draws: 0,
  hitRate: null,
};

function readSavedSnapshot() {
  try {
    const raw = window.localStorage.getItem(DAILY_SIGNAL_STATS_STORAGE_KEY);
    return raw ? normalizeDailySignalStatsSnapshot(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

function saveSnapshot(snapshot: DailySignalStatsSnapshot) {
  try {
    window.localStorage.setItem(DAILY_SIGNAL_STATS_STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // The live journal remains intact if the browser blocks snapshot storage.
  }
}

export function StatRow() {
  const { language, t } = useLanguage();
  const [snapshot, setSnapshot] = useState<DailySignalStatsSnapshot | null>(null);

  useEffect(() => {
    let timer = 0;
    let disposed = false;
    const update = () => {
      if (disposed) return;
      const now = new Date();
      const today = localSignalStatsDayKey(now);
      const saved = readSavedSnapshot();
      const next = resolveDailySignalStatsSnapshot(
        saved,
        today,
        readSignalJournalTotals(),
      );
      if (JSON.stringify(saved) !== JSON.stringify(next)) saveSnapshot(next);
      setSnapshot(next);
      window.clearTimeout(timer);
      timer = window.setTimeout(
        update,
        millisecondsUntilNextLocalDay(now) + 100,
      );
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") update();
    };
    update();
    const unsubscribeJournal = subscribeToSignalJournal(update);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      disposed = true;
      window.clearTimeout(timer);
      unsubscribeJournal();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const stats = snapshot?.stats ?? emptyStats;
  const formattedDay = snapshot
    ? (() => {
        const [year, month, day] = snapshot.dayKey.split("-").map(Number);
        return new Intl.DateTimeFormat(language, {
          year: "numeric",
          month: "short",
          day: "numeric",
        }).format(new Date(year, month - 1, day, 12));
      })()
    : "—";
  const items = [
    { label: t("stats.settled"), value: String(stats.settled), tone: "text-fg" },
    { label: t("stats.wins"), value: String(stats.wins), tone: "text-win" },
    { label: t("stats.losses"), value: String(stats.losses), tone: "text-loss" },
    { label: t("stats.draws"), value: String(stats.draws), tone: "text-muted" },
    {
      label: t("stats.rate"),
      value: stats.hitRate === null ? "—" : `${stats.hitRate.toFixed(1)}%`,
      tone: "text-blue-soft",
    },
  ];

  return (
    <section aria-label={t("stats.title")}>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {items.map((item, index) => (
          <div key={item.label} className="panel arrive min-w-0 px-3 py-3 text-center" style={{ animationDelay: `${index * 70}ms` }}>
            <p className={`font-mono text-2xl font-extrabold ${item.tone}`}>{item.value}</p>
            <p className="mt-1 text-xs font-semibold tracking-wide text-dim uppercase">{item.label}</p>
          </div>
        ))}
      </div>
      <p className="mt-2 text-center text-xs leading-relaxed text-dim">
        {t("stats.source")} · {t("stats.asOf", { date: formattedDay })}
      </p>
      {snapshot && snapshot.stats.settled === 0 ? (
        <p className="mt-1 text-center text-xs text-muted">{t("stats.empty")}</p>
      ) : null}
    </section>
  );
}
