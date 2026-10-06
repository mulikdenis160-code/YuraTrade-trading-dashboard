import WebSocket from "ws";
import {
  acceptsMarketAiReview,
  analyzeMarketCandidates,
  DIRECT_AI_HISTORY_CANDLES,
  DIRECT_AI_MODEL,
  DIRECT_AI_MODEL_LABEL,
  MIN_DIRECT_AI_CANDLES,
  type MarketAiReview,
} from "./market-ai.server";
import {
  analysisPeriodForExpiry,
  formatExpiry,
  isValidExpirySeconds,
} from "./expiry";
import { createKeyedAsyncQueue } from "./async-keyed-queue";
import {
  createRotatingCandidateSelector,
  loadCandidatesInParallel,
} from "./signal-candidate-pool.ts";

const FEED_URL = "wss://api-msk.po.market/socket.io/?EIO=4&transport=websocket";
const FEED_AUTH = process.env.POCKET_OPTION_FEED_AUTH ?? "";
const AUTH_MISSING_MESSAGE =
  "Не настроена свежая авторизация Pocket Option. Добавьте её в Replit Secrets как POCKET_OPTION_FEED_AUTH.";
const AUTH_REJECTED_MESSAGE =
  "Pocket Option отклонил авторизацию. Проверьте актуальность секрета POCKET_OPTION_FEED_AUTH.";
const HISTORY_PAGE_CANDLES = 150;
const SIGNAL_CANDIDATES_PER_SEARCH = 4;
const CANDIDATE_HISTORY_PAGE_TIMEOUT_MS = 4500;
const runHistoryRequest = createKeyedAsyncQueue();

export type PairGroup = "fx" | "crypto" | "stock" | "commodity";

export type FeedPair = {
  symbol: string;
  name: string;
  payout: number;
  group: PairGroup;
};

export type FeedSignal = {
  name: string;
  payout: number;
  direction: "call" | "put";
  openPrice: number;
  analysisSeconds: number;
  note: string;
  bars: Array<[number, number, number, number]>;
  aiConfidence: number;
};

type PassResult = { decision: "pass"; reason: string };
type SignalResult = { decision: "signal" } & FeedSignal;
type BestSignalResult = SignalResult & {
  symbol: string;
  group: PairGroup;
  seconds: number;
};
export type FeedSignalResult = PassResult | SignalResult;
export type FeedBestResult = PassResult | BestSignalResult;

type Candle = { open: number; close: number; high: number; low: number };
type HistoricalCandle = Candle & { time: number };

type Pending = {
  asset: string;
  resolve: (candles: HistoricalCandle[]) => void;
  reject: (error: Error) => void;
  timer: ReturnType<typeof setTimeout>;
};

const pairs = new Map<string, FeedPair>();
let balance: number | null = null;
let socket: WebSocket | null = null;
let ready: Promise<void> | null = null;
let connectionError = "";
let retryAfter = 0;
let expectAssets = false;
let expectBalance = false;
const quotes = new Map<string, { price: number; at: number }>();
const selectSignalCandidates = createRotatingCandidateSelector<FeedPair>(SIGNAL_CANDIDATES_PER_SEARCH);
let expectStream = false;
const pendingHistory = new Map<string, Pending>();

function textOf(data: WebSocket.RawData) {
  if (typeof data === "string") return data;
  if (Buffer.isBuffer(data)) return data.toString("utf8");
  if (data instanceof ArrayBuffer) return Buffer.from(data).toString("utf8");
  return Buffer.concat(data).toString("utf8");
}

function groupOf(type: string): PairGroup | null {
  if (type === "currency") return "fx";
  if (type === "cryptocurrency") return "crypto";
  if (type === "stock") return "stock";
  if (type === "commodity") return "commodity";
  return null;
}

function cleanName(name: string) {
  const base = name.replace(/\s*OTC\s*/gi, " ").replace(/\s+/g, " ").trim();
  return `${base} OTC`;
}

function readNumber(source: string, key: string) {
  const match = source.match(new RegExp(`"${key}"\\s*:\\s*(-?\\d+(?:\\.\\d+)?)`));
  return match ? Number(match[1]) : null;
}

