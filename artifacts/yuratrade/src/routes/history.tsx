import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, History } from "lucide-react";
import { useEffect, useState } from "react";
import { StatRow } from "@/components/stats";
import { formatExpiry } from "@/lib/expiry";
import {
  readSignalJournal,
  signalJournalCsv,
  subscribeToSignalJournal,
  summarizeByMarket,
  summarizeSignals,
  type JournalOutcome,
  type SignalJournalEntry,
} from "@/lib/signal-journal";

export const Route = createFileRoute("/history")({ component: HistoryPage });

const outcomeLabels: Record<JournalOutcome, string> = {
  pending: "В ожидании",
  win: "Победа",
  loss: "Поражение",
  draw: "Ничья",
};

const outcomeStyles: Record<JournalOutcome, string> = {
  pending: "border-white/10 bg-white/5 text-dim",
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

function formatDate(value: number) {
  return new Intl.DateTimeFormat("ru", {
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
  const [entries, setEntries] = useState<SignalJournalEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const update = () => {
      setEntries(readSignalJournal());
      setLoaded(true);
    };
    update();
    return subscribeToSignalJournal(update);
  }, []);

  const summary = summarizeSignals(entries);
  const markets = summarizeByMarket(entries);
  const recent = entries.slice(0, 50);

  return (
    <div className="space-y-4 sm:space-y-5">
      <header className="rise flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold tracking-[0.16em] text-blue-soft uppercase">Журнал</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-fg sm:text-4xl">История сигналов</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
            Фактические исходы сигналов, закрытых котировкой Pocket Option.
          </p>
        </div>
        <button
          type="button"
          className="btn-ghost min-h-11 w-full justify-center gap-2 sm:w-auto"
          onClick={() => exportCsv(entries)}
          disabled={entries.length === 0}
        >
          <Download className="size-4" />
          Экспорт CSV
        </button>
      </header>

      <div className="rise rise-2">
        <StatRow />
      </div>

      <section className="panel rise rise-3 p-4 sm:p-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-wide text-dim uppercase">Порог безубыточности</p>
            <p className="mt-2 font-mono text-2xl font-extrabold text-fg">
              {percent(summary.breakEvenRate)}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-dim">Расчёт по выплате записанных входов</p>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-wide text-dim uppercase">Условный итог</p>
            <p className={`mt-2 font-mono text-2xl font-extrabold ${summary.netUnits > 0 ? "text-win" : summary.netUnits < 0 ? "text-loss" : "text-fg"}`}>
              {summary.settled === 0 ? "—" : `${summary.netUnits > 0 ? "+" : ""}${summary.netUnits.toFixed(2)} ед.`}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-dim">Каждая запись считается ставкой 1 ед.</p>
          </div>
        </div>
        <p className="mt-4 border-t border-white/8 pt-3 text-xs leading-relaxed text-muted">
          Это локальный журнал фактических исходов, не прогноз. Условный итог не учитывает реальные суммы ставок, комиссии или размер перекрытий. Алгоритм пока эвристический, не ML-модель; история загружается примерно на 40 свечей выбранного периода анализа, поэтому отдельный надёжный backtest не заявляется. CSV содержит период свечей и результаты для последующей проверки.
        </p>
      </section>

      {markets.length > 0 ? (
        <section className="rise rise-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <h2 className="text-base font-bold text-fg">Разбивка по паре и сроку</h2>
            <p className="text-xs text-dim">Ничьи не входят в успешность</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {markets.map((market) => (
              <article key={`${market.symbol}-${market.seconds}`} className="panel min-w-0 p-3 sm:p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-fg">{market.name}</h3>
                    <p className="mt-1 text-xs text-dim">{market.symbol} · экспирация {formatExpiry(market.seconds)}</p>
                  </div>
                  <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs font-mono text-muted">
                    {market.summary.decided} решающих
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-white/4 px-3 py-2">
                    <p className="text-[11px] text-dim">Успешность</p>
                    <p className="mt-1 font-mono font-bold text-fg">{percent(market.summary.hitRate)}</p>
                  </div>
                  <div className="rounded-xl bg-white/4 px-3 py-2">
                    <p className="text-[11px] text-dim">Порог безубыточности</p>
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
            {!loaded ? "Загружаем журнал…" : "Записей пока нет"}
          </p>
          <p className="mt-1 max-w-sm text-sm leading-relaxed text-dim">
            {!loaded
              ? "Читаем сохранённые в этом браузере исходы."
              : "Запись появится, когда сигнал завершится по котировке. Слабые сценарии пропускаются и не считаются сигналами."}
          </p>
          {loaded && entries.length === 0 ? (
            <Link to="/" className="btn-prime mt-4 min-h-11 justify-center">Перейти к сигналам</Link>
          ) : null}
        </section>
      ) : (
        <section className="rise rise-4 space-y-2">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-bold text-fg">Последние сигналы</h2>
            <p className="text-xs text-dim">
              {entries.length > recent.length ? `Последние ${recent.length} из ${entries.length}` : `${entries.length} записей`}
            </p>
          </div>
          {recent.map((entry) => (
            <article key={entry.id} className="panel min-w-0 p-3 sm:p-4">
              <div className="flex min-w-0 items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="truncate font-semibold text-fg">{entry.name}</h3>
                  <p className="mt-1 text-xs text-dim">
                    {formatDate(entry.startedAt)} · экспирация {formatExpiry(entry.seconds)} · свечи {formatExpiry(entry.analysisSeconds)}
                  </p>
                </div>
                <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${outcomeStyles[entry.outcome]}`}>
                  {outcomeLabels[entry.outcome]}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                <div className="rounded-xl bg-white/4 px-3 py-2">
                  <p className="text-dim">Направление</p>
                  <p className={`mt-1 font-semibold ${entry.direction === "call" ? "text-win" : "text-loss"}`}>
                    {entry.direction === "call" ? "Вверх" : "Вниз"}
                  </p>
                </div>
                <div className="rounded-xl bg-white/4 px-3 py-2">
                  <p className="text-dim">Цена</p>
                  <p className="mt-1 font-mono font-semibold text-fg">{price(entry.openPrice, entry.openPrice)} → {price(entry.closePrice, entry.openPrice)}</p>
                </div>
                <div className="rounded-xl bg-white/4 px-3 py-2">
                  <p className="text-dim">Выплата</p>
                  <p className="mt-1 font-mono font-semibold text-fg">{entry.payout}%</p>
                </div>
                <div className="rounded-xl bg-white/4 px-3 py-2">
                  <p className="text-dim">Попытка</p>
                  <p className="mt-1 font-semibold text-fg">{entry.step + 1} из 4</p>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}