import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { loadFeed, takeBest, takeSignal } from "@/lib/pocket-live";
import { levelForBalance, markSignalUsed, signalsUsedToday } from "@/lib/levels";
import { isAdminId, usePocket } from "@/lib/pocket";
import { readSignalJournal, recentlyUsedSignalSymbols } from "@/lib/signal-journal";
import { AnalysisModal } from "@/components/analysis-modal";
import {
  alternativeExpiryMinutes,
  analysisPeriodForExpiry,
  EXPIRY_OPTIONS_MINUTES,
} from "@/lib/expiry";
import { formatExpiryForLanguage, useLanguage } from "@/lib/language";

type PreparedSignal = Extract<Awaited<ReturnType<typeof takeBest>>, { decision: "signal" }>;
type ExpirySuggestion = { minutes: number; candidate: PreparedSignal };

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
  const [phase, setPhase] = useState<"idle" | "search" | "alternatives" | "countdown" | "finalizing">("idle");
  const [prepared, setPrepared] = useState<PreparedSignal | null>(null);
  const [countdown, setCountdown] = useState(10);
  const [feedError, setFeedError] = useState("");
  const [searchError, setSearchError] = useState("");
  const [notice, setNotice] = useState("");
  const [suggestedSignals, setSuggestedSignals] = useState<ExpirySuggestion[]>([]);
  const [alternativesChecked, setAlternativesChecked] = useState(false);
  const [alternativeSearchError, setAlternativeSearchError] = useState("");
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
          setFeedError("");
        })
        .catch((cause: unknown) => {
          if (stop) return;
          setReady(false);
          setFeedStatus("error");
          setFeedError(cause instanceof Error ? cause.message : "Не удалось подключиться к Pocket Option.");
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

  const checkAlternativeExpiries = async (reason: string, selectedExpirySeconds: number, attempt: number) => {
    setPrepared(null);
    setNotice(reason);
    setSearchError("");
    setSuggestedSignals([]);
    setAlternativeSearchError("");
    setAlternativesChecked(false);

    const alternatives = alternativeExpiryMinutes(selectedExpirySeconds / 60);
    if (alternatives.length === 0) {
      setAlternativesChecked(true);
      setPhase("idle");
      return;
    }

    setPhase("alternatives");
    const excludedSymbols = recentlyUsedSignalSymbols(readSignalJournal());
    const found: ExpirySuggestion[] = [];
    let firstError = "";

    const results = await Promise.all(alternatives.map(async (minutes) => {
      if (attemptRef.current !== attempt) return { minutes, result: null, error: "" };
      try {
        const result = await takeBest({
          data: {
            expirySeconds: minutes * 60,
            excludedSymbols,
          },
        });
        return { minutes, result, error: "" };
      } catch (cause) {
        return {
          minutes,
          result: null,
          error: cause instanceof Error ? cause.message : t("signal.none"),
        };
      }
    }));

    if (attemptRef.current !== attempt) return;
    for (const outcome of results) {
      if (outcome.result?.decision === "signal") {
        found.push({ minutes: outcome.minutes, candidate: outcome.result });
      }
      if (!firstError && outcome.error) firstError = outcome.error;
    }
    setSuggestedSignals(found);
    setAlternativeSearchError(firstError);
    setAlternativesChecked(true);
    setPhase("idle");
  };

  const prepareSignal = async (candidate: PreparedSignal, selectedExpirySeconds: number, attempt: number) => {
    setExpiryMinutes(selectedExpirySeconds / 60);
    setPrepared(candidate);
    setCountdown(10);
    setPhase("countdown");

    for (let seconds = 10; seconds > 0; seconds -= 1) {
      if (attemptRef.current !== attempt) return;
      setCountdown(seconds);
      await new Promise<void>((resolve) => window.setTimeout(resolve, 1000));
    }
    if (attemptRef.current !== attempt) return;

    setPhase("finalizing");
    const result = await takeSignal({ data: { symbol: candidate.symbol, expirySeconds: selectedExpirySeconds } });
    if (attemptRef.current !== attempt) return;
    if (result.decision === "pass") {
      await checkAlternativeExpiries(result.reason, selectedExpirySeconds, attempt);
      return;
    }

    if (cap !== null) setUsed(markSignalUsed());
    await navigate({
      to: "/signal",
      search: {
        symbol: candidate.symbol,
        name: result.name,
        group: "fx",
        direction: result.direction,
        open: result.openPrice,
        payout: result.payout,
        seconds: selectedExpirySeconds,
        analysisSeconds: result.analysisSeconds,
        note: result.note,
        bars: result.bars,
        aiConfidence: result.aiConfidence,
        step: 0,
        started: Date.now(),
      },
    });
  };

  const showSearchError = (cause: unknown, attempt: number) => {
    if (attemptRef.current !== attempt) return;
    setPhase("idle");
    setPrepared(null);
    setSearchError(cause instanceof Error ? cause.message : t("signal.none"));
  };

  const ask = async () => {
    if (phase !== "idle" || blocked || !ready) return;
    const attempt = ++attemptRef.current;
    setPhase("search");
    setSearchError("");
    setNotice("");
    setSuggestedSignals([]);
    setAlternativesChecked(false);
    setAlternativeSearchError("");
    try {
      const candidate = await takeBest({
        data: {
          expirySeconds,
          excludedSymbols: recentlyUsedSignalSymbols(readSignalJournal()),
        },
      });
      if (attemptRef.current !== attempt) return;
      if (candidate.decision === "pass") {
        await checkAlternativeExpiries(candidate.reason, expirySeconds, attempt);
        return;
      }
      await prepareSignal(candidate, expirySeconds, attempt);
    } catch (cause) {
      showSearchError(cause, attempt);
    }
  };

  const selectExpirySuggestion = (suggestion: ExpirySuggestion) => {
    if (phase !== "idle" || blocked) return;
    const attempt = ++attemptRef.current;
    setSearchError("");
    void prepareSignal(suggestion.candidate, suggestion.minutes * 60, attempt).catch((cause: unknown) => {
      showSearchError(cause, attempt);
    });
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
        {feedError ? (
          <p className="mb-3 text-center text-xs leading-relaxed text-loss" role="status" aria-live="polite">
            {feedError}
          </p>
        ) : null}
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
            {EXPIRY_OPTIONS_MINUTES.map((minutes) => {
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
            {t("signal.analyzed", { period: expiryLabel(analysisSeconds) })}
          </p>
        </section>
        <button type="button" className="btn-prime mt-4 min-h-12 w-full" disabled={!ready || phase !== "idle" || Boolean(blocked)} onClick={() => void ask()}>
          {phase === "search"
            ? t("signal.checking")
            : phase === "alternatives"
              ? t("signal.alternativesChecking")
            : phase === "countdown"
              ? t("signal.pairReady")
              : phase === "finalizing"
                ? t("signal.finalizing")
                : t("signal.get")}
        </button>
        <p className={`mt-2 text-center text-xs ${blocked ? "text-loss" : "text-dim"}`}>
          {blocked || (admin || cap === null ? t("signal.noLimit") : t("signal.today", { used, cap }))}
        </p>
        {searchError ? (
          <section className="mt-4 rounded-2xl border border-loss/30 bg-loss/8 p-4 text-left" role="alert" aria-live="assertive">
            <p className="text-sm font-semibold text-loss">{t("signal.searchFailed")}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted">{searchError}</p>
            <button
              type="button"
              className="btn-ghost mt-3 min-h-10 w-full justify-center"
              disabled={!ready || phase !== "idle" || Boolean(blocked)}
              onClick={() => void ask()}
            >
              {t("signal.tryAgain")}
            </button>
          </section>
        ) : null}
        {notice && phase === "idle" ? (
          <section
            className="mt-4 overflow-hidden rounded-3xl border border-blue/25 bg-[#0e1420] text-left shadow-[0_18px_50px_rgba(0,0,0,0.24)]"
            role="status"
            aria-live="polite"
          >
            <div className="flex items-start gap-3 border-b border-white/6 bg-gradient-to-r from-blue/10 to-transparent p-4 sm:p-5">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl border border-blue/25 bg-blue/10 text-blue-soft">
                <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden="true">
                  <path d="M12 8v4m0 4h.01M10.3 3.9 2.8 17a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3l-7.5-13.1a2 2 0 0 0-3.4 0Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold tracking-[0.16em] text-blue-soft uppercase">{t("signal.alternativeSearchKicker")}</p>
                <h3 className="mt-1 text-base font-bold leading-snug text-fg sm:text-lg">{t("common.notConfirmed")}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                  {t("signal.noSignalAtExpiry", { expiry: expiryLabel(expirySeconds) })}
                </p>
              </div>
            </div>

            <div className="space-y-4 p-4 sm:p-5">
              <div className="rounded-2xl border border-white/8 bg-black/20 p-3.5">
                <p className="text-[10px] font-bold tracking-[0.14em] text-dim uppercase">{t("signal.reason")}</p>
                <p className="mt-1.5 whitespace-pre-line break-words text-sm leading-relaxed text-muted">{notice}</p>
              </div>

              {suggestedSignals.length > 0 ? (
                <div className="space-y-2.5">
                  <div>
                    <p className="text-sm font-bold text-fg">{t("signal.alternativesFound")}</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted">{t("signal.alternativesFoundBody")}</p>
                  </div>
                  <div className="space-y-2">
                    {suggestedSignals.map((suggestion) => (
                      <button
                        key={suggestion.minutes}
                        type="button"
                        className="group flex min-h-16 w-full items-center justify-between gap-3 rounded-2xl border border-blue/20 bg-[#121b29] px-3.5 py-3 text-left transition hover:border-blue/45 hover:bg-blue/8 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={!ready || phase !== "idle" || Boolean(blocked)}
                        onClick={() => selectExpirySuggestion(suggestion)}
                      >
                        <span className="min-w-0">
                          <span className="block text-base font-bold text-fg">{expiryLabel(suggestion.minutes * 60)}</span>
                          <span className="mt-0.5 block text-xs text-muted">{t("signal.alternativeChoose")}</span>
                        </span>
                        <span className="shrink-0 rounded-full border border-blue/20 bg-blue/10 px-2.5 py-1 text-xs font-semibold text-blue-soft">
                          {t("signal.alternativePayout", { payout: suggestion.candidate.payout })}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : alternativesChecked && !alternativeSearchError ? (
                <p className="rounded-2xl border border-white/8 bg-white/3 p-3.5 text-sm leading-relaxed text-muted">
                  {t("signal.alternativesNone")}
                </p>
              ) : null}

              {alternativeSearchError ? (
                <p className="rounded-2xl border border-loss/25 bg-loss/5 p-3.5 text-sm leading-relaxed text-muted" role="status">
                  {t("signal.alternativesPartial", { error: alternativeSearchError })}
                </p>
              ) : null}

              <button
                type="button"
                className="btn-ghost min-h-11 w-full justify-center"
                disabled={!ready || phase !== "idle" || Boolean(blocked)}
                onClick={() => void ask()}
              >
                {t("signal.tryAgain")}
              </button>
            </div>
          </section>
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
      {phase === "alternatives" ? (
        <AnalysisModal
          pair={t("signal.alternativeSearchKicker")}
          expiry={expiryLabel(expirySeconds)}
          title={t("signal.alternativesChecking")}
          description={t("signal.alternativesCheckingBody")}
        />
      ) : null}
      {phase === "finalizing" && prepared ? <AnalysisModal pair={pairLabel(prepared.name)} expiry={expiryLabel(expirySeconds)} /> : null}
    </div>
  );
}