function storeAssets(rows: unknown[]) {
  const next = new Map<string, FeedPair>();
  for (const row of rows) {
    if (!Array.isArray(row) || row.length < 15 || row[14] !== true || row[9] !== 1) continue;
    if (!String(row[1]).toLowerCase().includes("otc")) continue;
    const group = groupOf(String(row[3]));
    const payout = Number(row[5]);
    if (group !== "fx" || !Number.isFinite(payout)) continue;
    const symbol = String(row[1]);
    next.set(symbol, { symbol, name: cleanName(String(row[2] || symbol)), payout, group });
  }
  if (next.size > 0) {
    pairs.clear();
    for (const [symbol, pair] of next) pairs.set(symbol, pair);
    connectionError = "";
  }
}

function asCandles(data: unknown[]): HistoricalCandle[] {
  const candles: HistoricalCandle[] = [];
  for (const row of data) {
    if (!row || typeof row !== "object") continue;
    const candle = row as { time?: number; open?: number; close?: number; high?: number; low?: number };
    const close = Number(candle.close);
    const open = Number(candle.open);
    if (!Number.isFinite(close) || !Number.isFinite(open)) continue;
    candles.push({
      time: Number(candle.time) || 0,
      open,
      close,
      high: Number.isFinite(Number(candle.high)) ? Number(candle.high) : Math.max(open, close),
      low: Number.isFinite(Number(candle.low)) ? Number(candle.low) : Math.min(open, close),
    });
  }
  candles.sort((a, b) => a.time - b.time);
  return candles;
}

function buildDirectAiSignal(
  candles: HistoricalCandle[],
  expirySeconds: number,
  analysisSeconds: number,
  name: string,
  payout: number,
  review: Extract<MarketAiReview, { decision: "signal" }>,
): FeedSignal {
  const pack = candles.slice(-28);
  const price = candles[candles.length - 1]?.close ?? 0;
  const sample = pack[pack.length - 1]?.close ?? price;
  const digits = sample >= 100 ? 2 : sample >= 10 ? 3 : 5;
  const cut = (value: number) => Number(value.toFixed(digits));
  const directionLabel = review.direction === "call" ? "CALL (вверх)" : "PUT (вниз)";

  return {
    name,
    payout,
    direction: review.direction,
    openPrice: price,
    analysisSeconds,
    aiConfidence: review.confidence,
    note: [
      `Прямой анализ ${DIRECT_AI_MODEL_LABEL} (${DIRECT_AI_MODEL}) выбрал ${directionLabel}.`,
      `Самооценка ИИ: ${review.confidence}/100; это субъективная оценка, а не измеренная вероятность или историческая точность.`,
      `ИИ — выбор пары: ${review.explanation.pairSelection}`,
      `ИИ — разбор свечей: ${review.explanation.candleEvidence}`,
      `ИИ — аргумент направления: ${review.explanation.directionRationale}`,
      `ИИ — риски сценария: ${review.explanation.riskFactors}`,
      `ИИ — что ослабит сценарий: ${review.explanation.invalidation}`,
      `Экспирация ${formatExpiry(expirySeconds)}; интервал свечи ${formatExpiry(analysisSeconds)}.`,
      "Направление выбрано прямым анализом ИИ без независимой проверки другой модели; результат не гарантирован.",
    ].join("\n"),
    bars: pack.map((candle) => [
      cut(candle.open),
      cut(candle.high),
      cut(candle.low),
      cut(candle.close),
    ]),
  };
}

function rememberTicks(message: string) {
  try {
    const rows = JSON.parse(message) as unknown[];
    if (!Array.isArray(rows)) return;
    for (const row of rows) {
      if (!Array.isArray(row) || row.length < 3) continue;
      const price = Number(row[2]);
      if (!Number.isFinite(price)) continue;
      quotes.set(String(row[0]), { price, at: Date.now() });
    }
  } catch {
    /* ignore a bad tick frame */
  }
}

const subscribedAt = new Map<string, number>();

