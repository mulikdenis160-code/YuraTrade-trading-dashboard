import WebSocket from "ws";
import {
  AI_HISTORY_CANDLES,
  analyzeCandleHistory,
  MIN_LIVE_WIN_PROBABILITY,
  MIN_AI_SAMPLES,
  type AiCandleDecision,
} from "./signal-model.server";
import {
  acceptsMarketAiReview,
  analyzeMarketCandidates,
  DIRECT_AI_MODEL,
  type MarketAiReview,
} from "./market-ai.server";
import {
  analysisPeriodForExpiry,
  formatExpiry,
  isValidExpirySeconds,
} from "./expiry";

const FEED_URL = "wss://api-msk.po.market/socket.io/?EIO=4&transport=websocket";
const FEED_AUTH = process.env.POCKET_OPTION_FEED_AUTH ?? "";
const AUTH_MISSING_MESSAGE =
  "Не настроена свежая авторизация Pocket Option. Добавьте её в Replit Secrets как POCKET_OPTION_FEED_AUTH.";
const AUTH_REJECTED_MESSAGE =
  "Pocket Option отклонил авторизацию. Проверьте актуальность секрета POCKET_OPTION_FEED_AUTH.";
const HISTORY_PAGE_CANDLES = 150;

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
  ruleScore: number;
  aiProbability: number;
  aiExpectedValue: number;
  aiBrierScore: number;
  aiBaselineBrier: number;
  aiSamples: number;
  aiValidationTrades: number;
  aiValidationReturn: number;
};

type Candle = { open: number; close: number; high: number; low: number };
type HistoricalCandle = Candle & { time: number };
type ReadySignalCandidate = {
  signal: FeedSignal;
  symbol: string;
  group: PairGroup;
  candles: HistoricalCandle[];
};

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
let expectHistory = false;
let expectBalance = false;
const quotes = new Map<string, { price: number; at: number }>();
let expectStream = false;
let pending: Pending | null = null;

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

function buildAiSignal(
  candles: HistoricalCandle[],
  expirySeconds: number,
  analysisSeconds: number,
  name: string,
  payout: number,
): FeedSignal | AiCandleDecision {
  const decision = analyzeCandleHistory(candles, expirySeconds, analysisSeconds, payout);
  if (decision.status !== "ready") return decision;

  const pack = candles.slice(-28);
  const price = candles[candles.length - 1]?.close ?? 0;
  const sample = pack[pack.length - 1]?.close ?? price;
  const digits = sample >= 100 ? 2 : sample >= 10 ? 3 : 5;
  const cut = (value: number) => Number(value.toFixed(digits));
  const directionLabel = decision.direction === "call" ? "вверх" : "вниз";
  const signedValue = `${decision.expectedValue >= 0 ? "+" : ""}${decision.expectedValue.toFixed(3)}`;

  return {
    name,
    payout,
    direction: decision.direction,
    openPrice: price,
    analysisSeconds,
    ruleScore: decision.probability,
    aiProbability: decision.probability,
    aiExpectedValue: decision.expectedValue,
    aiBrierScore: decision.brierScore,
    aiBaselineBrier: decision.baselineBrier,
    aiSamples: decision.sampleCount,
    aiValidationTrades: decision.validationTrades,
    aiValidationReturn: decision.validationReturn,
    note: [
      `Статистическая проверка подтвердила направление ${directionLabel} по свечам Pocket Option WebSocket.`,
      `Калиброванная вероятность выигрыша направления: ${(decision.probability * 100).toFixed(1)}%.`,
      `Ожидаемое значение на ставку 1 ед.: ${signedValue} ед.`,
      `Проверочный процент побед: ${(decision.validationWinRate * 100).toFixed(1)}% на ${decision.validationTrades} входах.`,
      `Проверка калибровки на более поздних свечах: Brier ${decision.brierScore.toFixed(3)} против базовых ${decision.baselineBrier.toFixed(3)}.`,
      `Экспирация ${formatExpiry(expirySeconds)}; интервал свечи ${formatExpiry(analysisSeconds)}.`,
    ].join("\n"),
    bars: pack.map((candle) => [
      cut(candle.open),
      cut(candle.high),
      cut(candle.low),
      cut(candle.close),
    ]),
  };
}

