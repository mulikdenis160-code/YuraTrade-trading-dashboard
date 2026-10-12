import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { chooseSignalPair, confirmSignalEntry, loadFeed, takeSignal } from "@/lib/pocket-live";
import { levelForBalance, markSignalUsed, signalsUsedToday } from "@/lib/levels";
import { isAdminId, usePocket } from "@/lib/pocket";
import {
  readSignalJournal,
  recentlyUsedSignalSymbols,
} from "@/lib/signal-journal";
import {
  readSignalBatch,
  requestSignalBatchStop,
} from "@/lib/signal-batch";
import { AnalysisModal } from "@/components/analysis-modal";
import { copyPairName } from "@/lib/pair-clipboard";
import {
  DEFAULT_SIGNAL_EXPIRY_SECONDS,
  SIGNAL_PAIR_SEARCH_LIMIT,
  SIGNAL_PREPARATION_TIMEOUT_MS,
  SIGNAL_COPY_DELAY_SECONDS,
} from "@/lib/signal-config";
import { settleSignalRequest, waitForSignalRequest } from "@/lib/signal-request";
import { analysisPeriodForExpiry, EXPIRY_OPTIONS_SECONDS } from "@/lib/expiry";
import { formatExpiryForLanguage, useLanguage } from "@/lib/language";
import { visibleSignalReleaseAt } from "@/lib/signal-release-time";

type PairChoice = Awaited<ReturnType<typeof chooseSignalPair>>;
type PreparedSignal = Extract<Awaited<ReturnType<typeof takeSignal>>, { decision: "signal" }>
  & Pick<PairChoice, "symbol" | "group">
  & { seconds: number };
type PendingPair = PairChoice & {
  attempt: number;
  seconds: number;
  copyUntil: number;
};