function subscribe(symbol: string) {
  const now = Date.now();
  if (now - (subscribedAt.get(symbol) ?? 0) < 2000) return;
  if (!socket || socket.readyState !== WebSocket.OPEN) return;
  subscribedAt.set(symbol, now);
  socket.send("42" + JSON.stringify(["changeSymbol", { asset: symbol, period: 1 }]));
}

function waitQuote(symbol: string) {
  const current = quotes.get(symbol);
  if (current && Date.now() - current.at <= 2000) return Promise.resolve(current.price);
  const started = Date.now();
  subscribe(symbol);
  return new Promise<number>((resolve, reject) => {
    let settled = false;
    let quoteTimer: ReturnType<typeof setInterval>;
    let retryTimer: ReturnType<typeof setInterval>;
    let stopTimer: ReturnType<typeof setTimeout>;
    const clearTimers = () => {
      clearInterval(quoteTimer);
      clearInterval(retryTimer);
      clearTimeout(stopTimer);
    };
    const accept = (price: number) => {
      if (settled) return;
      settled = true;
      clearTimers();
      resolve(price);
    };
    quoteTimer = setInterval(() => {
      const quote = quotes.get(symbol);
      if (quote && quote.at >= started - 250) {
        accept(quote.price);
      }
    }, 200);
    retryTimer = setInterval(() => {
      const quote = quotes.get(symbol);
      if (!quote || Date.now() - quote.at > 2000) subscribe(symbol);
    }, 500);
    stopTimer = setTimeout(() => {
      if (settled) return;
      settled = true;
      clearTimers();
      const quote = quotes.get(symbol);
      if (quote && Date.now() - quote.at <= 2000) resolve(quote.price);
      else reject(new Error(`Цена по паре ${symbol} не пришла за 12 секунд. Попробуйте ещё раз.`));
    }, 12_000);
  });
}

function failPending(error: Error) {
  for (const request of pendingHistory.values()) {
    clearTimeout(request.timer);
    request.reject(error);
  }
  pendingHistory.clear();
}

function handleMessage(current: WebSocket, message: string) {
  if (message.startsWith("0") && message.includes("sid")) {
    current.send("40");
    return;
  }
  if (message === "2") {
    current.send("3");
    return;
  }
  if (message.startsWith("40") && message.includes("sid")) {
    current.send(FEED_AUTH);
    return;
  }
  if (message.includes("NotAuthorized")) {
    connectionError = AUTH_REJECTED_MESSAGE;
    failPending(new Error(connectionError));
    try {
      current.close();
    } catch {
      /* already closed */
    }
    return;
  }
  if (message.includes("updateAssets")) {
    expectAssets = true;
    return;
  }
  if (expectAssets && message.startsWith("[")) {
    expectAssets = false;
    try {
      storeAssets(JSON.parse(message) as unknown[]);
    } catch {
      /* ignore a bad catalog frame */
    }
    return;
  }
  if (message.startsWith("{")) {
    try {
      const parsed = JSON.parse(message) as { asset?: string; data?: unknown[] };
      if (typeof parsed.asset === "string" && Array.isArray(parsed.data)) {
        const request = pendingHistory.get(parsed.asset);
        if (request) {
          clearTimeout(request.timer);
          pendingHistory.delete(parsed.asset);
          request.resolve(asCandles(parsed.data));
          return;
        }
      }
    } catch {
      /* ignore a bad history frame */
    }
    return;
  }
  if (message.includes("updateStream")) {
    expectStream = true;
    return;
  }
  if (expectStream && message.startsWith("[")) {
    expectStream = false;
    rememberTicks(message);
    return;
  }
  if (message.includes("successupdateBalance")) expectBalance = true;
  if (!expectBalance || message.length > 400) return;
  const nextBalance = readNumber(message, "balance");
  if (nextBalance === null) return;
  balance = nextBalance;
  expectBalance = false;
}