function appendDirectAiReview(signal: FeedSignal, review: Extract<MarketAiReview, { decision: "signal" }>) {
  const directionLabel = review.direction === "call" ? "CALL (вверх)" : "PUT (вниз)";
  signal.note = [
    signal.note,
    `Прямой анализ OpenAI ${DIRECT_AI_MODEL}: ${directionLabel}; самооценка уверенности ${review.confidence}/100.`,
    `Комментарий OpenAI: ${review.reason}`,
    "Самооценка OpenAI не является калиброванной исторической точностью; сигнал выдан только при совпадении со статистической проверкой.",
  ].join("\n");
}

function aiNotReadyMessage(decision: AiCandleDecision | null) {
  if (!decision || decision.status === "ready") {
    return "ИИ не нашёл направление с положительным ожидаемым значением.";
  }
  if (decision.status === "no-edge") {
    return `Нет сигнала с вероятностью победы не ниже ${(MIN_LIVE_WIN_PROBABILITY * 100).toFixed(0)}% и положительным ожидаемым значением.`;
  }
  if (decision.reason === "insufficient-history") {
    return `ИИ не получил достаточно исторических свечей для обучения и проверки (найдено ${decision.sampleCount} примеров, нужно не менее ${MIN_AI_SAMPLES}).`;
  }
  if (decision.reason === "class-balance") {
    return "ИИ не может надёжно проверить модель: в исторических свечах недостаточно примеров обоих направлений.";
  }
  return "ИИ-модель не прошла проверку на более поздних свечах. Сигнал не выдан.";
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
  subscribe(symbol);
  const started = Date.now();
  return new Promise<number>((resolve, reject) => {
    const timer = setInterval(() => {
      const quote = quotes.get(symbol);
      if (quote && quote.at >= started - 250) {
        clearInterval(timer);
        clearTimeout(stop);
        resolve(quote.price);
      }
    }, 200);
    const stop = setTimeout(() => {
      clearInterval(timer);
      const quote = quotes.get(symbol);
      if (quote && Date.now() - quote.at <= 2000) resolve(quote.price);
      else reject(new Error("Цена не пришла. Попробуйте ещё раз."));
    }, 5000);
  });
}

