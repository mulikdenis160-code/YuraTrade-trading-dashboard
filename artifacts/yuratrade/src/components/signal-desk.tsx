import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { loadFeed, takeBest } from "@/lib/pocket-live";
import { levelForBalance, markSignalUsed, signalsUsedToday } from "@/lib/levels";
import { isAdminId, usePocket } from "@/lib/pocket";
import { AnalysisModal } from "@/components/analysis-modal";
import {
  analysisPeriodForExpiry,
  formatExpiry,
  lookbackForExpiry,
} from "@/lib/expiry";

const expiryOptionsMinutes = [1, 2, 3, 5, 10, 15, 25, 30, 60, 120, 180, 240] as const;

export function SignalDesk() {
  const navigate = useNavigate();
  const { id } = usePocket();
  const admin = isAdminId(id);
  const [ready, setReady] = useState(false);
  const [feedStatus, setFeedStatus] = useState<"connecting" | "connected" | "error">("connecting");
  const [phase, setPhase] = useState<"idle" | "search">("idle");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [balance, setBalance] = useState<number | null>(null);
  const [used, setUsed] = useState(0);
  const [expiryMinutes, setExpiryMinutes] = useState(1);

  useEffect(() => {
    let stop = false;
    const pull = () => {
      void loadFeed()
        .then((feed) => {
          if (stop) return;
          setReady(feed.pairs.length > 0);
          setFeedStatus(feed.pairs.length > 0 ? "connected" : "error");
          setBalance(feed.balance);
          setError("");
        })
        .catch((cause: unknown) => {
          if (stop) return;
          setReady(false);
          setFeedStatus("error");
          setError(cause instanceof Error ? cause.message : "Не удалось подключиться к Pocket Option.");
        });
    };
    pull();
    setUsed(signalsUsedToday());
    const timer = window.setInterval(pull, 8000);
    return () => {
      stop = true;
      window.clearInterval(timer);
    };
  }, []);

  const level = levelForBalance(balance);
  const expirySeconds = expiryMinutes * 60;
  const analysisSeconds = analysisPeriodForExpiry(expirySeconds);
  const lookbackBars = lookbackForExpiry(expirySeconds, analysisSeconds);
  const cap = admin ? null : level ? level.daily : 0;
  const left = cap === null ? null : Math.max(0, cap - used);
  const blocked = admin
    ? ""
    : balance === null
      ? "Депозит ещё не прочитан"
      : !level
        ? "Для сигналов нужен депозит от $60"
        : left === 0
          ? "Лимит сигналов на сегодня закончился"
          : "";

  const ask = async () => {
    if (phase === "search" || blocked || !ready) return;
    setPhase("search");
    setError("");
    setNotice("");
    const started = Date.now();
    try {
      const result = await takeBest({ data: { expirySeconds } });
      if (!result) {
        setPhase("idle");
        setNotice("Сейчас нет подходящего входа. Наклон и последние свечи должны совпасть; дождитесь следующей проверки.");
        return;
      }
      const wait = Math.max(0, 2400 - (Date.now() - started));
      await new Promise((resolve) => window.setTimeout(resolve, wait));
      if (cap !== null) setUsed(markSignalUsed());
      await navigate({
        to: "/signal",
        search: {
          symbol: result.symbol,
          name: result.name,
          group: result.group,
          direction: result.direction,
          open: result.openPrice,
          payout: result.payout,
          seconds: expirySeconds,
          analysisSeconds: result.analysisSeconds,
          note: result.note,
          bars: result.bars,
          ruleScore: result.ruleScore,
          step: 0,
          started: Date.now(),
        },
      });
    } catch (cause) {
      setPhase("idle");
      setError(cause instanceof Error ? cause.message : "Не удалось получить сигнал.");
    }
  };

  return (
    <div className="mx-auto w-full max-w-md space-y-4">
      <section className="panel p-4">
        <p
          className={`mb-3 flex items-center justify-center gap-2 text-xs font-semibold ${
            feedStatus === "connected" ? "text-win" : feedStatus === "error" ? "text-loss" : "text-dim"
          }`}
          role="status"
          aria-live="polite"
        >
          <span className={feedStatus === "connected" ? "live-dot" : "size-2 rounded-full bg-current"} />
          {feedStatus === "connected"
            ? "Поток Pocket Option подключён"
            : feedStatus === "error"
              ? "Нет подключения к Pocket Option"
              : "Подключаемся к Pocket Option…"}
        </p>
        <p className="text-sm leading-relaxed text-muted">
          Проверяются пары с выплатой 92% и 80%. Выберите экспирацию от 1 минуты до 4 часов; интервал свечей и окно анализа подстроятся под срок. Фильтр пропускает спорные входы.
        </p>
        <p className="mt-2 text-xs leading-relaxed text-dim">
          Порог Rule Score 0,22 — экспериментальное правило, не вероятность выигрыша. Сверяйте его с фактическими результатами в журнале.
        </p>
        <section className="mt-4 rounded-2xl border border-white/8 bg-[#080b12]/70 p-3" aria-label="Настройка экспирации">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-fg">Время экспирации</p>
            <p className="text-sm font-bold text-blue-soft">{formatExpiry(expirySeconds)}</p>
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {expiryOptionsMinutes.map((minutes) => {
              const selected = expiryMinutes === minutes;
              const label = minutes < 120 ? `${minutes} мин` : `${minutes / 60} ч`;
              return (
                <button
                  key={minutes}
                  type="button"
                  aria-pressed={selected}
                  title={formatExpiry(minutes * 60)}
                  onClick={() => setExpiryMinutes(minutes)}
                  className={`min-h-11 rounded-xl border px-2 py-2 text-xs font-semibold transition ${
                    selected
                      ? "border-blue/40 bg-blue/12 text-blue-soft"
                      : "border-white/10 bg-white/4 text-muted hover:bg-white/8"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs leading-relaxed text-dim" aria-live="polite">
            Анализ подстроен: свечи {formatExpiry(analysisSeconds)}, окно {lookbackBars} свечей
          </p>
        </section>
        <button type="button" className="btn-prime mt-4 min-h-12 w-full" disabled={!ready || phase === "search" || Boolean(blocked)} onClick={() => void ask()}>
          {phase === "search" ? "Проверяем пары…" : "Получить сигнал"}
        </button>
        <p className={`mt-2 text-center text-xs ${blocked ? "text-loss" : "text-dim"}`}>
          {blocked || (admin || cap === null ? "Без лимита" : `Сегодня ${used} из ${cap}`)}
        </p>
        {error ? <p className="mt-3 text-sm text-loss">{error}</p> : null}
        {notice ? (
          <p className="mt-3 rounded-xl border border-white/8 bg-white/4 px-3 py-3 text-sm leading-relaxed text-muted" role="status" aria-live="polite">
            {notice}
          </p>
        ) : null}
      </section>
      {phase === "search" ? <AnalysisModal pair="Подбор пары" expiry={formatExpiry(expirySeconds)} /> : null}
    </div>
  );
}