function connect() {
  if (!FEED_AUTH.trim()) {
    connectionError = AUTH_MISSING_MESSAGE;
    throw new Error(connectionError);
  }
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === 0)) return;
  if (socket) {
    const old = socket;
    socket = null;
    old.on("error", () => {});
    try {
      old.terminate();
    } catch {
      /* closed */
    }
  }
  connectionError = "";
  const next = new WebSocket(FEED_URL, {
    headers: {
      Origin: "https://pocketoption.com",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36 Edg/154.0.0.0",
    },
    handshakeTimeout: 8000,
  });
  next.on("error", () => {
    if (socket !== next) return;
    socket = null;
    retryAfter = Date.now() + 2000;
    connectionError = "Не удалось подключиться к потоку Pocket Option. Повторяем подключение.";
    failPending(new Error(connectionError));
  });
  socket = next;
  next.on("message", (data) => handleMessage(next, textOf(data)));
  next.on("close", () => {
    if (socket !== next) return;
    socket = null;
    retryAfter = Date.now() + 2000;
    if (!connectionError) connectionError = "Соединение с Pocket Option прервано. Повторяем подключение.";
    failPending(new Error(connectionError));
  });
}

function ensureFeed() {
  if (pairs.size > 0 && socket && socket.readyState === WebSocket.OPEN) return Promise.resolve();
  if (ready) return ready;
  connect();
  ready = new Promise<void>((resolve, reject) => {
    const started = Date.now();
    const timer = setInterval(() => {
      if (pairs.size > 0 && socket && socket.readyState === WebSocket.OPEN) {
        clearInterval(timer);
        ready = null;
        resolve();
        return;
      }
      if ((!socket || socket.readyState === 3) && Date.now() >= retryAfter) connect();
      if (Date.now() - started > 12000) {
        clearInterval(timer);
        ready = null;
        if (!connectionError) connectionError = "Котировки Pocket Option не получены за 12 секунд.";
        reject(new Error(connectionError));
      }
    }, 200);
  });
  return ready;
}

export async function feedSnapshot() {
  await ensureFeed();
  return {
    balance,
    pairs: [...pairs.values()].sort((a, b) => b.payout - a.payout || a.name.localeCompare(b.name)),
  };
}

async function loadHistoryPage(
  symbol: string,
  seconds: number,
  time: number,
  timeoutMs = 12_000,
) {
  return runHistoryRequest(symbol, async () => {
    await ensureFeed();
    if (!pairs.has(symbol)) throw new Error("Эта пара сейчас недоступна.");
    if (!socket || socket.readyState !== WebSocket.OPEN) throw new Error("Котировки сейчас недоступны.");
    const current = socket;
    return new Promise<HistoricalCandle[]>((resolve, reject) => {
      let request: Pending;
      const timer = setTimeout(() => {
        if (pendingHistory.get(symbol) === request) pendingHistory.delete(symbol);
        reject(new Error(`История свечей не пришла за ${Math.ceil(timeoutMs / 1000)} секунд. Попробуйте ещё раз.`));
      }, timeoutMs);
      request = { asset: symbol, resolve, reject, timer };
      pendingHistory.set(symbol, request);
      try {
        current.send("42" + JSON.stringify(["changeSymbol", { asset: symbol, period: seconds }]));
        current.send(
          "42" +
            JSON.stringify([
              "loadHistoryPeriod",
              {
                asset: symbol,
                index: 7000 + Math.floor(Math.random() * 2000),
                time,
                offset: seconds * HISTORY_PAGE_CANDLES,
                period: seconds,
              },
            ]),
        );
      } catch {
        clearTimeout(timer);
        if (pendingHistory.get(symbol) === request) pendingHistory.delete(symbol);
        reject(new Error("Не удалось запросить историю свечей Pocket Option."));
      }
    });
  });
}

