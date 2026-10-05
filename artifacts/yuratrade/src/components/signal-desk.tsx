import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { loadFeed, takeBest } from "@/lib/pocket-live";
import { levelForBalance, markSignalUsed, signalsUsedToday } from "@/lib/levels";
import { isAdminId, usePocket } from "@/lib/pocket";
import { AnalysisModal } from "@/components/analysis-modal";
import {
  analysisPeriodForExpiry,
  lookbackForExpiry,
} from "@/lib/expiry";
import { formatExpiryForLanguage, useLanguage } from "@/lib/language";

const expiryOptionsMinutes = [1, 2, 3, 5, 10, 15, 25, 30, 60, 120, 180, 240] as const;

export function SignalDesk() {
  const navigate = useNavigate();
  const { id } = usePocket();
  const { language, t } = useLanguage();
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
      ? t("signal.block.deposit")
      : !level
        ? t("signal.block.minimum")
        : left === 0
          ? t("signal.block.limit")
          : "";

  const expiryLabel = (seconds: number) => formatExpiryForLanguage(seconds, language);

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
          setNotice(t("signal.none"));
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
      setPhase("idle");
          setError(cause instanceof Error ? cause.message : t("signal.none"));
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
                  aria-pressed={selected}
                  title={expiryLabel(minutes * 60)}
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
            {t("signal.analyzed", { period: expiryLabel(analysisSeconds), bars: lookbackBars })}
          </p>
        </section>
        <button type="button" className="btn-prime mt-4 min-h-12 w-full" disabled={!ready || phase === "search" || Boolean(blocked)} onClick={() => void ask()}>
          {phase === "search" ? t("signal.checking") : t("signal.get")}
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
      {phase === "search" ? <AnalysisModal pair={t("home.eyebrow")} expiry={expiryLabel(expirySeconds)} /> : null}
    </div>
  );
}