export function SignalDesk() {
  const navigate = useNavigate();
  const { id, depositAmount } = usePocket();
  const { language, t } = useLanguage();
  const admin = isAdminId(id);
  const [ready, setReady] = useState(false);
  const [expirySeconds, setExpirySeconds] = useState(DEFAULT_SIGNAL_EXPIRY_SECONDS);
  const [feedStatus, setFeedStatus] = useState<"connecting" | "connected" | "error">("connecting");
  const [phase, setPhase] = useState<"idle" | "choosing" | "copy" | "analysis">("idle");
  const [feedError, setFeedError] = useState("");
  const [searchError, setSearchError] = useState("");
  const [notice, setNotice] = useState("");
  const [pendingPair, setPendingPair] = useState<PendingPair | null>(null);
  const [copyRemaining, setCopyRemaining] = useState(SIGNAL_COPY_DELAY_SECONDS);
  const [copiedPair, setCopiedPair] = useState(false);
  const [used, setUsed] = useState(0);
  const attemptRef = useRef(0);

  useEffect(() => () => {
    attemptRef.current += 1;
  }, []);

  useEffect(() => {
    if (phase !== "copy" || !pendingPair) return;
    const update = () => {
      const remaining = Math.max(0, pendingPair.copyUntil - Date.now());
      setCopyRemaining(Math.ceil(remaining / 1000));
    };
    update();
    const timer = window.setInterval(update, 100);
    return () => window.clearInterval(timer);
  }, [pendingPair, phase]);

  useEffect(() => {
    let stop = false;
    const pull = () => {
      void loadFeed()
        .then((feed) => {
          if (stop) return;
          setReady(feed.pairs.length > 0);
          setFeedStatus(feed.pairs.length > 0 ? "connected" : "error");
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
    setUsed(signalsUsedToday(id));
    const timer = window.setInterval(pull, 8000);
    return () => {
      stop = true;
      window.clearInterval(timer);
    };
  }, [id]);

  useEffect(() => {
    const batch = readSignalBatch();
    if (!batch || (batch.status !== "running" && batch.status !== "paused")) return;
    const activePosition = batch.completed + 1;
    const hasActiveSeries = readSignalJournal().some(
      (entry) =>
        entry.batchRunId === batch.id &&
        entry.batchPosition === activePosition &&
        (entry.outcome === "pending" || entry.outcome === "overlay"),
    );
    requestSignalBatchStop(hasActiveSeries);
  }, []);

  const level = levelForBalance(depositAmount);
  const analysisSeconds = analysisPeriodForExpiry(expirySeconds);
  const cap = admin ? null : level ? level.daily : 0;
  const left = cap === null ? null : Math.max(0, cap - used);
  const blocked = admin
    ? ""
      : depositAmount === null
      ? t("signal.block.deposit")
      : !level
        ? t("signal.block.minimum")
        : left === 0
          ? t("signal.block.limit")
          : "";

  const expiryLabel = (seconds: number) => formatExpiryForLanguage(seconds, language);

  const openSignal = async (candidate: PreparedSignal, attempt: number) => {
    if (attemptRef.current !== attempt) return;
    if (cap !== null) setUsed(markSignalUsed(id));
    await navigate({
      to: "/signal",
      search: {
        symbol: candidate.symbol,
        name: candidate.name,
        group: "fx",
        direction: candidate.direction,
        open: candidate.openPrice,
        payout: candidate.payout,
        seconds: candidate.seconds,
        analysisSeconds: candidate.analysisSeconds,
        note: candidate.note,
        bars: candidate.bars,
        aiConfidence: candidate.aiConfidence,
        step: 0,
        started: Date.now(),
      },
    });
  };

  const showSearchError = (cause: unknown, attempt: number) => {
    if (attemptRef.current !== attempt) return;
    setPhase("idle");
    setPendingPair(null);
    const message = cause instanceof Error ? cause.message : t("signal.none");
    setSearchError(message);
  };

  const copySelectedPair = async () => {
    if (!pendingPair) return;
    try {
      await copyPairName(pendingPair.name);
      if (attemptRef.current === pendingPair.attempt) setCopiedPair(true);
    } catch {
      setCopiedPair(false);
    }
  };

  const ask = async () => {
    if (phase !== "idle" || blocked || !ready) return;
    const requestedExpiry = expirySeconds;
    const attempt = ++attemptRef.current;
    const preparationDeadlineAtMs = Date.now() + SIGNAL_PREPARATION_TIMEOUT_MS;
    setPhase("choosing");
    setSearchError("");
    setNotice("");
    setPendingPair(null);
    try {
      const excludedSymbols = recentlyUsedSignalSymbols(readSignalJournal());
      const checkedSymbols = new Set<string>();
      let selected: PendingPair | null = null;
      let prepared: Extract<Awaited<ReturnType<typeof takeSignal>>, { decision: "signal" }> | null = null;
      let lastReason = "";

      for (let index = 0; index < SIGNAL_PAIR_SEARCH_LIMIT; index += 1) {
        const candidateBudgetMs = preparationDeadlineAtMs - Date.now();
        if (candidateBudgetMs <= 0) throw new Error(t("signal.analysisTimeout"));
        const candidate = await waitForSignalRequest(
          settleSignalRequest(chooseSignalPair({
            data: { excludedSymbols: [...excludedSymbols, ...checkedSymbols] },
          })),
          candidateBudgetMs,
          t("signal.analysisTimeout"),
        );
        if (attemptRef.current !== attempt) return;
        if (checkedSymbols.has(candidate.symbol)) break;
        checkedSymbols.add(candidate.symbol);

        const signalBudgetMs = preparationDeadlineAtMs - Date.now();
        if (signalBudgetMs <= 0) throw new Error(lastReason || t("signal.analysisTimeout"));
        let result: Awaited<ReturnType<typeof takeSignal>>;
        try {
          result = await waitForSignalRequest(
            settleSignalRequest(takeSignal({
              data: { symbol: candidate.symbol, expirySeconds: requestedExpiry },
            })),
            Math.min(SIGNAL_PREPARATION_TIMEOUT_MS, signalBudgetMs),
            t("signal.analysisTimeout"),
          );
        } catch (cause) {
          if (attemptRef.current !== attempt) return;
          if (Date.now() >= preparationDeadlineAtMs) throw cause;
          lastReason = cause instanceof Error ? cause.message : t("signal.none");
          console.warn("[signal-pair-skipped]", JSON.stringify({
            symbol: candidate.symbol,
            reason: lastReason,
            remainingMs: preparationDeadlineAtMs - Date.now(),
          }));
          continue;
        }
        if (attemptRef.current !== attempt) return;
        if (result.decision === "pass") {
          lastReason = result.reason;
          continue;
        }
        prepared = result;
        selected = {
          ...candidate,
          attempt,
          seconds: requestedExpiry,
          copyUntil: visibleSignalReleaseAt(result.releaseAtMs, Date.now()),
        };
        break;
      }

      if (!selected || !prepared) {
        setNotice(lastReason || t("signal.none"));
        setPhase("idle");
        return;
      }

      const readyPair = selected;
      setPendingPair(readyPair);
      setCopyRemaining(Math.max(0, Math.ceil((readyPair.copyUntil - Date.now()) / 1000)));
      setCopiedPair(false);
      setPhase("copy");
      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, Math.max(0, readyPair.copyUntil - Date.now()));
      });
      if (attemptRef.current !== attempt) return;
      setPhase("analysis");
      const entry = await confirmSignalEntry({ data: { symbol: readyPair.symbol } });
      if (attemptRef.current !== attempt) return;
      await openSignal(
        { ...prepared, openPrice: entry.openPrice, symbol: readyPair.symbol, group: readyPair.group, seconds: readyPair.seconds },
        attempt,
      );
    } catch (cause) {
      showSearchError(cause, attempt);
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
            {EXPIRY_OPTIONS_SECONDS.map((seconds) => (
              <button
                key={seconds}
                type="button"
                aria-pressed={expirySeconds === seconds}
                aria-label={`${t("signal.expiry")}: ${expiryLabel(seconds)}`}
                disabled={phase !== "idle"}
                onClick={() => setExpirySeconds(seconds)}
                className={`min-h-11 rounded-xl border px-2 py-2 text-xs font-semibold transition disabled:opacity-60 ${
                  expirySeconds === seconds
                    ? "border-blue/40 bg-blue/12 text-blue-soft"
                    : "border-white/10 bg-white/4 text-muted hover:bg-white/8"
                }`}
              >
                {expiryLabel(seconds)}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs leading-relaxed text-dim" aria-live="polite">
            {t("signal.analyzed", { period: expiryLabel(analysisSeconds) })}
          </p>
        </section>
        <button type="button" className="btn-prime mt-4 min-h-12 w-full" disabled={!ready || phase !== "idle" || Boolean(blocked)} onClick={() => void ask()}>
          {phase === "copy" ? t("signal.pairReady") : phase === "idle" ? t("signal.get") : t("signal.checking")}
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
      {phase === "choosing" ? <AnalysisModal pair={t("home.eyebrow")} expiry={expiryLabel(expirySeconds)} /> : null}
      {phase === "copy" && pendingPair ? (
        <AnalysisModal
          pair={pendingPair.name}
          expiry={expiryLabel(pendingPair.seconds)}
          countdown={copyRemaining}
          copied={copiedPair}
          onCopy={() => void copySelectedPair()}
        />
      ) : null}
      {phase === "analysis" && pendingPair ? (
        <AnalysisModal pair={pendingPair.name} expiry={expiryLabel(pendingPair.seconds)} />
      ) : null}
    </div>
  );
}