async function loadCandles(symbol: string, seconds: number, pageTimeoutMs = 12_000) {
  await ensureFeed();
  const collected = new Map<number, HistoricalCandle>();
  let cursor = Math.floor(Date.now() / 1000);
  const maxPages = Math.ceil(DIRECT_AI_HISTORY_CANDLES / HISTORY_PAGE_CANDLES) + 1;
  for (let page = 0; page < maxPages && collected.size < DIRECT_AI_HISTORY_CANDLES; page += 1) {
    const candles = await loadHistoryPage(symbol, seconds, cursor, pageTimeoutMs);
    if (candles.length === 0) break;
    const previousSize = collected.size;
    for (const candle of candles) collected.set(candle.time, candle);
    const oldestTime = candles[0].time;
    if (collected.size === previousSize || oldestTime <= 0 || oldestTime >= cursor) break;
    cursor = oldestTime - 1;
  }
  return [...collected.values()]
    .sort((a, b) => a.time - b.time)
    .slice(-DIRECT_AI_HISTORY_CANDLES);
}

export function followQuote(symbol: string) {
  if ((!socket || socket.readyState === 3) && Date.now() >= retryAfter) {
    void feedSnapshot().catch(() => {});
  }
  const current = quotes.get(symbol);
  if (!current || Date.now() - current.at > 2000) subscribe(symbol);
  return quotes.get(symbol) ?? null;
}

export function quoteStatus(symbol: string) {
  if (!FEED_AUTH.trim()) {
    return { status: "error" as const, message: AUTH_MISSING_MESSAGE };
  }
  if (connectionError) {
    return { status: "error" as const, message: connectionError };
  }
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    return { status: "connecting" as const, message: "Подключаемся к потоку Pocket Option." };
  }
  const quote = quotes.get(symbol);
  if (quote && Date.now() - quote.at <= 5000) {
    return { status: "connected" as const, message: "" };
  }
  return { status: "connecting" as const, message: "Ожидаем свежую котировку Pocket Option." };
}

export async function feedClose(symbol: string) {
  await ensureFeed();
  if (!pairs.has(symbol)) throw new Error("Эта пара сейчас недоступна.");
  const quote = quotes.get(symbol);
  if (quote && Date.now() - quote.at < 800) return quote.price;
  return waitQuote(symbol);
}

export async function feedSignal(symbol: string, expirySeconds: number): Promise<FeedSignalResult> {
  if (!isValidExpirySeconds(expirySeconds)) throw new Error("Выберите срок экспирации от 1 минуты до 4 часов.");
  await ensureFeed();
  subscribe(symbol);
  const analysisSeconds = analysisPeriodForExpiry(expirySeconds);
  const candles = await loadCandles(symbol, analysisSeconds, CANDIDATE_HISTORY_PAGE_TIMEOUT_MS);
  const pair = pairs.get(symbol);
  if (!pair) throw new Error("Эта пара сейчас недоступна.");
  const review = await analyzeMarketCandidates(expirySeconds, analysisSeconds, [
    { symbol, name: pair.name, candles },
  ]);
  if (review.decision === "pass") return review;
  if (!acceptsMarketAiReview(review, [symbol])) {
    return { decision: "pass", reason: "Ответ ИИ не прошёл проверку пары и направления; сигнал не выдан." };
  }
  const signal = buildDirectAiSignal(candles, expirySeconds, analysisSeconds, pair.name, pair.payout, review);
  signal.openPrice = await waitQuote(symbol);
  return { decision: "signal", ...signal };
}

