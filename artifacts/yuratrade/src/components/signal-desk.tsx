import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { chooseSignalPair, confirmSignalEntry, loadFeed, takeSignal } from "@/lib/pocket-live";
import { levelForBalance, markSignalUsed, signalsUsedToday } from "@/lib/levels";
import { isAdminId, usePocket } from "@/lib/pocket";
import {
  markSignalUnverified,
  readSignalJournal,
  recentlyUsedSignalSymbols,
} from "@/lib/signal-journal";
import {
  completeSignalBatchAttempt,
  pauseSignalBatch,
  readSignalBatch,
  recordSignalBatchSearchFailure,
  requestSignalBatchStop,
  resetSignalBatchSearchFailures,
  resumeSignalBatch,
  startSignalBatch,
  subscribeToSignalBatch,
  type SignalBatchRun,
} from "@/lib/signal-batch";
import { AnalysisModal } from "@/components/analysis-modal";
import { copyPairName } from "@/lib/pair-clipboard";
import {
  SIGNAL_PAIR_SEARCH_LIMIT,
  SIGNAL_PREPARATION_TIMEOUT_MS,
  SIGNAL_COPY_DELAY_SECONDS,
} from "@/lib/signal-config";
import { settleSignalRequest, waitForSignalRequest } from "@/lib/signal-request";
import {
  analysisPeriodForExpiry,
  EXPIRY_OPTIONS_MINUTES,
} from "@/lib/expiry";
import { formatExpiryForLanguage, useLanguage } from "@/lib/language";

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
  const { id } = usePocket();
  const { language, t } = useLanguage();
  const admin = isAdminId(id);
  const [ready, setReady] = useState(false);
  const [feedStatus, setFeedStatus] = useState<"connecting" | "connected" | "error">("connecting");
  const [phase, setPhase] = useState<"idle" | "choosing" | "copy" | "analysis">("idle");
  const [feedError, setFeedError] = useState("");
  const [searchError, setSearchError] = useState("");
  const [notice, setNotice] = useState("");
  const [pendingPair, setPendingPair] = useState<PendingPair | null>(null);
  const [copyRemaining, setCopyRemaining] = useState(SIGNAL_COPY_DELAY_SECONDS);
  const [copiedPair, setCopiedPair] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [used, setUsed] = useState(0);
  const [expiryMinutes, setExpiryMinutes] = useState(2);
  const [batch, setBatch] = useState<SignalBatchRun | null>(null);
  const [batchLoaded, setBatchLoaded] = useState(false);
  const [batchNow, setBatchNow] = useState(Date.now());
  const [batchMessage, setBatchMessage] = useState("");
  const attemptRef = useRef(0);
  const autoBatchKeyRef = useRef("");
  const askRef = useRef<((batchRun: SignalBatchRun | null) => Promise<void>) | null>(null);

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

  useEffect(() => {
    const update = () => {
      setBatch(readSignalBatch());
      setBatchLoaded(true);
    };
    update();
    return subscribeToSignalBatch(update);
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

  const hasActiveBatchSeries = (run: SignalBatchRun) => readSignalJournal().some(
    (entry) =>
      entry.batchRunId === run.id &&
      entry.batchPosition === run.completed + 1 &&
      (entry.outcome === "pending" || entry.outcome === "overlay"),
  );

  const openSignal = async (
    candidate: PreparedSignal,
    attempt: number,
    batchRun: SignalBatchRun | null,
    batchPosition: number | null,
  ) => {
    if (attemptRef.current !== attempt) return;
    if (batchRun) {
      const current = readSignalBatch();
      if (
        !current ||
        current.id !== batchRun.id ||
        current.status !== "running" ||
        current.completed + 1 !== batchPosition
      ) {
        setPhase("idle");
        return;
      }
    }
    if (cap !== null) setUsed(markSignalUsed());
    if (batchRun) resetSignalBatchSearchFailures(batchRun.id);
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
        ...(batchRun && batchPosition !== null
          ? { batchRunId: batchRun.id, batchPosition }
          : {}),
      },
    });
  };

  const showSearchError = (
    cause: unknown,
    attempt: number,
    batchRun: SignalBatchRun | null,
  ) => {
    if (attemptRef.current !== attempt) return;
    setPhase("idle");
    setPendingPair(null);
    const message = cause instanceof Error ? cause.message : t("signal.none");
    setSearchError(message);
    if (batchRun) {
      const updated = recordSignalBatchSearchFailure(batchRun.id, message);
      setBatch(updated);
    }
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

  const ask = async (requestedBatch: SignalBatchRun | null = null) => {
    if (phase !== "idle" || blocked || !ready) return;
    const batchRun = requestedBatch?.status === "running" ? requestedBatch : null;
    const batchPosition = batchRun ? batchRun.completed + 1 : null;
    const requestedExpiry = batchRun?.expirySeconds ?? expirySeconds;
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
        if (signalBudgetMs <= 0) throw new Error(t("signal.analysisTimeout"));
        const result = await waitForSignalRequest(
          settleSignalRequest(takeSignal({
            data: { symbol: candidate.symbol, expirySeconds: requestedExpiry },
          })),
          signalBudgetMs,
          t("signal.analysisTimeout"),
        );
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
          copyUntil: result.releaseAtMs,
        };
        break;
      }

      if (!selected || !prepared) {
        setNotice(lastReason || t("signal.none"));
        setPhase("idle");
        if (batchRun) {
          setBatch(recordSignalBatchSearchFailure(batchRun.id, lastReason || t("signal.none")));
        }
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
        batchRun,
        batchPosition,
      );
    } catch (cause) {
      showSearchError(cause, attempt, batchRun);
    }
  };

  askRef.current = ask;

  useEffect(() => {
    if (
      !batchLoaded ||
      !batch ||
      batch.status !== "running" ||
      phase !== "idle" ||
      !ready ||
      Boolean(blocked)
    ) {
      return;
    }

    const position = batch.completed + 1;
    const initialEntries = readSignalJournal().filter(
      (entry) => entry.batchRunId === batch.id && entry.batchPosition === position,
    );
    for (const entry of initialEntries) {
      if (
        entry.outcome === "pending" &&
        Date.now() > entry.startedAt + entry.seconds * 1000 + 10_000
      ) {
        markSignalUnverified(entry.id);
        pauseSignalBatch(batch.id, "Котировку не удалось сверить в срок экспирации.");
      }
    }
    const entries = readSignalJournal()
      .filter((entry) => entry.batchRunId === batch.id && entry.batchPosition === position)
      .sort((a, b) => a.step - b.step || a.startedAt - b.startedAt);
    const last = entries.at(-1);

    if (last && (last.outcome === "win" || last.outcome === "draw" || last.outcome === "loss")) {
      const reconciled = completeSignalBatchAttempt(batch.id, position, last.outcome);
      setBatch(reconciled);
      if (!reconciled || reconciled.completed < position) {
        setBatch(pauseSignalBatch(batch.id, "Не удалось сохранить завершение серии."));
      }
      return;
    }
    if (last?.outcome === "unverified") {
      setBatch(pauseSignalBatch(batch.id, "Исход не удалось подтвердить котировкой."));
      return;
    }

    if (last && (last.outcome === "pending" || last.outcome === "overlay")) {
      const resumeKey = `resume:${batch.id}:${position}:${last.id}:${last.outcome}`;
      if (autoBatchKeyRef.current === resumeKey) return;
      autoBatchKeyRef.current = resumeKey;
      void navigate({
        to: "/signal",
        search: {
          symbol: last.symbol,
          name: last.name,
          group: "fx",
          direction: last.direction,
          open: last.openPrice,
          payout: last.payout,
          seconds: last.seconds,
          analysisSeconds: last.analysisSeconds,
          note: last.note,
          bars: last.bars,
          aiConfidence: last.aiConfidence ?? null,
          step: last.step,
          started: last.startedAt,
          batchRunId: batch.id,
          batchPosition: position,
        },
      }).catch(() => {
        autoBatchKeyRef.current = "";
      });
      return;
    }

    if (batch.nextAttemptAt > Date.now()) {
      const timer = window.setTimeout(
        () => setBatchNow(Date.now()),
        Math.min(1000, batch.nextAttemptAt - Date.now()),
      );
      return () => window.clearTimeout(timer);
    }

    const searchKey = `search:${batch.id}:${position}:${batch.nextAttemptAt}`;
    if (autoBatchKeyRef.current === searchKey) return;
    const timer = window.setTimeout(() => {
      if (autoBatchKeyRef.current === searchKey) return;
      autoBatchKeyRef.current = searchKey;
      void askRef.current?.(batch);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [batch, batchLoaded, batchNow, blocked, navigate, phase, ready]);

  const startBatch = () => {
    const started = startSignalBatch(expirySeconds);
    setBatch(started ?? readSignalBatch());
    setBatchMessage(started ? "" : t("batch.startFailed"));
    autoBatchKeyRef.current = "";
  };

  const pauseBatch = () => {
    if (!batch) return;
    const activeSeries = hasActiveBatchSeries(batch);
    if (phase !== "idle" && !activeSeries) {
      attemptRef.current += 1;
      setPhase("idle");
      setPendingPair(null);
    }
    setBatch(pauseSignalBatch(batch.id, "Пауза по запросу пользователя."));
  };

  const resumeBatch = () => {
    if (!batch) return;
    setBatch(resumeSignalBatch(batch.id));
    autoBatchKeyRef.current = "";
  };

  const stopBatch = () => {
    if (!batch) return;
    const activeSeries = hasActiveBatchSeries(batch);
    if (phase !== "idle" && !activeSeries) {
      attemptRef.current += 1;
      setPhase("idle");
      setPendingPair(null);
    }
    setBatch(requestSignalBatchStop(activeSeries));
  };

  const batchLocked =
    batch?.status === "running" || batch?.status === "paused" || batch?.status === "stopping";
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
        <section className="mt-4 rounded-2xl border border-blue/20 bg-blue/5 p-3.5" aria-label={t("batch.title")}>
          <div className="flex items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-blue/20 bg-blue/10 text-xs font-bold text-blue-soft">
              20
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-fg">{t("batch.title")}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted">{t("batch.description")}</p>
            </div>
          </div>
          {batch ? (
            <>
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="text-xs font-semibold text-blue-soft">{batchStatusLabel}</p>
                <p className="text-xs text-dim">{expiryLabel(batch.expirySeconds)}</p>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/8" role="progressbar" aria-valuemin={0} aria-valuemax={batch.target} aria-valuenow={batch.completed} aria-label={t("batch.progress")}>
                <div className="h-full rounded-full bg-blue-soft transition-[width]" style={{ width: `${(batch.completed / batch.target) * 100}%` }} />
              </div>
              <p className="mt-1.5 text-xs text-muted">
                {t("batch.progress")}: {batch.completed}/{batch.target}
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                {[
                  [t("batch.wins"), batch.wins, "text-win"],
                  [t("batch.losses"), batch.losses, "text-loss"],
                  [t("batch.draws"), batch.draws, "text-blue-soft"],
                ].map(([label, value, color]) => (
                  <div key={label} className="rounded-xl bg-black/20 px-2 py-2">
                    <p className={`font-mono text-lg font-bold ${color}`}>{value}</p>
                    <p className="text-[10px] text-dim">{label}</p>
                  </div>
                ))}
              </div>
              {batch.status === "paused" && batch.lastError ? (
                <p className="mt-3 text-xs leading-relaxed text-loss" role="status">
                  {t("batch.error", { reason: batch.lastError })}
                </p>
              ) : batch.status === "running" && batch.lastError ? (
                <p className="mt-3 text-xs leading-relaxed text-dim" role="status">
                  {batch.lastError}
                  {batch.nextAttemptAt > batchNow
                    ? ` · ${t("batch.retry", { seconds: Math.ceil((batch.nextAttemptAt - batchNow) / 1000) })}`
                    : ""}
                </p>
              ) : null}
            </>
          ) : null}
          {batchMessage ? <p className="mt-3 text-xs text-loss" role="alert">{batchMessage}</p> : null}
          <div className="mt-3 grid grid-cols-2 gap-2">
            {!batchLocked ? (
              <button
                type="button"
                className="btn-prime min-h-10 w-full justify-center text-xs"
                disabled={!batchLoaded || !ready || Boolean(blocked) || phase !== "idle"}
                onClick={startBatch}
              >
                {t("batch.start")}
              </button>
            ) : null}
            {batch?.status === "running" ? (
              <button type="button" className="btn-ghost min-h-10 w-full justify-center text-xs" onClick={pauseBatch}>
                {t("batch.pause")}
              </button>
            ) : null}
            {batch?.status === "paused" ? (
              <button type="button" className="btn-prime min-h-10 w-full justify-center text-xs" onClick={resumeBatch}>
                {t("batch.resume")}
              </button>
            ) : null}
            {batch && (batch.status === "running" || batch.status === "paused") ? (
              <button type="button" className="btn-ghost min-h-10 w-full justify-center text-xs" onClick={stopBatch}>
                {t("batch.stop")}
              </button>
            ) : null}
            {batch?.status === "stopping" ? (
              <p className="col-span-2 rounded-xl bg-black/20 px-3 py-2 text-center text-xs text-muted">{t("batch.stopping")}</p>
            ) : null}
          </div>
        </section>
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
                  disabled={phase !== "idle" || batchLocked}
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
        <button type="button" className="btn-prime mt-4 min-h-12 w-full" disabled={!ready || phase !== "idle" || Boolean(blocked) || (batchLocked && batch?.status !== "running")} onClick={() => void ask(batch?.status === "running" ? batch : null)}>
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
