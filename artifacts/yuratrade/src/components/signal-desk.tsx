import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { loadFeed, takeBest } from "@/lib/pocket-live";
import { levelForBalance, markSignalUsed, signalsUsedToday } from "@/lib/levels";
import { isAdminId, usePocket } from "@/lib/pocket";
import { AnalysisModal } from "@/components/analysis-modal";

export function SignalDesk() {
  const navigate = useNavigate();
  const { id } = usePocket();
  const admin = isAdminId(id);
  const [ready, setReady] = useState(false);
  const [feedStatus, setFeedStatus] = useState<"connecting" | "connected" | "error">("connecting");
  const [phase, setPhase] = useState<"idle" | "search">("idle");
  const [error, setError] = useState("");
  const [balance, setBalance] = useState<number | null>(null);
  const [used, setUsed] = useState(0);
  const hasPairs = useRef(false);

  useEffect(() => {
    let stop = false;
    const pull = () => {
      void loadFeed()
        .then((feed) => {
          if (stop) return;
          hasPairs.current = feed.pairs.length > 0;
          setReady(feed.pairs.length > 0);
          setFeedStatus(feed.pairs.length > 0 ? "connected" : "error");
          setBalance(feed.balance);
          setError("");
        })
        .catch((cause: unknown) => {
          if (stop) return;
          hasPairs.current = false;
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
    const started = Date.now();
    try {
      const result = await takeBest();
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
          seconds: result.seconds,
          note: result.note,
          bars: result.bars,
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
        <p className="text-sm leading-relaxed text-muted">Бот сам смотрит пары с выплатой 92% и 80% и берёт самый чистый вход. Срок только 1 или 2 минуты.</p>
        <button type="button" className="btn-prime mt-4 w-full" disabled={!ready || phase === "search" || Boolean(blocked)} onClick={() => void ask()}>
          Получить сигнал
        </button>
        <p className={`mt-2 text-center text-xs ${blocked ? "text-loss" : "text-dim"}`}>
          {blocked || (admin || cap === null ? "Без лимита" : `Сегодня ${used} из ${cap}`)}
        </p>
        {error ? <p className="mt-3 text-sm text-loss">{error}</p> : null}
      </section>
      {phase === "search" ? <AnalysisModal pair="Подбор пары" expiry="1–2 мин" /> : null}
    </div>
  );
}