export async function feedBest(
  expirySeconds: number,
  excludedSymbols: string[] = [],
): Promise<FeedBestResult> {
  const startedAt = performance.now();
  let stage = "validation";
  let feedMs = 0;
  let historyMs = 0;
  let analysisMs = 0;
  let quoteMs = 0;
  let poolSize = 0;
  let historyResponses = 0;
  let candidateCount = 0;
  const logTiming = (decision: "signal" | "pass" | "error", error?: unknown) => {
    console.info("[signal-search]", JSON.stringify({
      decision,
      stage,
      totalMs: Math.round(performance.now() - startedAt),
      feedMs: Math.round(feedMs),
      historyMs: Math.round(historyMs),
      analysisMs: Math.round(analysisMs),
      quoteMs: Math.round(quoteMs),
      poolSize,
      historyResponses,
      candidateCount,
      ...(error ? { errorType: error instanceof Error ? error.name : typeof error } : {}),
    }));
  };

  try {
    if (!isValidExpirySeconds(expirySeconds)) throw new Error("Выберите срок экспирации от 1 минуты до 4 часов.");
    stage = "feed";
    const feedStartedAt = performance.now();
    await ensureFeed();
    feedMs = performance.now() - feedStartedAt;
    const analysisSeconds = analysisPeriodForExpiry(expirySeconds);
    const ranked = [...pairs.values()]
      .filter((pair) => pair.payout === 92 || pair.payout === 80)
      .sort((a, b) => b.payout - a.payout);
    if (ranked.length === 0) throw new Error("Нет активных пар с выплатой 92% или 80%.");
    const excluded = new Set(excludedSymbols.slice(0, 24).map((symbol) => symbol.toLowerCase()));
    const available = ranked.filter((pair) => !excluded.has(pair.symbol.toLowerCase()));
    if (available.length === 0) {
      throw new Error("Все подходящие пары недавно выдавались. Повтор по той же паре временно остановлен.");
    }
    const pool = selectSignalCandidates(available);
    poolSize = pool.length;
    if (pool.length === 0) throw new Error("Нет активных пар с выплатой 92% или 80%.");
    const candidates: Array<{ pair: FeedPair; candles: HistoricalCandle[] }> = [];
    let historyFailure = "";
    stage = "history";
    const historyStartedAt = performance.now();
    let historyResults: Awaited<ReturnType<typeof loadCandidatesInParallel<FeedPair, HistoricalCandle[]>>>;
    try {
      historyResults = await loadCandidatesInParallel(
        pool,
        (pair) => loadCandles(pair.symbol, analysisSeconds, CANDIDATE_HISTORY_PAGE_TIMEOUT_MS),
      );
    } finally {
      historyMs = performance.now() - historyStartedAt;
    }
    for (const result of historyResults) {
      if (!result.ok) {
        if (!historyFailure && result.error instanceof Error) historyFailure = result.error.message;
        continue;
      }
      historyResponses += 1;
      if (result.value.length < MIN_DIRECT_AI_CANDLES) continue;
      candidates.push({ pair: result.item, candles: result.value });
    }
    candidateCount = candidates.length;
    if (candidates.length === 0) {
      if (historyResponses === 0 && historyFailure) {
        throw new Error(`Не удалось получить историю свечей Pocket Option: ${historyFailure}`);
      }
      throw new Error(`Не удалось получить по Pocket Option минимум ${MIN_DIRECT_AI_CANDLES} исторических свечей ни для одной пары.`);
    }
    stage = "analysis";
    const analysisStartedAt = performance.now();
    let review: MarketAiReview;
    try {
      review = await analyzeMarketCandidates(
        expirySeconds,
        analysisSeconds,
        candidates.map((candidate) => ({
          symbol: candidate.pair.symbol,
          name: candidate.pair.name,
          candles: candidate.candles,
        })),
      );
    } finally {
      analysisMs = performance.now() - analysisStartedAt;
    }
    if (review.decision === "pass") {
      stage = "complete";
      logTiming("pass");
      return review;
    }
    const best = candidates.find((candidate) => candidate.pair.symbol === review.symbol);
    if (!best || !acceptsMarketAiReview(review, candidates.map((candidate) => candidate.pair.symbol))) {
      stage = "complete";
      logTiming("pass");
      return { decision: "pass", reason: "Ответ ИИ указал пару вне доступного списка; сигнал не выдан." };
    }
    const signal = buildDirectAiSignal(
      best.candles,
      expirySeconds,
      analysisSeconds,
      best.pair.name,
      best.pair.payout,
      review,
    );
    stage = "fresh-quote";
    const quoteStartedAt = performance.now();
    signal.openPrice = await waitQuote(best.pair.symbol);
    quoteMs = performance.now() - quoteStartedAt;
    stage = "complete";
    logTiming("signal");
    return {
      decision: "signal",
      ...signal,
      symbol: best.pair.symbol,
      group: best.pair.group,
      seconds: expirySeconds,
      analysisSeconds,
    };
  } catch (error) {
    logTiming("error", error);
    throw error;
  }
}
