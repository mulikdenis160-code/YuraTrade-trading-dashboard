import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, History } from "lucide-react";
import { useEffect, useState } from "react";
import { StatRow } from "@/components/stats";
import { readSignalBatch, subscribeToSignalBatch, type SignalBatchRun } from "@/lib/signal-batch";
import { MAX_SIGNAL_ATTEMPTS } from "@/lib/signal-config";
import {
  markExpiredPendingSignals,
  readSignalJournal,
  signalJournalCsv,
  subscribeToSignalJournal,
  summarizeByMarket,
  summarizeSignals,
  type JournalOutcome,
  type SignalJournalEntry,
} from "@/lib/signal-journal";
import { formatExpiryForLanguage, useLanguage } from "@/lib/language";

export const Route = createFileRoute("/history")({ component: HistoryPage });

const outcomeStyles: Record<JournalOutcome, string> = {
  pending: "border-white/10 bg-white/5 text-dim",
  unverified: "border-white/10 bg-white/5 text-muted",
  overlay: "border-blue/20 bg-blue/5 text-blue-soft",
  win: "border-win/20 bg-win/10 text-win",
  loss: "border-loss/20 bg-loss/10 text-loss",
  draw: "border-blue/20 bg-blue/10 text-blue-soft",
};

function percent(value: number | null) {
  return value === null ? "—" : `${value.toFixed(1)}%`;
}

function price(value: number | undefined, entry: number) {
  if (value === undefined) return "—";
  const digits = entry >= 100 ? 2 : entry >= 10 ? 3 : 5;
  return value.toFixed(digits);
}

