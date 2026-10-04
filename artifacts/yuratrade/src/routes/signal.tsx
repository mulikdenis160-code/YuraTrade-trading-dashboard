import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AnalysisModal } from "@/components/analysis-modal";
import { PairMark } from "@/components/pair-mark";
import { readClose, takeSignal } from "@/lib/pocket-live";
import {
  recordSignalOutcome,
  recordSignalStarted,
  signalRecordId,
} from "@/lib/signal-journal";

type Group = "fx" | "crypto" | "stock" | "commodity";

type Search = {
  symbol: string;
  name: string;
  group: Group;
  direction: "call" | "put";
  open: number;
  payout: number;
  seconds: number;
  note: string;
  bars: Array<[number, number, number, number]>;
  ruleScore: number;
  step: number;
  started: number;
};

const groups = new Set<Group>(["fx", "crypto", "stock", "commodity"]);

function readBars(value: unknown) {
  if (!Array.isArray(value)) return [];
  const bars: Array<[number, number, number, number]> = [];
  for (const row of value) {
    if (!Array.isArray(row) || row.length < 4) continue;
    const open = Number(row[0]);
    const high = Number(row[1]);
    const low = Number(row[2]);
    const close = Number(row[3]);
    if ([open, high, low, close].every(Number.isFinite)) bars.push([open, high, low, close]);
  }
  return bars.slice(-32);
}

function CandleChart({
  bars,
  entry,
  live,
}: {
  bars: Array<[number, number, number, number]>;
  entry: number;
  live: number | null;
}) {
  if (bars.length < 2) return null;
  const width = 320;
  const height = 168;
  const pad = 12;
  const prices = bars.flatMap((bar) => [bar[1], bar[2]]);
  prices.push(entry);
  if (live !== null) prices.push(live);
  const max = Math.max(...prices);
  const min = Math.min(...prices);
  const span = max - min || Math.abs(entry) * 0.0001 || 1;
  const yOf = (price: number) => pad + ((max - price) / span) * (height - pad * 2);
  const slot = (width - pad * 2) / bars.length;
  const entryY = yOf(entry);
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="mt-4 h-44 w-full rounded-2xl bg-[#080b12]" role="img" aria-label="График свечей">
      <line x1={pad} x2={width - pad} y1={entryY} y2={entryY} stroke="#8ecbff" strokeDasharray="4 4" strokeWidth="1" />
      {bars.map((bar, index) => {
        const [open, high, low, close] = bar;
        const rising = close >= open;
        const color = rising ? "#3dd68c" : "#ff5d73";
        const bodyWidth = Math.max(2, slot * 0.62);
        const x = pad + index * slot + (slot - bodyWidth) / 2;
        const top = yOf(Math.max(open, close));
        const bottom = yOf(Math.min(open, close));
        return (
          <g key={index}>
            <line x1={x + bodyWidth / 2} x2={x + bodyWidth / 2} y1={yOf(high)} y2={yOf(low)} stroke={color} strokeWidth="1.2" />
            <rect x={x} y={top} width={bodyWidth} height={Math.max(1.4, bottom - top)} fill={color} rx="1" />
          </g>
        );
      })}
      {live !== null ? <circle cx={width - pad} cy={yOf(live)} r="3.5" fill={live >= entry ? "#3dd68c" : "#ff5d73"} /> : null}
    </svg>
  );
}

export const Route = createFileRoute("/signal")({
  validateSearch: (search: Record<string, unknown>): Search => {
    const group = groups.has(search.group as Group) ? (search.group as Group) : "fx";
    const direction = search.direction === "put" ? "put" : "call";
    return {
      symbol: typeof search.symbol === "string" ? search.symbol : "",
      name: typeof search.name === "string" ? search.name : "",
      group,
      direction,
      open: Number(search.open) || 0,
      payout: Number(search.payout) || 0,
      seconds: Number(search.seconds) || 60,
      note: typeof search.note === "string" ? search.note : "",
      bars: readBars(search.bars),
      ruleScore: Number(search.ruleScore) || 0,
      step: Math.min(3, Math.max(0, Number(search.step) || 0)),
      started: Number(search.started) || Date.now(),
    };
  },
  component: SignalRoute,
});

