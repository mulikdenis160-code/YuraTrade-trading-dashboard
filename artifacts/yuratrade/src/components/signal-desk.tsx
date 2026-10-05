import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { loadFeed, takeBest, takeSignal } from "@/lib/pocket-live";
import { levelForBalance, markSignalUsed, signalsUsedToday } from "@/lib/levels";
import { isAdminId, usePocket } from "@/lib/pocket";
import { AnalysisModal } from "@/components/analysis-modal";
import {
  analysisPeriodForExpiry,
  lookbackForExpiry,
} from "@/lib/expiry";
import { formatExpiryForLanguage, useLanguage } from "@/lib/language";

const expiryOptionsMinutes = [1, 2, 3, 5, 10, 15, 25, 30, 60, 120, 180, 240] as const;
type PreparedSignal = NonNullable<Awaited<ReturnType<typeof takeBest>>>;

function pairLabel(name: string) {
  return name.replace(/\s+OTC$/i, "").trim();
}

export function SignalDesk() {
  const navigate = useNavigate();
  const { id } = usePocket();
  const { language, t } = useLanguage();
  const admin = isAdminId(id);
  const [ready, setReady] = useState(false);
  const [feedStatus, setFeedStatus] = useState<"connecting" | "connected" | "error">("connecting");
  const [phase, setPhase] = useState<"idle" | "search" | "countdown" | "finalizing">("idle");
  const [prepared, setPrepared] = useState<PreparedSignal | null>(null);
  const [countdown, setCountdown] = useState(10);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [balance, setBalance] = useState<number | null>(null);
  const [used, setUsed] = useState(0);
  const [expiryMinutes, setExpiryMinutes] = useState(1);
  const attemptRef = useRef(0);

  useEffect(() => () => {
    attemptRef.current += 1;
  }, []);

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
      ? t("signal.block.deposit")
      : !level
        ? t("signal.block.minimum")
        : left === 0
          ? t("signal.block.limit")
          : "";

  const expiryLabel = (seconds: number) => formatExpiryForLanguage(seconds, language);

  const ask = async () => {
    if (phase !== "idle" || blocked || !ready) return;
    const attempt = ++attemptRef.current;
    setPhase("search");
    setError("");
    setNotice("");
    try {
      const candidate = await takeBest({ data: { expirySeconds } });
      if (attemptRef.current !== attempt) return;
      if (!candidate) {
        setPhase("idle");
        setNotice(t("signal.none"));
        return;
      }
      setPrepared(candidate);
      setPhase("countdown");
      for (let seconds = 10; seconds > 0; seconds -= 1) {
        if (attemptRef.current !== attempt) return;
        setCountdown(seconds);
        await new Promise<void>((resolve) => window.setTimeout(resolve, 1000));
      }
      if (attemptRef.current !== attempt) return;

      setPhase("finalizing");
      const result = await takeSignal({ data: { symbol: candidate.symbol, expirySeconds } });
      if (attemptRef.current !== attempt) return;
      if (!result) {
        setPrepared(null);
        setPhase("idle");
        setNotice(t("signal.pairNoLongerReady"));
        return;
      }
      if (cap !== null) setUsed(markSignalUsed());
      await navigate({
        to: "/signal",
        search: {
          symbol: result.symbol,
          name: result.name,
          group: "fx",
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
      if (attemptRef.current !== attempt) return;
      setPhase("idle");
      setPrepared(null);
      setError(cause instanceof Error ? cause.message : t("signal.none"));
    }
  };

  const cancelCountdown = () => {
    attemptRef.current += 1;
    setPrepared(null);
    setPhase("idle");
    setCountdown(10);
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
            ? t("signal.connected")
            : feedStatus === "error"
              ? t("signal.disconnected")
              : t("signal.connecting")}
        </p>
        <p className="text-sm leading-relaxed text-muted">
          {t("signal.description")}
        </p>
        <p className="mt-2 text-xs leading-relaxed text-dim">
          {t("signal.experimental")}
        </p>
        <section className="mt-4 rounded-2xl border border-white/8 bg-[#080b12]/70 p-3" aria-label={t("signal.expiry")}>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-fg">{t("signal.expiry")}</p>
            <p className="text-sm font-bold text-blue-soft">{expiryLabel(expirySeconds)}</p>
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {expiryOptionsMinutes.map((minutes) => {
              const selected = expiryMinutes === minutes;
              const label = expiryLabel(minutes * 60);
              return (
                <button
                  key={minutes}
                  type="button"
                  disabled={phase !== "idle"}
                  aria-pressed={selected}
                  title={expiryLabel(minutes * 60)}
                  onClick={() => setExpiryMinutes(minutes)}
                  className={`min-h-11 rounded-xl border px-2 py-2 text-xs font-semibold transition ${
                    selected
                      ? "border-blue/40 bg-blue/12 text-blue-soft"
                      : "border-white/10 bg-white/4 text-muted hover:bg-white/8"
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs leading-relaxed text-dim" aria-live="polite">
            {t("signal.analyzed", { period: expiryLabel(analysisSeconds), bars: lookbackBars })}
          </p>
        </section>
        <button type="button" className="btn-prime mt-4 min-h-12 w-full" disabled={!ready || phase !== "idle" || Boolean(blocked)} onClick={() => void ask()}>
          {phase === "search"
            ? t("signal.checking")
            : phase === "countdown"
              ? t("signal.pairReady")
              : phase === "finalizing"
                ? t("signal.finalizing")
                : t("signal.get")}
        </button>
        <p className={`mt-2 text-center text-xs ${blocked ? "text-loss" : "text-dim"}`}>
          {blocked || (admin || cap === null ? t("signal.noLimit") : t("signal.today", { used, cap }))}
        </p>
        {error ? <p className="mt-3 text-sm text-loss">{error}</p> : null}
        {notice ? (
          <p className="mt-3 rounded-xl border border-white/8 bg-white/4 px-3 py-3 text-sm leading-relaxed text-muted" role="status" aria-live="polite">
            {notice}
          </p>
        ) : null}
      </section>
      {phase === "countdown" && prepared ? (
        <section className="panel rise p-5 text-center" role="status" aria-live="polite">
          <p className="text-xs font-semibold tracking-[0.16em] text-blue-soft uppercase">{t("signal.pairChosen")}</p>
          <div className="mt-2 flex items-center justify-center gap-2">
            <h2 className="text-2xl font-extrabold tracking-tight text-fg">{pairLabel(prepared.name)}</h2>
            {/\sOTC$/i.test(prepared.name) ? (
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-semibold tracking-wide text-muted">OTC</span>
            ) : null}
          </div>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">{t("signal.choosePair")}</p>
          <p className="mt-4 font-mono text-6xl font-extrabold tabular-nums text-blue-soft" aria-label={t("signal.countdownRemaining", { seconds: countdown })}>
            {countdown}
          </p>
          <p className="mt-1 text-xs text-dim">{t("signal.countdownUnit")}</p>
          <button type="button" className="btn-ghost mt-4 min-h-10 justify-center" onClick={cancelCountdown}>
            {t("common.cancel")}
          </button>
        </section>
      ) : null}
      {phase === "search" ? <AnalysisModal pair={t("home.eyebrow")} expiry={expiryLabel(expirySeconds)} /> : null}
      {phase === "finalizing" && prepared ? <AnalysisModal pair={pairLabel(prepared.name)} expiry={expiryLabel(expirySeconds)} /> : null}
    </div>
  );
}