function formatDate(value: number, language: "ru" | "uk" | "en") {
  const locale = language === "en" ? "en-GB" : language === "uk" ? "uk-UA" : "ru-RU";
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

function exportCsv(entries: SignalJournalEntry[]) {
  const blob = new Blob(["\uFEFF", signalJournalCsv(entries)], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `signals-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function HistoryPage() {
  const { language, t } = useLanguage();
  const [entries, setEntries] = useState<SignalJournalEntry[]>([]);
  const [batch, setBatch] = useState<SignalBatchRun | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const updateEntries = () => {
      markExpiredPendingSignals();
      setEntries(readSignalJournal().filter((entry) => entry.group === "fx"));
      setLoaded(true);
    };
    const updateBatch = () => setBatch(readSignalBatch());
    updateEntries();
    updateBatch();
    const unsubscribeJournal = subscribeToSignalJournal(updateEntries);
    const unsubscribeBatch = subscribeToSignalBatch(updateBatch);
    return () => {
      unsubscribeJournal();
      unsubscribeBatch();
    };
  }, []);

  const summary = summarizeSignals(entries);
  const markets = summarizeByMarket(entries);
  const recent = entries.slice(0, 50);
  const expiryLabel = (seconds: number) => formatExpiryForLanguage(seconds, language);
  const outcomeLabels: Record<JournalOutcome, string> = {
    pending: t("outcome.pending"),
    unverified: t("outcome.unverified"),
    overlay: t("outcome.overlay"),
    win: t("outcome.win"),
    loss: t("outcome.loss"),
    draw: t("outcome.draw"),
  };
  const batchStatusLabel = batch
    ? batch.status === "running"
      ? t("batch.running")
      : batch.status === "paused"
        ? t("batch.paused")
        : batch.status === "stopping"
          ? t("batch.stopping")
          : batch.status === "completed"
            ? t("batch.completed")
            : t("batch.stopped")
    : "";

  return (
    <div className="space-y-4 sm:space-y-5">
      <header className="rise flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold tracking-[0.16em] text-blue-soft uppercase">{t("history.kicker")}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-fg sm:text-4xl">{t("history.title")}</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
            {t("history.description")}
          </p>
        </div>
        <button
          type="button"
          className="btn-ghost min-h-11 w-full justify-center gap-2 sm:w-auto"
          onClick={() => exportCsv(entries)}
          disabled={entries.length === 0}
        >
          <Download className="size-4" />
          {t("history.export")}
        </button>
      </header>

      <div className="rise rise-2">
        <StatRow />
      </div>

      {batch ? (
        <section className="panel rise rise-2 p-4 sm:p-5" aria-label={t("batch.title")}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-wide text-blue-soft uppercase">{t("batch.title")}</p>
              <p className="mt-1 text-sm text-fg">{batchStatusLabel} · {expiryLabel(batch.expirySeconds)}</p>
            </div>
            <p className="shrink-0 font-mono text-sm font-bold text-fg">{batch.completed}/{batch.target}</p>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            {[
              [t("batch.wins"), batch.wins, "text-win"],
              [t("batch.losses"), batch.losses, "text-loss"],
              [t("batch.draws"), batch.draws, "text-blue-soft"],
            ].map(([label, value, color]) => (
              <div key={label} className="rounded-xl bg-white/4 px-2 py-2">
                <p className={`font-mono text-lg font-bold ${color}`}>{value}</p>
                <p className="text-[10px] text-dim">{label}</p>
              </div>
            ))}
          </div>
          {batch.lastError ? <p className="mt-3 text-xs leading-relaxed text-muted">{batch.lastError}</p> : null}
        </section>
      ) : null}

      <section className="panel rise rise-3 p-4 sm:p-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-wide text-dim uppercase">{t("history.breakEven")}</p>
            <p className="mt-2 font-mono text-2xl font-extrabold text-fg">
              {percent(summary.breakEvenRate)}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-dim">{t("history.breakEvenHelp")}</p>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-wide text-dim uppercase">{t("history.net")}</p>
            <p className={`mt-2 font-mono text-2xl font-extrabold ${summary.netUnits > 0 ? "text-win" : summary.netUnits < 0 ? "text-loss" : "text-fg"}`}>
              {summary.settled === 0 ? "—" : `${summary.netUnits > 0 ? "+" : ""}${summary.netUnits.toFixed(2)} ${t("history.units")}`}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-dim">{t("history.netHelp")}</p>
          </div>
        </div>
        <p className="mt-4 border-t border-white/8 pt-3 text-xs leading-relaxed text-muted">
          {t("history.disclaimer")}
        </p>
      </section>

      {markets.length > 0 ? (
        <section className="rise rise-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <h2 className="text-base font-bold text-fg">{t("history.byPair")}</h2>
            <p className="text-xs text-dim">{t("history.draws")}</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {markets.map((market) => (
              <article key={`${market.symbol}-${market.seconds}`} className="panel min-w-0 p-3 sm:p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-fg">{market.name}</h3>
                    <p className="mt-1 text-xs text-dim">{market.symbol} · {t("history.expiry")} {expiryLabel(market.seconds)}</p>
                  </div>
                  <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs font-mono text-muted">
                    {market.summary.decided} {t("history.decided")}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-white/4 px-3 py-2">
                    <p className="text-[11px] text-dim">{t("history.hitRate")}</p>
                    <p className="mt-1 font-mono font-bold text-fg">{percent(market.summary.hitRate)}</p>
                  </div>
                  <div className="rounded-xl bg-white/4 px-3 py-2">
                    <p className="text-[11px] text-dim">{t("history.breakEven")}</p>
                    <p className="mt-1 font-mono font-bold text-fg">{percent(market.summary.breakEvenRate)}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {!loaded || entries.length === 0 ? (
        <section className="panel flex min-h-48 flex-col items-center justify-center px-5 py-10 text-center">
          <History className="size-6 text-blue-soft" />
          <p className="mt-3 text-base font-semibold text-fg">
            {!loaded ? t("history.loading") : t("history.empty")}
          </p>
          <p className="mt-1 max-w-sm text-sm leading-relaxed text-dim">
            {!loaded
              ? t("history.reading")
              : t("history.emptyHelp")}
          </p>
          {loaded && entries.length === 0 ? (
            <Link to="/" className="btn-prime mt-4 min-h-11 justify-center">{t("history.goSignals")}</Link>
          ) : null}
        </section>
      ) : (
        <section className="rise rise-4 space-y-2">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-bold text-fg">{t("history.latest")}</h2>
            <p className="text-xs text-dim">
              {entries.length > recent.length
                ? t("history.lastOf", { shown: recent.length, total: entries.length })
                : t("history.records", { total: entries.length })}
            </p>
          </div>
          {recent.map((entry) => (
            <article key={entry.id} className="panel min-w-0 p-3 sm:p-4">
              <div className="flex min-w-0 items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="truncate font-semibold text-fg">{entry.name}</h3>
                  <p className="mt-1 text-xs text-dim">
                    {formatDate(entry.startedAt, language)} · {t("history.expiry")} {expiryLabel(entry.seconds)} · {t("history.candles")} {expiryLabel(entry.analysisSeconds)}
                    {entry.batchPosition ? ` · ${t("history.batchSeries", { current: entry.batchPosition })}` : ""}
                  </p>
                </div>
                <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${outcomeStyles[entry.outcome]}`}>
                  {outcomeLabels[entry.outcome]}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                <div className="rounded-xl bg-white/4 px-3 py-2">
                  <p className="text-dim">{t("history.direction")}</p>
                  <p className={`mt-1 font-semibold ${entry.direction === "call" ? "text-win" : "text-loss"}`}>
                    {t(entry.direction === "call" ? "history.up" : "history.down")}
                  </p>
                </div>
                <div className="rounded-xl bg-white/4 px-3 py-2">
                  <p className="text-dim">{t("history.price")}</p>
                  <p className="mt-1 font-mono font-semibold text-fg">{price(entry.openPrice, entry.openPrice)} → {price(entry.closePrice, entry.openPrice)}</p>
                </div>
                <div className="rounded-xl bg-white/4 px-3 py-2">
                  <p className="text-dim">{t("history.payout")}</p>
                  <p className="mt-1 font-mono font-semibold text-fg">{entry.payout}%</p>
                </div>
                <div className="rounded-xl bg-white/4 px-3 py-2">
                  <p className="text-dim">{t("history.step")}</p>
                  <p className="mt-1 font-semibold text-fg">{t("history.attemptCount", { current: entry.step + 1, total: Math.max(MAX_SIGNAL_ATTEMPTS, entry.step + 1) })}</p>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}