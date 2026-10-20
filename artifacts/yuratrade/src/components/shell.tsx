import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { GraduationCap, History, LayoutDashboard, UserRound } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { BrandName } from "@/components/brand";
import { levelForPocketAccount } from "@/lib/levels";
import { loadFeed, readClose } from "@/lib/pocket-live";
import { startVisiblePolling } from "@/lib/visible-polling";
import { isAdminId, usePocket } from "@/lib/pocket";
import { useLanguage } from "@/lib/language";
import {
  classifySignalAttempt,
  markSignalUnverified,
  recordSignalOutcome,
  markExpiredPendingSignals,
  readSignalJournal,
} from "@/lib/signal-journal";
import {
  completeSignalBatchAttempt,
  pauseSignalBatch,
  readSignalBatch,
} from "@/lib/signal-batch";

const links = [
  { to: "/", label: "nav.signals", icon: LayoutDashboard },
  { to: "/history", label: "nav.history", icon: History },
  { to: "/learn", label: "nav.learn", icon: GraduationCap },
  { to: "/profile", label: "nav.profile", icon: UserRound },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (state) => state.location.pathname });
  const navigate = useNavigate();
  const { id, tierGrantId } = usePocket();
  const { language, setLanguage, t } = useLanguage();
  const admin = isAdminId(id);
  const [levelName, setLevelName] = useState("");
  const pathRef = useRef(path);

  useEffect(() => {
    pathRef.current = path;
  }, [path]);

  useEffect(() => {
    const batch = readSignalBatch();
    if (
      batch?.status === "running" &&
      batch.completed < batch.target &&
      path !== "/" &&
      path !== "/signal"
    ) {
      void navigate({ to: "/" });
    }
  }, [navigate, path]);

  useEffect(() => {
    let stop = false;
    const pull = () => {
      void loadFeed()
        .then((feed) => {
          if (stop || feed.balance === null) return;
          if (admin) return;
          const level = levelForPocketAccount(id, feed.balance, tierGrantId);
          setLevelName(level ? `${level.name} · $${level.deposit}` : "");
        })
        .catch(() => {});
    };
    const stopPolling = startVisiblePolling(pull, 8000);
    return () => {
      stop = true;
      stopPolling();
    };
  }, [admin, id, tierGrantId]);

  useEffect(() => {
    let stopped = false;
    let busy = false;
    const lastAttempt = new Map<string, number>();
    const settleExpired = async () => {
      if (stopped || busy || pathRef.current === "/signal") return;
      busy = true;
      const now = Date.now();
      try {
        const previouslyPending = readSignalJournal().filter((entry) => entry.outcome === "pending");
        for (const entry of previouslyPending) {
          if (
            entry.batchRunId &&
            now > entry.startedAt + entry.seconds * 1000 + 10_000
          ) {
            markSignalUnverified(entry.id, now);
            pauseSignalBatch(entry.batchRunId, "Котировку не удалось сверить в срок экспирации.");
          }
        }
        markExpiredPendingSignals(now, 120_000);
        const afterExpiry = new Map(readSignalJournal().map((entry) => [entry.id, entry]));
        for (const entry of previouslyPending) {
          if (
            entry.batchRunId &&
            afterExpiry.get(entry.id)?.outcome === "unverified"
          ) {
            pauseSignalBatch(entry.batchRunId, "Исход сигнала не удалось подтвердить котировкой.");
          }
        }
        const due = readSignalJournal().filter(
          (entry) =>
            entry.outcome === "pending" &&
            now >= entry.startedAt + entry.seconds * 1000 + 1500 &&
            now <= entry.startedAt + entry.seconds * 1000 + 120_000,
        );
        for (const entry of due) {
          const last = lastAttempt.get(entry.id) ?? 0;
          if (now - last < 8000) continue;
          lastAttempt.set(entry.id, now);
          try {
            const quote = await readClose({ data: { symbol: entry.symbol } });
            const digits = Math.max(
              entry.openPrice >= 100 ? 2 : entry.openPrice >= 10 ? 3 : 5,
              quote.close >= 100 ? 2 : quote.close >= 10 ? 3 : 5,
            );
            const start = Number(entry.openPrice.toFixed(digits));
            const finish = Number(quote.close.toFixed(digits));
            const move = finish === start ? 0 : finish > start ? 1 : -1;
            const outcome = classifySignalAttempt(entry.direction, move, entry.step);
            const saved = recordSignalOutcome(entry.id, quote.close, outcome);
            if (entry.batchRunId && entry.batchPosition) {
              if (outcome === "overlay") {
                if (!saved) pauseSignalBatch(entry.batchRunId, "Не удалось сохранить исход сигнала в истории.");
              } else if (saved) {
                const completed = completeSignalBatchAttempt(entry.batchRunId, entry.batchPosition, outcome);
                if (!completed || completed.completed < entry.batchPosition) {
                  pauseSignalBatch(entry.batchRunId, "Не удалось сохранить завершение серии.");
                }
              } else {
                pauseSignalBatch(entry.batchRunId, "Не удалось сохранить исход сигнала в истории.");
              }
            }
          } catch {
            // The entry stays pending briefly, then is marked unverified rather than guessed.
          }
        }
      } finally {
        busy = false;
      }
    };
    void settleExpired();
    const timer = window.setInterval(() => void settleExpired(), 5000);
    return () => {
      stopped = true;
      window.clearInterval(timer);
    };
  }, []);

  return (
    <div className="stage min-h-dvh">
      <div className="aurora" aria-hidden>
        <span />
        <span />
        <span />
      </div>
      <header className="sticky top-0 z-20 border-b border-white/6 bg-bg/55 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-3 sm:h-16 sm:gap-3 sm:px-6">
          <BrandName className="shrink-0 text-[15px] sm:text-lg" />
          <nav className="ml-auto hidden min-w-0 items-center justify-end lg:flex">
            {links.map((item) => {
              const on = item.to === "/" ? path === "/" : path.startsWith(item.to);
              return (
                <Link key={item.to} to={item.to} className={`nav-link ${on ? "on" : ""}`}>
                  {t(item.label)}
                </Link>
              );
            })}
          </nav>
          <select
            aria-label={t("language.label")}
            title={t("language.label")}
            value={language}
            onChange={(event) => setLanguage(event.target.value as typeof language)}
            className="h-9 shrink-0 rounded-full border border-white/10 bg-[#111723] px-2 text-xs font-semibold text-fg outline-none focus-visible:ring-2 focus-visible:ring-blue-soft"
          >
            <option value="ru">RU</option>
            <option value="uk">UA</option>
            <option value="en">EN</option>
          </select>
          <Link to="/profile" className="chip on max-w-[6.5rem] shrink-0 truncate text-[11px] sm:max-w-[11rem] sm:text-xs">
            {admin ? t("nav.admin") : levelName || t("nav.noLevel")}
          </Link>
        </div>
      </header>
      <main className="relative z-10 mx-auto w-full max-w-lg px-3 pt-4 pb-[calc(6.25rem+env(safe-area-inset-bottom))] sm:px-4 sm:pt-6">{children}</main>
      <nav className="fixed inset-x-3 z-20 lg:hidden" style={{ bottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
        <div className="nav-glass grid h-16 grid-cols-4 rounded-3xl border border-white/12 bg-white/8 shadow-[0_10px_40px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
          {links.map((item) => {
            const on = item.to === "/" ? path === "/" : path.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex min-h-16 flex-col items-center justify-center gap-1 px-1 text-[11px] leading-none font-semibold ${on ? "text-blue-soft" : "text-dim"}`}
              >
                <item.icon className="size-4" />
                  {t(item.label)}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