function failPending(error: Error) {
  if (!pending) return;
  clearTimeout(pending.timer);
  pending.reject(error);
  pending = null;
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
  if (message.includes("loadHistoryPeriod")) {
    expectHistory = true;
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
  if (expectHistory && message.startsWith("{")) {
    expectHistory = false;
    try {
      const parsed = JSON.parse(message) as { asset?: string; data?: unknown[] };
      if (pending && parsed.asset === pending.asset && Array.isArray(parsed.data)) {
        const candles = asCandles(parsed.data);
        clearTimeout(pending.timer);
        const resolve = pending.resolve;
        pending = null;
        resolve(candles);
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
  });
  socket = next;
  next.on("message", (data) => handleMessage(next, textOf(data)));
  next.on("close", () => {
    if (socket !== next) return;
    socket = null;
    retryAfter = Date.now() + 2000;
    if (!connectionError) connectionError = "Соединение с Pocket Option прервано. Повторяем подключение.";
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

async function loadHistoryPage(symbol: string, seconds: number, time: number) {
  await ensureFeed();
  if (!pairs.has(symbol)) throw new Error("Эта пара сейчас недоступна.");
  if (!socket || socket.readyState !== WebSocket.OPEN) throw new Error("Котировки сейчас недоступны.");
  if (pending) failPending(new Error("Запрос сменён."));
  const current = socket;
  return new Promise<HistoricalCandle[]>((resolve, reject) => {
    const timer = setTimeout(() => {
      if (pending?.asset === symbol) {
        pending = null;
        expectHistory = false;
      }
      reject(new Error("История свечей не пришла. Попробуйте ещё раз."));
    }, 12000);
    pending = { asset: symbol, resolve, reject, timer };
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
      if (pending?.asset === symbol) pending = null;
      expectHistory = false;
      reject(new Error("Не удалось запросить историю свечей Pocket Option."));
    }
  });
}

async function loadCandles(symbol: string, seconds: number) {
  await ensureFeed();
  const collected = new Map<number, HistoricalCandle>();
  let cursor = Math.floor(Date.now() / 1000);
  const maxPages = Math.ceil(AI_HISTORY_CANDLES / HISTORY_PAGE_CANDLES) + 1;
  for (let page = 0; page < maxPages && collected.size < AI_HISTORY_CANDLES; page += 1) {
    const candles = await loadHistoryPage(symbol, seconds, cursor);
    if (candles.length === 0) break;
    const previousSize = collected.size;
    for (const candle of candles) collected.set(candle.time, candle);
    const oldestTime = candles[0].time;
    if (collected.size === previousSize || oldestTime <= 0 || oldestTime >= cursor) break;
    cursor = oldestTime - 1;
  }
  return [...collected.values()]
    .sort((a, b) => a.time - b.time)
    .slice(-AI_HISTORY_CANDLES);
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

export async function feedSignal(symbol: string, expirySeconds: number): Promise<FeedSignal | null> {
  if (!isValidExpirySeconds(expirySeconds)) throw new Error("Выберите срок экспирации от 1 минуты до 4 часов.");
  await ensureFeed();
  subscribe(symbol);
  const analysisSeconds = analysisPeriodForExpiry(expirySeconds);
  const candles = await loadCandles(symbol, analysisSeconds);
  const pair = pairs.get(symbol);
  if (!pair) throw new Error("Эта пара сейчас недоступна.");
  const evaluated = buildAiSignal(candles, expirySeconds, analysisSeconds, pair.name, pair.payout);
  if ("status" in evaluated) {
    if (evaluated.status === "no-edge") return null;
    throw new Error(aiNotReadyMessage(evaluated));
  }
  const review = await analyzeMarketCandidates(expirySeconds, analysisSeconds, [
    { symbol, name: pair.name, candles },
  ]);
  if (review.decision !== "signal") return null;
  if (!acceptsMarketAiReview(review, { symbol, direction: evaluated.direction })) return null;
  appendDirectAiReview(evaluated, review);
  evaluated.openPrice = await waitQuote(symbol);
  return evaluated;
}

export async function feedBest(expirySeconds: number) {
  if (!isValidExpirySeconds(expirySeconds)) throw new Error("Выберите срок экспирации от 1 минуты до 4 часов.");
  await ensureFeed();
  const analysisSeconds = analysisPeriodForExpiry(expirySeconds);
  const ranked = [...pairs.values()]
    .filter((pair) => pair.payout === 92 || pair.payout === 80)
    .sort((a, b) => b.payout - a.payout);
  const live = ranked.filter((pair) => quotes.has(pair.symbol));
  const pool = (live.length >= 4 ? live : ranked).slice(0, 4);
  if (pool.length === 0) throw new Error("Нет активных пар с выплатой 92% или 80%.");
  const candidates: ReadySignalCandidate[] = [];
  let validatedModels = 0;
  let largestSampleCount = 0;
  let latestDecision: AiCandleDecision | null = null;
  for (const pair of pool) {
    try {
      const candles = await loadCandles(pair.symbol, analysisSeconds);
      const evaluated = buildAiSignal(candles, expirySeconds, analysisSeconds, pair.name, pair.payout);
      if ("status" in evaluated) {
        largestSampleCount = Math.max(largestSampleCount, evaluated.sampleCount);
        latestDecision = evaluated;
        if (evaluated.status === "no-edge") validatedModels += 1;
        continue;
      }
      validatedModels += 1;
      candidates.push({ signal: evaluated, symbol: pair.symbol, group: pair.group, candles });
    } catch {
      // Continue to another pair if its history request fails.
    }
  }
  if (candidates.length === 0 && validatedModels === 0) {
    if (latestDecision) throw new Error(aiNotReadyMessage({ ...latestDecision, sampleCount: largestSampleCount }));
    throw new Error("Не удалось получить исторические свечи Pocket Option по WebSocket.");
  }
  if (candidates.length === 0) return null;
  const review = await analyzeMarketCandidates(
    expirySeconds,
    analysisSeconds,
    candidates.map((candidate) => ({
      symbol: candidate.symbol,
      name: candidate.signal.name,
      candles: candidate.candles,
    })),
  );
  if (review.decision !== "signal") return null;
  const best = candidates.find((candidate) => candidate.symbol === review.symbol);
  if (!best || !acceptsMarketAiReview(review, { symbol: best.symbol, direction: best.signal.direction })) {
    return null;
  }
  appendDirectAiReview(best.signal, review);
  best.signal.openPrice = await waitQuote(best.symbol);
  return {
    ...best.signal,
    symbol: best.symbol,
    group: best.group,
    seconds: expirySeconds,
    analysisSeconds,
  };
}