function digitsOf(price: number) {
  if (price >= 100) return 2;
  if (price >= 10) return 3;
  return 5;
}

function copyName(text: string) {
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.top = "0";
  area.style.left = "0";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.focus();
  area.select();
  area.setSelectionRange(0, text.length);
  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  }
  area.remove();
  if (copied) return Promise.resolve();
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
  return Promise.reject(new Error("copy"));
}

function clock(ms: number) {
  const total = Math.ceil(ms / 1000);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function BackLink() {
  return (
    <Link
      to="/"
      className="press inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-sm font-semibold text-fg shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
    >
      <svg viewBox="0 0 16 16" className="size-4 text-blue-soft" aria-hidden>
        <path d="M10.5 3.5 6 8l4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Назад
    </Link>
  );
}

function SignalRoute() {
  const search = Route.useSearch();
  return <SignalCard key={`${search.started}-${search.step}`} search={search} />;
}

function SignalCard({ search }: { search: Search }) {
  const navigate = useNavigate();
  const [now, setNow] = useState(() => Date.now());
  const [phase, setPhase] = useState<"run" | "check" | "win" | "draw" | "prep" | "hunt" | "stop" | "no-signal">("run");
  const [copied, setCopied] = useState(false);
  const [close, setClose] = useState<number | null>(null);
  const [prepLeft, setPrepLeft] = useState(10);
  const [error, setError] = useState("");
  const [journalWarning, setJournalWarning] = useState("");
  const [live, setLive] = useState<number | null>(null);
  const [liveStatus, setLiveStatus] = useState<"connecting" | "connected" | "error">("connecting");
  const [liveMessage, setLiveMessage] = useState("");
  const settled = useRef(false);
  const journalId = signalRecordId({
    symbol: search.symbol,
    startedAt: search.started,
    step: search.step,
  });
  const until = search.started + search.seconds * 1000;
  const left = Math.max(0, until - now);
  const up = search.direction === "call";

  useEffect(() => {
    if (!search.symbol || !search.open) return;
    const saved = recordSignalStarted({
      id: journalId,
      symbol: search.symbol,
      name: search.name,
      group: search.group,
      direction: search.direction,
      openPrice: search.open,
      payout: search.payout,
      seconds: search.seconds,
      step: search.step,
      startedAt: search.started,
      ruleScore: search.ruleScore,
      strategyVersion: "consensus-filter-v1",
      note: search.note,
      bars: search.bars,
    });
    setJournalWarning(saved ? "" : "Не удалось сохранить сигнал в локальный журнал браузера.");
  }, [journalId, search.bars, search.direction, search.group, search.name, search.note, search.open, search.payout, search.ruleScore, search.seconds, search.started, search.step, search.symbol]);

  useEffect(() => {
    if (phase !== "run") return;
    const timer = window.setInterval(() => setNow(Date.now()), 200);
    return () => window.clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "run" || !search.symbol) return;
    const source = new EventSource(`/api/ticks?symbol=${encodeURIComponent(search.symbol)}`);
    source.onopen = () => setLiveStatus("connecting");
    source.addEventListener("feed-status", (event) => {
      try {
        const status = JSON.parse((event as MessageEvent<string>).data) as {
          status?: string;
          message?: string;
        };
        if (status.status === "connected" || status.status === "connecting" || status.status === "error") {
          setLiveStatus(status.status);
          setLiveMessage(status.message ?? "");
        }
      } catch {
        setLiveStatus("error");
        setLiveMessage("Не удалось прочитать состояние потока котировок.");
      }
    });
    source.onmessage = (event) => {
      const next = Number(event.data);
      if (Number.isFinite(next)) {
        setLive(next);
        setLiveStatus("connected");
        setLiveMessage("");
      }
    };
    source.onerror = () => {
      setLiveStatus("error");
      setLiveMessage("Соединение с потоком котировок прервано. Переподключаемся…");
    };
    return () => source.close();
  }, [phase, search.symbol]);

  useEffect(() => {
    if (phase !== "run" || left > 0 || settled.current || !search.symbol) return;
    settled.current = true;
    setPhase("check");
    void readClose({ data: { symbol: search.symbol } })
      .then((quote) => {
        setClose(quote.close);
        const digits = Math.max(digitsOf(search.open), digitsOf(quote.close));
        const entry = Number(search.open.toFixed(digits));
        const finish = Number(quote.close.toFixed(digits));
        const move = finish === entry ? 0 : finish > entry ? 1 : -1;
        const won = up ? move > 0 : move < 0;
        const saved = recordSignalOutcome(journalId, quote.close, move === 0 ? "draw" : won ? "win" : "loss");
        if (!saved) setJournalWarning("Результат не удалось сохранить в локальный журнал.");
        if (move === 0) {
          setPhase("draw");
          return;
        }
        setPhase(won ? "win" : search.step >= 3 ? "stop" : "prep");
      })
      .catch((cause: unknown) => {
        setPhase("run");
        settled.current = false;
        setError(cause instanceof Error ? cause.message : "Не удалось сверить цену.");
      });
  }, [left, phase, search.open, search.step, search.symbol, up]);

  useEffect(() => {
    if (phase !== "prep") return;
    const ends = Date.now() + 10000;
    const timer = window.setInterval(() => {
      const left = Math.max(0, Math.ceil((ends - Date.now()) / 1000));
      setPrepLeft(left);
      if (left <= 0) {
        window.clearInterval(timer);
        setPhase("hunt");
      }
    }, 200);
    return () => window.clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "hunt") return;
    let stop = false;
    const started = Date.now();
    void takeSignal({ data: { symbol: search.symbol, seconds: search.seconds } })
      .then(async (result) => {
        if (!result) {
          if (stop) return;
          setPhase("no-signal");
          setError("");
          return;
        }
        const wait = Math.max(0, 2200 - (Date.now() - started));
        await new Promise((resolve) => window.setTimeout(resolve, wait));
        if (stop) return;
        await navigate({
          to: "/signal",
          replace: true,
          search: {
            symbol: search.symbol,
            name: result.name,
            group: search.group,
            direction: result.direction,
            open: result.openPrice,
            payout: result.payout,
            seconds: search.seconds,
            note: result.note,
            bars: result.bars,
            ruleScore: result.ruleScore,
            step: search.step + 1,
            started: Date.now(),
          },
        });
      })
      .catch((cause: unknown) => {
        if (stop) return;
        setPhase("prep");
        setError(cause instanceof Error ? cause.message : "Не удалось дать перекрытие.");
      });
    return () => {
      stop = true;
    };
  }, [navigate, phase, search.group, search.seconds, search.step, search.symbol]);

  if (!search.symbol || !search.open) {
    return (
      <div className="mx-auto max-w-md">
        <BackLink />
        <p className="mt-4 text-muted">Сигнала нет.</p>
      </div>
    );
  }

  if (phase === "no-signal") {
    return (
      <div className="mx-auto w-full max-w-md">
        <BackLink />
        <section className="panel arrive mt-3 px-4 py-8 text-center sm:px-6">
          <p className="text-xs font-semibold tracking-[0.16em] text-blue-soft uppercase">Вход пропущен</p>
          <h1 className="mt-3 text-xl font-bold text-fg">Новый сигнал не подтверждён</h1>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">
            Фильтр не подтвердил повторный вход по этой паре. Новый сигнал не выдан; предыдущий результат сохранён в журнале.
          </p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link to="/history" className="btn-ghost min-h-11 justify-center">Открыть историю</Link>
            <Link to="/" className="btn-prime min-h-11 justify-center">К сигналам</Link>
          </div>
          {journalWarning ? <p className="mt-4 text-xs leading-relaxed text-loss" role="status">{journalWarning}</p> : null}
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <BackLink />
      <article className="panel arrive mt-3 p-3 sm:p-5">
        <div className="flex items-center gap-3">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-white/10 bg-[#10151f]">
            <PairMark symbol={search.symbol} name={search.name} group={search.group} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-extrabold tracking-tight text-fg sm:text-xl">{search.name.replace(/\s+OTC$/i, "")}</p>
            <div className="mt-1 flex items-center gap-2">
              <p className="text-[11px] font-semibold tracking-[0.16em] text-blue-soft uppercase">
                {/\sOTC$/i.test(search.name) ? "OTC" : search.group === "fx" ? "Валюта" : search.group === "crypto" ? "Крипто" : search.group === "stock" ? "Акция" : "Сырьё"}
              </p>
              <button
                type="button"
                className="press min-h-10 shrink-0 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-blue-soft"
                onClick={() => {
                  void copyName(search.name)
                    .then(() => {
                      setCopied(true);
                      window.setTimeout(() => setCopied(false), 1400);
                    })
                    .catch(() => setCopied(false));
                }}
              >
                {copied ? "Скопировано" : "Копировать"}
              </button>
            </div>
          </div>
          <span className="flex shrink-0 flex-col items-end gap-1">
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-blue-soft">
              {search.seconds % 60 === 0 ? `${search.seconds / 60} мин` : `${search.seconds} сек`}
            </span>
            {search.step > 0 ? <span className="text-[11px] font-semibold text-dim">{search.step}/3</span> : null}
          </span>
        </div>
        {phase === "run" || phase === "check" ? (
          <p className="glow-text mt-4 text-center font-mono text-4xl font-bold text-fg sm:text-5xl">{phase === "check" ? "…" : clock(left)}</p>
        ) : null}
        <p className={`mt-3 text-3xl font-extrabold sm:text-4xl ${up ? "text-win" : "text-loss"}`}>{up ? "Вверх" : "Вниз"}</p>
        <CandleChart bars={search.bars} entry={search.open} live={phase === "run" ? live : close} />
        <ul className="mt-4 space-y-2">
          {search.note
            .split("\n")
            .filter(Boolean)
            .map((line, index) => (
              <li key={line} className="arrive rounded-xl bg-white/4 px-3 py-2 text-sm leading-snug text-muted" style={{ animationDelay: `${index * 60}ms` }}>
                {line}
              </li>
            ))}
        </ul>
        <dl className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <dt className="text-xs text-dim">Цена входа</dt>
            <dd className="mt-1 font-mono text-xl font-bold text-fg sm:text-2xl">{search.open.toFixed(digitsOf(search.open))}</dd>
          </div>
          <div>
            <dt className="text-xs text-dim">Выплата</dt>
            <dd className="mt-1 font-mono text-xl font-bold text-fg sm:text-2xl">{search.payout}%</dd>
          </div>
        </dl>
        {phase === "run" || phase === "check" ? (
          <div className="mt-5 rounded-2xl border border-white/10 bg-[#080b12] px-4 py-4 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            <p
              className={`flex items-center justify-center gap-2 text-[11px] font-semibold tracking-[0.16em] uppercase ${
                liveStatus === "connected" ? "text-win" : liveStatus === "error" ? "text-loss" : "text-dim"
              }`}
              role="status"
              aria-live="polite"
            >
              <span className={liveStatus === "connected" ? "live-dot" : "size-2 rounded-full bg-current"} />
              {liveStatus === "connected"
                ? "Котировки Pocket Option активны"
                : liveStatus === "error"
                  ? "Поток котировок недоступен"
                  : "Ожидание котировки Pocket Option"}
            </p>
            <p className={`mt-2 font-mono text-4xl font-extrabold tracking-tight sm:text-5xl ${live === null || live === search.open ? "text-fg" : live > search.open ? "text-win" : "text-loss"}`}>
              {live === null ? "…" : live.toFixed(digitsOf(live))}
            </p>
            <p className={`mt-1 font-mono text-sm font-semibold ${live === null || live === search.open ? "text-dim" : live > search.open ? "text-win" : "text-loss"}`}>
              {live === null ? "ждём котировку" : live === search.open ? "без изменения" : `${live > search.open ? "+" : "−"}${Math.abs(live - search.open).toFixed(digitsOf(search.open))} от входа`}
            </p>
            {liveMessage ? (
              <p className={`mt-2 text-xs ${liveStatus === "error" ? "text-loss" : "text-dim"}`}>{liveMessage}</p>
            ) : null}
          </div>
        ) : null}
        {error ? <p className="mt-3 text-sm text-loss">{error}</p> : null}
        {journalWarning ? <p className="mt-3 text-xs leading-relaxed text-loss" role="status">{journalWarning}</p> : null}
      </article>

      {phase === "win" && close !== null ? (
        <div className="win-screen">
          <span className="spark spark-a" />
          <span className="spark spark-b" />
          <span className="spark spark-c" />
          <span className="spark spark-d" />
          <svg viewBox="0 0 72 72" className="win-check" aria-hidden>
            <circle cx="36" cy="36" r="32" fill="none" stroke="#3dd68c" strokeWidth="3" />
            <path d="M22 37l10 10 18-20" fill="none" stroke="#3dd68c" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="mt-4 text-sm font-semibold tracking-[0.18em] text-win uppercase">Победа</p>
          <p className="mt-1 text-2xl font-extrabold text-fg">{up ? "Цена выросла" : "Цена упала"}</p>
          <p className="mt-4 font-mono text-lg text-fg">
            {search.open.toFixed(digitsOf(search.open))}
            <span className="mx-2 text-win">→</span>
            {close.toFixed(digitsOf(close))}
          </p>
        </div>
      ) : null}

      {phase === "draw" && close !== null ? (
        <div className="panel arrive mt-4 px-6 py-8 text-center">
          <p className="text-sm font-semibold tracking-[0.16em] text-blue-soft uppercase">Ничья</p>
          <p className="mt-2 text-lg font-bold text-fg">Возврат</p>
          <p className="mt-3 font-mono text-sm text-muted">
            {search.open.toFixed(digitsOf(search.open))} → {close.toFixed(digitsOf(close))}
          </p>
          <p className="mt-2 text-sm text-dim">Цена не изменилась. Перекрытия нет.</p>
        </div>
      ) : null}

      {phase === "prep" ? (
        <div className="panel arrive mt-4 px-6 py-8 text-center">
          <p className="text-sm font-semibold tracking-[0.16em] text-loss uppercase">Проигрыш</p>
          <p className="mt-2 text-lg font-bold text-fg">Подготовьтесь к перекрытию</p>
          {close !== null ? (
            <p className="mt-2 font-mono text-sm text-loss">
              {search.open.toFixed(digitsOf(search.open))} → {close.toFixed(digitsOf(close))}
            </p>
          ) : null}
          <p className="mt-3 font-mono text-5xl font-bold text-fg">{prepLeft}</p>
          <p className="mt-2 text-sm text-dim">Та же пара. Осталось попыток: {3 - search.step}</p>
        </div>
      ) : null}

      {phase === "stop" && close !== null ? (
        <div className="panel arrive mt-4 px-6 py-8 text-center">
          <p className="text-sm font-semibold tracking-[0.16em] text-loss uppercase">Проигрыш</p>
          <p className="mt-2 text-lg font-bold text-fg">Три перекрытия уже были</p>
          <p className="mt-3 font-mono text-sm text-muted">
            {search.open.toFixed(digitsOf(search.open))} → {close.toFixed(digitsOf(close))}
          </p>
        </div>
      ) : null}

      {phase === "hunt" ? <AnalysisModal pair={search.name} expiry={`${Math.round(search.seconds / 60)} мин`} /> : null}
    </div>
  );
}
