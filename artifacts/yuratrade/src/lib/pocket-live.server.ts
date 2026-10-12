import WebSocket from "ws";
import {
  activeGeminiModel,
  acceptsMarketAiReview,
  analyzeMarketCandidates,
  DIRECT_AI_HISTORY_CANDLES,
  MIN_DIRECT_AI_CANDLES,
  type MarketAiReview,
} from "./market-ai.server";
import { analysisPeriodForExpiry, formatExpiry, isValidExpirySeconds } from "./expiry";
import { createKeyedAsyncQueue } from "./async-keyed-queue";
import {
  createRotatingCandidateSelector,
  loadCandidatesInParallel,
} from "./signal-candidate-pool.ts";
import {
  appendCoveredFastCandles,
  parsePocketOptionHistory,
  type HistoricalCandle,
  type ParsedHistoryPage,
} from "./pocket-option-history.ts";
import {
  MAX_QUOTE_AGE_MS,
  MIN_ENTRY_BUFFER_MS,
  SIGNAL_CANDLE_SECONDS,
  SIGNAL_ANALYSIS_TIMEOUT_MS,
  SIGNAL_HISTORY_PAGE_TIMEOUT_MS,
  SIGNAL_PREPARATION_TIMEOUT_MS,
  SIGNAL_QUOTE_WAIT_MS,
} from "./signal-config";
import {
  buildPocketAuthFrame,
  buildPocketHistoryRequest,
  buildPocketSubscriptionFrames,
  findPocketRows,
  parsePocketFastHistory,
  parsePocketSocketIoEvent,
  pocketFeedUrlForAuth,
} from "./pocket-feed-frame";
import {
  estimatePocketServerClockOffsetSeconds,
  pocketHistoryCandleLocalTime,
  pocketHistoryRequestTime,
} from "./pocket-server-time";
import { nextCandleEntryWindow } from "./signal-entry-window";
import { settleSignalRequest, waitForSignalRequest } from "./signal-request.ts";
import { signalReleaseAt } from "./signal-release-time";

const FEED_AUTH = (process.env.POCKET_OPTION_FEED_AUTH ?? "").trim();
const AUTH_MISSING_MESSAGE =
  "Не настроена свежая авторизация Pocket Option. Добавьте её в Replit Secrets как POCKET_OPTION_FEED_AUTH.";
const AUTH_REJECTED_MESSAGE =
  "Pocket Option отклонил авторизацию. Проверьте актуальность секрета POCKET_OPTION_FEED_AUTH.";
const HISTORY_PAGE_CANDLES = 128;
const SIGNAL_CANDIDATES_PER_SEARCH = 1;
const MAX_ELIGIBLE_PAIRS = 8;
const ELIGIBLE_PAYOUTS = new Set([80, 92]);
const CANDIDATE_HISTORY_PAGE_TIMEOUT_MS = 4_500;
const SIGNAL_PREPARATION_TIMEOUT_MESSAGE =
  "Поиск сигнала не завершился за 20 секунд. Сигнал не выдан.";
const runBrokerCommand = createKeyedAsyncQueue();
const BROKER_QUEUE_KEY = "single-pocket-option-connection";

function waitForSignalPreparation<T>(request: Promise<T>, deadlineAtMs: number): Promise<T> {
  return waitForSignalRequest(
    settleSignalRequest(request),
    Math.max(0, deadlineAtMs - Date.now()),
    SIGNAL_PREPARATION_TIMEOUT_MESSAGE,
  );
}

export type PairGroup = "fx" | "crypto" | "stock" | "commodity";

export type FeedPair = {
  symbol: string;
  name: string;
  payout: number;
  group: PairGroup;
};

export type FeedSignalPair = Pick<FeedPair, "symbol" | "name" | "payout"> & {
  group: "fx";
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
type PreparedSignalResult = SignalResult & { releaseAtMs: number };
type BestSignalResult = SignalResult & {
  symbol: string;
  group: PairGroup;
  seconds: number;
};
export type FeedSignalResult = PassResult | PreparedSignalResult;
export type FeedBestResult = PassResult | BestSignalResult;

type Pending = {
  asset: string;
  periodSeconds: number;
  resolve: (history: ParsedHistoryPage) => void;
  reject: (error: Error) => void;
  timer: ReturnType<typeof setTimeout>;
};

type LoadedHistory = { candles: HistoricalCandle[]; rejectedRows: number };
type PairTick = { price: number; time: number };
type PairMarketData = {
  ticks: PairTick[];
  history: HistoricalCandle[];
  historyPeriodSeconds: number | null;
};

const pairs = new Map<string, FeedPair>();
const pairMarketData = new Map<string, PairMarketData>();
let balance: number | null = null;
let socket: WebSocket | null = null;
let ready: Promise<void> | null = null;
let isAuthorized = false;
let connectionError = "";
let retryAfter = 0;
let expectAssets = false;
let expectBalance = false;
let lastPocketMessageAt = 0;
let pocketServerClockOffsetSeconds: number | null = null;
const selectSignalCandidates = createRotatingCandidateSelector<FeedPair>(SIGNAL_CANDIDATES_PER_SEARCH);
let expectStream = false;
const pendingHistory = new Map<string, Pending>();
let lastStreamDiagnosticAt = 0;
let lastStaleHistoryReconnectAt = 0;
let staleHistoryReconnectInFlight: Promise<void> | null = null;
let feedWarmupStarted = false;

const STALE_HISTORY_RECONNECT_COOLDOWN_MS = 5 * 60_000;

function latestPairTick(symbol: string) {
  const ticks = pairMarketData.get(symbol)?.ticks;
  return ticks?.at(-1) ?? null;
}

function latestPairQuote(symbol: string) {
  const tick = latestPairTick(symbol);
  return tick ? { price: tick.price, at: tick.time } : null;
}

function logStreamDiagnostic(level: "info" | "warn", details: Record<string, unknown>) {
  const now = Date.now();
  if (now - lastStreamDiagnosticAt < 15_000) return;
  lastStreamDiagnosticAt = now;
  const entry = JSON.stringify(details);
  if (level === "warn") console.warn("[pocket-feed-stream]", entry);
  else console.info("[pocket-feed-stream]", entry);
}

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
  const model = activeGeminiModel();
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
      `Анализ ${model.label} (${model.model}) выбрал ${directionLabel}.`,
      `Самооценка ИИ: ${review.confidence}/100; это субъективная оценка, а не измеренная вероятность или историческая точность.`,
      `ИИ — объяснение: ${review.explanation}`,
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

function rememberTickRows(rows: unknown, frameFormat: string) {
  if (!Array.isArray(rows)) return;
  const receivedAtMs = Date.now();
  let quoteRows = 0;
  let epochLikeTimestamps = 0;
  for (const row of rows) {
    if (!Array.isArray(row) || row.length < 3 || typeof row[0] !== "string") continue;
    const rawTimestamp = Number(row[1]);
    const serverTimeMs = rawTimestamp >= 1_000_000_000_000
      ? rawTimestamp
      : rawTimestamp * 1000;
    if (Number.isFinite(rawTimestamp) && Math.abs(rawTimestamp) >= 1_000_000_000) {
      epochLikeTimestamps += 1;
    }
    const offsetSeconds = estimatePocketServerClockOffsetSeconds(
      rawTimestamp,
      receivedAtMs,
    );
    if (offsetSeconds !== null && pocketServerClockOffsetSeconds === null) {
      pocketServerClockOffsetSeconds = offsetSeconds;
      console.info("[pocket-feed-clock-synced]", JSON.stringify({ offsetSeconds, source: "updateStream" }));
    }
    const price = Number(row[2]);
    const clockOffsetSeconds = pocketServerClockOffsetSeconds ?? offsetSeconds;
    if (
      !Number.isFinite(rawTimestamp) ||
      rawTimestamp <= 0 ||
      !Number.isFinite(price) ||
      price <= 0 ||
      clockOffsetSeconds === null
    ) continue;
    const symbol = String(row[0]);
    const tickTime = Math.min(
      receivedAtMs,
      serverTimeMs - clockOffsetSeconds * 1000,
    );
    const state = pairMarketData.get(symbol) ?? {
      ticks: [],
      history: [],
      historyPeriodSeconds: null,
    };
    state.ticks.push({ price, time: tickTime });
    state.ticks.sort((left, right) => left.time - right.time);
    if (state.ticks.length > 2_000) state.ticks.splice(0, state.ticks.length - 2_000);
    pairMarketData.set(symbol, state);
    quoteRows += 1;
  }
  logStreamDiagnostic("info", {
    frameFormat,
    receivedRows: rows.length,
    quoteRows,
    epochLikeTimestamps,
    clockSynced: pocketServerClockOffsetSeconds !== null,
  });
}

function rememberFastHistory(payload: unknown) {
  const update = parsePocketFastHistory(payload);
  if (!update) {
    const record = payload && typeof payload === "object" && !Array.isArray(payload)
      ? payload as Record<string, unknown>
      : null;
    const history = record?.history;
    console.warn("[pocket-fast-history-unusable]", JSON.stringify({
      payloadType: Array.isArray(payload) ? "array" : typeof payload,
      keys: record ? Object.keys(record).slice(0, 12) : [],
      assetType: typeof record?.asset,
      periodType: typeof record?.period,
      historyType: Array.isArray(history) ? "array" : typeof history,
      historyLength: Array.isArray(history) ? history.length : null,
      firstRowLength: Array.isArray(history) && Array.isArray(history[0])
        ? history[0].length
        : null,
    }));
    return;
  }
  const receivedAtMs = Date.now();
  const clockOffsetSeconds = pocketServerClockOffsetSeconds;
  if (clockOffsetSeconds === null) {
    console.warn("[pocket-fast-history-unusable]", JSON.stringify({
      symbol: update.asset,
      reason: "clock-not-synced",
      tickCount: update.ticks.length,
    }));
    return;
  }
  const ticks: PairTick[] = [];
  for (const tick of update.ticks) {
    const rawTime = tick.time >= 1_000_000_000_000 ? tick.time / 1000 : tick.time;
    ticks.push({
      time: (rawTime - clockOffsetSeconds) * 1000,
      price: tick.price,
    });
  }
  if (ticks.length === 0) return;
  const state = pairMarketData.get(update.asset) ?? {
    ticks: [],
    history: [],
    historyPeriodSeconds: null,
  };
  const byTime = new Map(state.ticks.map((tick) => [tick.time, tick]));
  for (const tick of ticks) byTime.set(tick.time, tick);
  state.ticks = [...byTime.values()]
    .sort((left, right) => left.time - right.time)
    .slice(-2_000);
  pairMarketData.set(update.asset, state);
  console.info("[pocket-fast-history]", JSON.stringify({
    symbol: update.asset,
    periodSeconds: update.periodSeconds,
    tickCount: ticks.length,
    oldestTickTime: Math.floor(Math.min(...ticks.map((tick) => tick.time)) / 1000),
    newestTickAgeMs: Math.max(0, Date.now() - Math.max(...ticks.map((tick) => tick.time))),
  }));
}

function rememberTicks(message: string, frameFormat = "split-array") {
  try {
    const parsed: unknown = JSON.parse(message);
    const rows = findPocketRows(
      parsed,
      (row) => typeof row[0] === "string" && row.length >= 3,
    );
    if (rows) {
      rememberTickRows(rows, frameFormat);
    } else {
      logStreamDiagnostic("warn", {
        frameFormat,
        payloadType: Array.isArray(parsed) ? "array" : typeof parsed,
        topLevelLength: Array.isArray(parsed) ? parsed.length : null,
        clockSynced: pocketServerClockOffsetSeconds !== null,
      });
    }
  } catch {
    logStreamDiagnostic("warn", { frameFormat, payloadType: "invalid-json" });
  }
}

const subscribedAt = new Map<string, number>();

function sendPocketSubscription(target: WebSocket, symbol: string, periodSeconds: number) {
  for (const frame of buildPocketSubscriptionFrames(symbol, periodSeconds)) target.send(frame);
  console.info(
    "[pocket-feed-subscribe]",
    JSON.stringify({ symbol, periodSeconds, socketReadyState: target.readyState }),
  );
}

function subscribe(symbol: string, periodSeconds = 1) {
  const now = Date.now();
  const key = `${symbol}:${periodSeconds}`;
  if (now - (subscribedAt.get(key) ?? 0) < 2000) return;
  if (!socket || socket.readyState !== WebSocket.OPEN) return;
  subscribedAt.set(key, now);
  void runBrokerCommand(BROKER_QUEUE_KEY, async () => {
    const current = socket;
    if (current && current.readyState === WebSocket.OPEN) {
      sendPocketSubscription(current, symbol, periodSeconds);
    }
  }).catch(() => {});
}

function waitQuote(symbol: string, timeoutMs = 12_000) {
  const current = latestPairQuote(symbol);
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
      const quote = latestPairQuote(symbol);
      if (quote && quote.at >= started - 250) {
        accept(quote.price);
      }
    }, 200);
    retryTimer = setInterval(() => {
      const quote = latestPairQuote(symbol);
      if (!quote || Date.now() - quote.at > 2000) subscribe(symbol);
    }, 500);
    stopTimer = setTimeout(() => {
      if (settled) return;
      settled = true;
      clearTimers();
      const quote = latestPairQuote(symbol);
      if (quote && Date.now() - quote.at <= 2000) resolve(quote.price);
      else reject(new Error(
        `Цена по паре ${symbol} не пришла за ${Math.ceil(timeoutMs / 1000)} секунд. Попробуйте ещё раз.`,
      ));
    }, timeoutMs);
  });
}

function freshQuoteFromCache(symbol: string) {
  const quote = latestPairQuote(symbol);
  if (!quote || !Number.isFinite(quote.price) || quote.price <= 0) {
    throw new Error(`Не удалось получить живую котировку по паре ${symbol}.`);
  }
  const ageMs = Date.now() - quote.at;
  if (ageMs < 0 || ageMs > MAX_QUOTE_AGE_MS) {
    throw new Error(`Текущий тик по паре ${symbol} старше 2 секунд. Сигнал не выдан.`);
  }
  return {
    price: quote.price,
    ageMs,
  };
}

async function waitFreshQuote(symbol: string, timeoutMs = 12_000) {
  await waitQuote(symbol, timeoutMs);
  return freshQuoteFromCache(symbol);
}

function entryWindowFailure(candles: HistoricalCandle[], nowMs = Date.now()): PassResult | null {
  const window = nextCandleEntryWindow(candles, nowMs);
  if (!window) {
    return {
      decision: "pass",
      reason: "Не удалось подтвердить закрытие минутной свечи и начало следующей. Сигнал не выдан.",
    };
  }
  if (!window.canEnter) {
    return {
      decision: "pass",
      reason: window.remainingMs < MIN_ENTRY_BUFFER_MS
        ? "Не удалось подтвердить безопасное минутное окно. Свежая свеча не подтверждена, сигнал не выдан."
        : "Следующая минутная свеча ещё не открылась. Сигнал не выдан.",
    };
  }
  return null;
}

function failPending(error: Error) {
  for (const request of pendingHistory.values()) {
    clearTimeout(request.timer);
    request.reject(error);
  }
  pendingHistory.clear();
}

async function reconnectFeedForStaleHistory(symbol: string, ageSeconds: number | null) {
  if (staleHistoryReconnectInFlight) {
    try {
      await staleHistoryReconnectInFlight;
    } catch {
      /* the in-flight reconnect logs its own failure */
    }
    return;
  }
  if (Date.now() - lastStaleHistoryReconnectAt < STALE_HISTORY_RECONNECT_COOLDOWN_MS) {
    console.info("[pocket-feed-stale-reconnect-skipped]", JSON.stringify({
      symbol,
      reason: "cooldown",
      ageSeconds,
    }));
    return;
  }

  lastStaleHistoryReconnectAt = Date.now();
  staleHistoryReconnectInFlight = (async () => {
    console.warn("[pocket-feed-stale-reconnect-start]", JSON.stringify({ symbol, ageSeconds }));
    const oldSocket = socket;
    socket = null;
    pairs.clear();
    subscribedAt.clear();
    pocketServerClockOffsetSeconds = null;
    failPending(new Error("Поток Pocket Option переподключается после устаревшей истории."));
    if (oldSocket) {
      oldSocket.on("error", () => {});
      try {
        oldSocket.terminate();
      } catch {
        /* socket already closed */
      }
    }
    retryAfter = Date.now() + 250;
    await ensureFeed();
    console.info("[pocket-feed-stale-reconnect-ready]", JSON.stringify({ symbol }));
  })();

  try {
    await staleHistoryReconnectInFlight;
  } catch (error) {
    console.warn("[pocket-feed-stale-reconnect-failed]", JSON.stringify({
      symbol,
      error: error instanceof Error ? error.message : String(error),
    }));
  } finally {
    staleHistoryReconnectInFlight = null;
  }
}

function handleMessage(current: WebSocket, message: string) {
  lastPocketMessageAt = Date.now();
  if (message.startsWith("0") && message.includes("sid")) {
    current.send("40");
    return;
  }
  if (message === "2") {
    current.send("3");
    return;
  }
  if (message.startsWith("40") && message.includes("sid")) {
    const authFrame = buildPocketAuthFrame(FEED_AUTH);
    if (!authFrame) {
      connectionError = "Неверный формат авторизации Pocket Option.";
      console.error("[pocket-feed-auth-format-invalid]");
      current.close();
      return;
    }
    current.send(authFrame);
    return;
  }
  if (message.includes("NotAuthorized")) {
    isAuthorized = false;
    connectionError = AUTH_REJECTED_MESSAGE;
    console.warn("[pocket-feed-auth-rejected]", JSON.stringify({ socketReadyState: current.readyState }));
    failPending(new Error(connectionError));
    try {
      current.close();
    } catch {
      /* already closed */
    }
    return;
  }
  const socketEvent = parsePocketSocketIoEvent(message);
  if (socketEvent?.name === "successauth" || message.includes("successauth")) {
    isAuthorized = true;
    connectionError = "";
    console.info("[pocket-feed-authenticated]", JSON.stringify({
      socketReadyState: current.readyState,
      activePairs: pairs.size,
    }));
    return;
  }
  if (socketEvent?.name === "updateAssets") {
    const rows = findPocketRows(
      socketEvent.payload,
      (row) => row.length >= 15 && row[14] === true && row[9] === 1,
    );
    if (rows) {
      storeAssets(rows);
      console.info("[pocket-feed-assets]", JSON.stringify({
        receivedRows: rows.length,
        activePairs: pairs.size,
        socketReadyState: current.readyState,
        frameFormat: "socket.io-inline",
      }));
    } else {
      expectAssets = true;
    }
    return;
  }
  if (socketEvent?.name === "updateStream") {
    const rows = findPocketRows(
      socketEvent.payload,
      (row) => typeof row[0] === "string" && row.length >= 3,
    );
    if (rows) {
      expectStream = false;
      rememberTickRows(rows, "socket.io-inline");
    } else {
      expectStream = true;
      logStreamDiagnostic("warn", {
        payloadType: Array.isArray(socketEvent.payload) ? "array" : typeof socketEvent.payload,
        topLevelLength: Array.isArray(socketEvent.payload) ? socketEvent.payload.length : null,
        frameFormat: "socket.io-inline",
        clockSynced: pocketServerClockOffsetSeconds !== null,
      });
    }
    return;
  }
  if (socketEvent?.name === "updateHistoryNewFast") {
    rememberFastHistory(socketEvent.payload);
    return;
  }
  if (message.includes("updateAssets")) {
    expectAssets = true;
    return;
  }
  if (expectAssets && message.startsWith("[")) {
    expectAssets = false;
    try {
      const rows = JSON.parse(message) as unknown[];
      storeAssets(rows);
      console.info("[pocket-feed-assets]", JSON.stringify({
        receivedRows: rows.length,
        activePairs: pairs.size,
        socketReadyState: current.readyState,
      }));
    } catch {
      console.warn("[pocket-feed-assets-parse-failed]", JSON.stringify({
        socketReadyState: current.readyState,
        frameLength: message.length,
      }));
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
          const serverClockOffsetSeconds = pocketServerClockOffsetSeconds;
          if (serverClockOffsetSeconds === null) {
            request.reject(new Error("Время потока Pocket Option не синхронизировано."));
            return;
          }
          const parsedHistory = parsePocketOptionHistory(parsed.data);
          const history: ParsedHistoryPage = {
            ...parsedHistory,
            candles: parsedHistory.candles.map((candle) => ({
              ...candle,
              time: pocketHistoryCandleLocalTime(candle.time, serverClockOffsetSeconds),
            })),
          };
            const state = pairMarketData.get(parsed.asset) ?? {
              ticks: [],
              history: [],
              historyPeriodSeconds: null,
            };
            state.history = history.candles.slice(-DIRECT_AI_HISTORY_CANDLES);
            state.historyPeriodSeconds = request.periodSeconds;
            pairMarketData.set(parsed.asset, state);
          console.info("[pocket-history-response]", JSON.stringify({
            symbol: parsed.asset,
            periodSeconds: request.periodSeconds,
            receivedRows: parsed.data.length,
            validCandles: history.candles.length,
            rejectedRows: history.rejectedRows,
            latestClosedAgeSeconds: history.candles
              .filter((candle) => candle.time + request.periodSeconds <= Date.now() / 1000)
              .at(-1)
              ? Math.round(Date.now() / 1000 - (
                  history.candles
                    .filter((candle) => candle.time + request.periodSeconds <= Date.now() / 1000)
                    .at(-1)!.time + request.periodSeconds
                ))
              : null,
            candleTimestampBasis: "open",
          }));
          request.resolve(history);
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
    console.error("[pocket-feed-auth-missing]");
    throw new Error(connectionError);
  }
  const feedUrl = pocketFeedUrlForAuth(FEED_AUTH);
  if (!feedUrl) {
    connectionError =
      "Неверный формат авторизации Pocket Option: нужен полный кадр 42[\"auth\",…] с полем isDemo.";
    console.error("[pocket-feed-auth-format-invalid]");
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
  isAuthorized = false;
  pocketServerClockOffsetSeconds = null;
  subscribedAt.clear();
  console.info("[pocket-feed-region-selected]", JSON.stringify({
    account: feedUrl.includes("demo-api-") ? "demo" : "real",
    region: "eu",
  }));
  const next = new WebSocket(feedUrl, {
    headers: {
      Origin: "https://pocketoption.com",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36 Edg/154.0.0.0",
    },
    handshakeTimeout: 8000,
  });
  next.on("error", (error) => {
    if (socket !== next) return;
    console.error("[pocket-feed-error]", JSON.stringify({
      errorName: error.name,
      socketReadyState: next.readyState,
    }));
    socket = null;
    isAuthorized = false;
    retryAfter = Date.now() + 2000;
    connectionError = "Не удалось подключиться к потоку Pocket Option. Повторяем подключение.";
    failPending(new Error(connectionError));
  });
  socket = next;
  next.on("message", (data) => handleMessage(next, textOf(data)));
  const closeEventSocket = next as unknown as {
    on: (event: "close", listener: (code: number, reason: Buffer) => void) => unknown;
  };
  closeEventSocket.on("close", (code, reason) => {
    if (socket !== next) return;
    console.warn("[pocket-feed-closed]", JSON.stringify({
      socketReadyState: next.readyState,
      closeCode: code,
      closeReasonLength: reason.length,
    }));
    socket = null;
    isAuthorized = false;
    retryAfter = Date.now() + 2000;
    if (!connectionError) connectionError = "Соединение с Pocket Option прервано. Повторяем подключение.";
    failPending(new Error(connectionError));
  });
}

function ensureFeed() {
  if (isAuthorized && pairs.size > 0 && socket && socket.readyState === WebSocket.OPEN) {
    return Promise.resolve();
  }
  if (ready) return ready;
  connect();
  ready = new Promise<void>((resolve, reject) => {
    const started = Date.now();
    const timer = setInterval(() => {
      if (isAuthorized && pairs.size > 0 && socket && socket.readyState === WebSocket.OPEN) {
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

export function startPocketFeed() {
  if (feedWarmupStarted) return;
  feedWarmupStarted = true;
  void (async () => {
    while (feedWarmupStarted) {
      try {
        await ensureFeed();
        const candidates = rankedSignalPairs();
        for (const pair of candidates) {
          if (!feedWarmupStarted) return;
          // Keep quote and candle subscriptions hot; history requests run FIFO.
          subscribe(pair.symbol, 1);
          subscribe(pair.symbol, SIGNAL_CANDLE_SECONDS);
          const state = pairMarketData.get(pair.symbol);
          if (
            state?.historyPeriodSeconds !== SIGNAL_CANDLE_SECONDS ||
            !historyIsFresh(state.history, SIGNAL_CANDLE_SECONDS) ||
            closedHistory(state.history, SIGNAL_CANDLE_SECONDS).length < MIN_DIRECT_AI_CANDLES
          ) {
            await loadCandles(
              pair.symbol,
              SIGNAL_CANDLE_SECONDS,
              SIGNAL_HISTORY_PAGE_TIMEOUT_MS,
              1,
            );
          }
        }
      } catch (error) {
        console.warn("[pocket-feed-warmup]", JSON.stringify({
          errorName: error instanceof Error ? error.name : typeof error,
          activePairs: pairs.size,
          socketReadyState: socket?.readyState ?? null,
        }));
      }
      await new Promise((resolve) => setTimeout(resolve, 3_000));
    }
  })();
}

function rankedSignalPairs() {
  return [...pairs.values()]
    .filter((pair) =>
      pair.group === "fx" &&
      pair.symbol.toLowerCase().includes("otc") &&
      ELIGIBLE_PAYOUTS.has(pair.payout),
    )
    .sort((a, b) => b.payout - a.payout || a.name.localeCompare(b.name))
    .slice(0, MAX_ELIGIBLE_PAIRS);
}

function selectRotatingSignalPair(
  ranked: FeedPair[],
  excludedSymbols: string[] = [],
) {
  const excluded = new Set(excludedSymbols.map((symbol) => symbol.toLowerCase()));
  for (let index = 0; index < ranked.length; index += 1) {
    const next = selectSignalCandidates(ranked)[0];
    if (next && !excluded.has(next.symbol.toLowerCase())) return next;
  }
  return selectSignalCandidates(ranked)[0] ?? null;
}

export async function feedNextPair(excludedSymbols: string[] = []): Promise<FeedSignalPair> {
  await ensureFeed();
  const ranked = rankedSignalPairs();
  if (ranked.length === 0) {
    throw new Error("Нет активных OTC-валютных пар с выплатой ровно 80% или 92%.");
  }
  const pair = selectRotatingSignalPair(ranked, excludedSymbols.slice(0, 24));
  if (!pair) throw new Error("Не удалось выбрать валютную пару.");
  return { symbol: pair.symbol, name: pair.name, payout: pair.payout, group: "fx" };
}

async function loadHistoryPage(
  symbol: string,
  seconds: number,
  time: number,
  timeoutMs = 12_000,
): Promise<ParsedHistoryPage> {
  // Pocket's history frames have no request ID, so serialize all requests,
  // including requests for different symbols and periods.
  return runBrokerCommand(BROKER_QUEUE_KEY, async () => {
    await ensureFeed();
    if (!pairs.has(symbol)) throw new Error("Эта пара сейчас недоступна.");
    if (!socket || socket.readyState !== WebSocket.OPEN) throw new Error("Котировки сейчас недоступны.");
    const clockDeadline = Date.now() + Math.min(timeoutMs, 2000);
    while (pocketServerClockOffsetSeconds === null && Date.now() < clockDeadline) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    const clockOffsetSeconds = pocketServerClockOffsetSeconds;
    if (clockOffsetSeconds === null) {
      console.warn("[pocket-history-clock-unsynced]", JSON.stringify({
        symbol,
        periodSeconds: seconds,
        socketReadyState: socket?.readyState ?? null,
        pairAvailable: pairs.has(symbol),
      }));
      throw new Error("Время потока Pocket Option не синхронизировано; история не запрашивалась.");
    }
    const current = socket;
    if (!current || current.readyState !== WebSocket.OPEN) {
      throw new Error("Соединение с Pocket Option прервалось перед запросом истории.");
    }
    return new Promise<ParsedHistoryPage>((resolve, reject) => {
      let request: Pending;
      const requestTime = pocketHistoryRequestTime(
        time * 1000,
        clockOffsetSeconds,
        seconds,
      );
      const timer = setTimeout(() => {
        if (pendingHistory.get(symbol) === request) pendingHistory.delete(symbol);
        console.warn("[pocket-history-timeout]", JSON.stringify({
          symbol,
          periodSeconds: seconds,
          requestTime,
          serverClockOffsetSeconds: clockOffsetSeconds,
          timeBasis: "local-plus-feed-offset",
          timeoutMs,
          socketReadyState: socket?.readyState ?? null,
          pairAvailable: pairs.has(symbol),
          connectionError: connectionError || null,
          lastPocketMessageAgeMs: lastPocketMessageAt ? Date.now() - lastPocketMessageAt : null,
        }));
        reject(new Error(`История свечей не пришла за ${Math.ceil(timeoutMs / 1000)} секунд. Попробуйте ещё раз.`));
      }, timeoutMs);
      request = { asset: symbol, periodSeconds: seconds, resolve, reject, timer };
      pendingHistory.set(symbol, request);
      try {
        console.info("[pocket-history-request]", JSON.stringify({
          symbol,
          periodSeconds: seconds,
          requestTime,
          serverClockOffsetSeconds: clockOffsetSeconds,
          timeBasis: "local-plus-feed-offset",
          socketReadyState: current.readyState,
        }));
        sendPocketSubscription(current, symbol, seconds);
        current.send(
          "42" +
            JSON.stringify([
              "loadHistoryPeriod",
              buildPocketHistoryRequest(
                symbol,
                seconds,
                requestTime,
                Math.floor(Date.now() / 10),
                seconds * HISTORY_PAGE_CANDLES,
              ),
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

async function loadCandles(
  symbol: string,
  seconds: number,
  pageTimeoutMs = 12_000,
  pageLimit?: number,
): Promise<{ candles: HistoricalCandle[]; rejectedRows: number }> {
  await ensureFeed();
  const collected = new Map<number, HistoricalCandle>();
  let rejectedRows = 0;
  let cursor = Math.floor(Date.now() / 1000);
  const maxPages = pageLimit
    ?? Math.ceil(DIRECT_AI_HISTORY_CANDLES / HISTORY_PAGE_CANDLES);
  for (let page = 0; page < maxPages && collected.size < DIRECT_AI_HISTORY_CANDLES; page += 1) {
    const history = await loadHistoryPage(
      symbol,
      seconds,
      cursor,
      pageTimeoutMs,
    );
    rejectedRows += history.rejectedRows;
    const candles = history.candles;
    if (candles.length === 0) break;
    const previousSize = collected.size;
    for (const candle of candles) collected.set(candle.time, candle);
    const oldestTime = candles[0].time;
    if (collected.size === previousSize || oldestTime <= 0 || oldestTime >= cursor) break;
    cursor = oldestTime - 1;
  }
  let candles = [...collected.values()]
    .sort((a, b) => a.time - b.time)
    .slice(-DIRECT_AI_HISTORY_CANDLES);
  const state = pairMarketData.get(symbol) ?? {
    ticks: [],
    history: [],
    historyPeriodSeconds: null,
  };
  const beforeRealtime = candles.at(-1)?.time ?? null;
  candles = appendCoveredFastCandles(candles, state.ticks, seconds, Date.now());
  const latest = candles.at(-1)?.time ?? null;
  if (latest !== beforeRealtime) {
    console.info("[pocket-history-reconciled]", JSON.stringify({
      symbol,
      periodSeconds: seconds,
      appendedCandles: candles.length - collected.size,
      latestCandleTime: latest,
      latestCandleAgeSeconds: latest === null
        ? null
        : Math.max(0, Math.floor(Date.now() / 1000) - latest - seconds),
    }));
  }
  state.history = candles;
  state.historyPeriodSeconds = seconds;
  pairMarketData.set(symbol, state);
  return { candles: state.history, rejectedRows };
}

function closedHistory(candles: HistoricalCandle[], seconds: number, nowMs = Date.now()) {
  const nowSeconds = nowMs / 1000;
  return candles
    .filter((candle) => candle.time + seconds <= nowSeconds)
    .sort((a, b) => a.time - b.time);
}

function historyIsFresh(candles: HistoricalCandle[], seconds: number, nowMs = Date.now()) {
  const latest = closedHistory(candles, seconds, nowMs).at(-1);
  if (!latest) return false;
  // Pocket history timestamps are candle-open times; close time is start + period.
  const ageSinceCloseMs = nowMs - (latest.time + seconds) * 1000;
  return ageSinceCloseMs >= -1_000 && ageSinceCloseMs <= (seconds * 1000) + 4_500;
}

async function freshSignalHistory(symbol: string, seconds: number) {
  const cached = pairMarketData.get(symbol);
  if (
    cached?.historyPeriodSeconds === seconds &&
    closedHistory(cached.history, seconds).length >= MIN_DIRECT_AI_CANDLES &&
    historyIsFresh(cached.history, seconds)
  ) {
    return { candles: closedHistory(cached.history, seconds).slice(-DIRECT_AI_HISTORY_CANDLES), rejectedRows: 0 };
  }
  const refreshed = await loadCandles(symbol, seconds, SIGNAL_HISTORY_PAGE_TIMEOUT_MS, 1);
  const candles = closedHistory(refreshed.candles, seconds);
  if (candles.length < MIN_DIRECT_AI_CANDLES) {
    throw new Error(`После обновления истории доступны только ${candles.length} закрытых свечей; нужно минимум ${MIN_DIRECT_AI_CANDLES}.`);
  }
  if (!historyIsFresh(candles, seconds)) {
    throw new Error("После обновления история свечей остаётся устаревшей. Сигнал не выдан.");
  }
  return { ...refreshed, candles };
}

export function followQuote(symbol: string) {
  if ((!socket || socket.readyState === 3) && Date.now() >= retryAfter) {
    void feedSnapshot().catch(() => {});
  }
  const current = latestPairQuote(symbol);
  if (!current || Date.now() - current.at > 2000) subscribe(symbol);
  return latestPairQuote(symbol);
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
  const quote = latestPairQuote(symbol);
  if (quote && Date.now() - quote.at <= 5000) {
    return { status: "connected" as const, message: "" };
  }
  return { status: "connecting" as const, message: "Ожидаем свежую котировку Pocket Option." };
}

export async function feedClose(symbol: string) {
  await ensureFeed();
  if (!pairs.has(symbol)) throw new Error("Эта пара сейчас недоступна.");
  const quote = latestPairQuote(symbol);
  if (quote && Date.now() - quote.at < 800) return quote.price;
  return waitQuote(symbol);
}

function summarizeCandleCadence(series: HistoricalCandle[][], expectedSeconds: number) {
  const intervalCounts = new Map<number, number>();
  let intervalCount = 0;
  let irregularIntervals = 0;
  let estimatedMissingIntervals = 0;

  for (const candles of series) {
    for (let index = 1; index < candles.length; index += 1) {
      const previous = candles[index - 1];
      const current = candles[index];
      if (!previous || !current) continue;
      const interval = current.time - previous.time;
      if (!Number.isFinite(interval) || interval <= 0) {
        irregularIntervals += 1;
        continue;
      }

      intervalCount += 1;
      intervalCounts.set(interval, (intervalCounts.get(interval) ?? 0) + 1);
      const expectedSteps = Math.round(interval / expectedSeconds);
      const tolerance = Math.max(1, expectedSeconds * 0.01);
      if (
        expectedSteps < 1 ||
        Math.abs(interval - expectedSteps * expectedSeconds) > tolerance
      ) {
        irregularIntervals += 1;
      }
      if (interval > expectedSeconds * 1.5) {
        estimatedMissingIntervals += Math.max(1, Math.round(interval / expectedSeconds) - 1);
      }
    }
  }

  const observedIntervalSeconds = [...intervalCounts.entries()]
    .sort(([intervalA, countA], [intervalB, countB]) => countB - countA || intervalA - intervalB)[0]?.[0] ?? null;

  return {
    observedIntervalSeconds,
    intervalCount,
    irregularIntervals,
    estimatedMissingIntervals,
  };
}

export async function feedSignal(
  symbol: string,
  expirySeconds: number,
): Promise<FeedSignalResult> {
  if (!isValidExpirySeconds(expirySeconds)) {
    throw new Error("Выберите срок экспирации от 30 секунд до 4 часов.");
  }
  const pipelineStartedAt = performance.now();
  const preparationDeadlineAtMs = Date.now() + SIGNAL_PREPARATION_TIMEOUT_MS;
  await waitForSignalPreparation(ensureFeed(), preparationDeadlineAtMs);
  const pair = pairs.get(symbol);
  if (
    !pair ||
    pair.group !== "fx" ||
    !pair.symbol.toLowerCase().includes("otc") ||
    !ELIGIBLE_PAYOUTS.has(pair.payout)
  ) {
    throw new Error("Для сигнала нужна активная OTC-пара с выплатой ровно 80% или 92%.");
  }
  subscribe(symbol);
  const analysisSeconds = analysisPeriodForExpiry(expirySeconds);
  const historyStartedAt = performance.now();
  const inputQuoteStartedAt = historyStartedAt;
  const history = await waitForSignalPreparation(
    freshSignalHistory(symbol, analysisSeconds),
    preparationDeadlineAtMs,
  );
  const inputQuote = await waitForSignalPreparation(
    waitFreshQuote(symbol, SIGNAL_QUOTE_WAIT_MS),
    preparationDeadlineAtMs,
  );
  const historyMs = Math.round(performance.now() - historyStartedAt);
  const inputQuoteMs = Math.round(performance.now() - inputQuoteStartedAt);
  const candles = history.candles;
  const latestCandle = candles.at(-1);
  const historyAgeSeconds = latestCandle
    ? Math.round(Date.now() / 1000 - (latestCandle.time + analysisSeconds))
    : null;
  console.info("[signal-history]", JSON.stringify({
    symbol,
    candleCount: candles.length,
    rejectedRows: history.rejectedRows,
    expectedCandleSeconds: analysisSeconds,
    latestClosedAgeSeconds: historyAgeSeconds,
    freshForAnalysis: historyAgeSeconds !== null && historyAgeSeconds <= analysisSeconds + 4.5,
    firstCandle: candles[0] ?? null,
    lastReceivedCandle: candles.at(-1) ?? null,
    ...summarizeCandleCadence([candles], analysisSeconds),
  }));
  if (historyAgeSeconds === null || historyAgeSeconds > analysisSeconds + 4.5) {
    return {
      decision: "pass",
      reason: "После однократного обновления истории свечи остаются старыми. Сигнал не выдан.",
    };
  }
  const entryHistoryRequest = settleSignalRequest(freshSignalHistory(symbol, 60));
  const remainingAnalysisMs = Math.min(
    SIGNAL_ANALYSIS_TIMEOUT_MS,
    preparationDeadlineAtMs - Date.now() - 100,
  );
  if (remainingAnalysisMs <= 0) {
    throw new Error(SIGNAL_PREPARATION_TIMEOUT_MESSAGE);
  }
  const analysisStartedAt = performance.now();
  const review = await waitForSignalPreparation(
    analyzeMarketCandidates(
      expirySeconds,
      analysisSeconds,
      [{
        symbol,
        name: pair.name,
        candles,
        currentPrice: inputQuote.price,
        quoteAgeMs: inputQuote.ageMs,
      }],
      { timeoutMs: remainingAnalysisMs },
    ),
    preparationDeadlineAtMs,
  );
  const analysisMs = Math.round(performance.now() - analysisStartedAt);
  console.info("[signal-pipeline]", JSON.stringify({
    symbol,
    historyMs,
    inputQuoteMs,
    analysisMs,
    elapsedMs: Math.round(performance.now() - pipelineStartedAt),
    decision: review.decision,
  }));
  if (review.decision === "pass") return review;
  if (!acceptsMarketAiReview(review, [symbol])) {
    return { decision: "pass", reason: "Ответ ИИ не прошёл проверку пары и направления; сигнал не выдан." };
  }
  const entryHistory = await waitForSignalRequest(
    entryHistoryRequest,
    Math.max(0, preparationDeadlineAtMs - Date.now()),
    SIGNAL_PREPARATION_TIMEOUT_MESSAGE,
  );
  const releaseAtMs = signalReleaseAt(entryHistory.candles, Date.now());
  if (releaseAtMs === null) {
    return { decision: "pass", reason: "Не удалось подготовить безопасное окно входа. Сигнал не выдан." };
  }
  const signal = buildDirectAiSignal(candles, expirySeconds, analysisSeconds, pair.name, pair.payout, review);
  signal.openPrice = inputQuote.price;
  console.info("[signal-pipeline]", JSON.stringify({
    symbol,
    historyMs,
    inputQuoteMs,
    analysisMs,
    elapsedMs: Math.round(performance.now() - pipelineStartedAt),
    releaseDelayMs: Math.max(0, releaseAtMs - Date.now()),
    decision: "signal",
  }));
  return { decision: "signal", ...signal, releaseAtMs };
}

export async function feedConfirmSignalEntry(symbol: string) {
  await ensureFeed();
  const pair = pairs.get(symbol);
  if (
    !pair ||
    pair.group !== "fx" ||
    !pair.symbol.toLowerCase().includes("otc") ||
    !ELIGIBLE_PAYOUTS.has(pair.payout)
  ) {
    throw new Error("Для сигнала нужна активная OTC-пара с выплатой ровно 80% или 92%.");
  }

  const history = await freshSignalHistory(symbol, 60);
  if (entryWindowFailure(history.candles)) {
    throw new Error("Не удалось определить безопасное окно по последней закрытой свече.");
  }

  let quote = await waitFreshQuote(symbol, SIGNAL_QUOTE_WAIT_MS);
  const verificationHistory = await freshSignalHistory(symbol, 60);
  if (entryWindowFailure(verificationHistory.candles)) {
    throw new Error("Последняя закрытая свеча не подтверждает безопасное окно для входа.");
  }

  return { openPrice: quote.price };
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
  let rejectedHistoryRows = 0;
  let expectedCandleSeconds = 0;
  let observedIntervalSeconds: number | null = null;
  let intervalCount = 0;
  let irregularIntervals = 0;
  let estimatedMissingIntervals = 0;
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
      rejectedHistoryRows,
      expectedCandleSeconds,
      observedIntervalSeconds,
      intervalCount,
      irregularIntervals,
      estimatedMissingIntervals,
      ...(error ? { errorType: error instanceof Error ? error.name : typeof error } : {}),
    }));
  };

  try {
    if (!isValidExpirySeconds(expirySeconds)) {
      throw new Error("Выберите срок экспирации от 30 секунд до 4 часов.");
    }
    stage = "feed";
    const feedStartedAt = performance.now();
    await ensureFeed();
    feedMs = performance.now() - feedStartedAt;
    const analysisSeconds = analysisPeriodForExpiry(expirySeconds);
    expectedCandleSeconds = analysisSeconds;
    const ranked = rankedSignalPairs();
    if (ranked.length === 0) {
      throw new Error("Нет активных OTC-валютных пар с выплатой ровно 80% или 92%.");
    }
    const nextPair = selectRotatingSignalPair(ranked, excludedSymbols.slice(0, 24));
    const pool = nextPair ? [nextPair] : [];
    poolSize = pool.length;
    if (pool.length === 0) {
      throw new Error("Нет активных OTC-валютных пар с выплатой ровно 80% или 92%.");
    }
    const candidates: Array<{ pair: FeedPair; candles: HistoricalCandle[] }> = [];
    let historyFailure = "";
    stage = "history";
    const historyStartedAt = performance.now();
    let historyResults: Awaited<ReturnType<typeof loadCandidatesInParallel<FeedPair, LoadedHistory>>>;
    try {
      const results = [];
      for (const pair of pool) {
        try {
          results.push({ ok: true as const, item: pair, value: await freshSignalHistory(pair.symbol, analysisSeconds) });
        } catch (error) {
          results.push({ ok: false as const, item: pair, error });
        }
      }
      historyResults = results;
    } finally {
      historyMs = performance.now() - historyStartedAt;
    }
    for (const result of historyResults) {
      if (!result.ok) {
        if (!historyFailure && result.error instanceof Error) historyFailure = result.error.message;
        continue;
      }
      historyResponses += 1;
      rejectedHistoryRows += result.value.rejectedRows;
      if (result.value.candles.length < MIN_DIRECT_AI_CANDLES) continue;
      candidates.push({ pair: result.item, candles: result.value.candles });
    }
    candidateCount = candidates.length;
    const cadence = summarizeCandleCadence(
      candidates.map((candidate) => candidate.candles),
      analysisSeconds,
    );
    observedIntervalSeconds = cadence.observedIntervalSeconds;
    intervalCount = cadence.intervalCount;
    irregularIntervals = cadence.irregularIntervals;
    estimatedMissingIntervals = cadence.estimatedMissingIntervals;
    if (candidates.length === 0) {
      if (historyResponses === 0 && historyFailure) {
        throw new Error(`Не удалось получить историю свечей Pocket Option: ${historyFailure}`);
      }
      throw new Error(`Не удалось получить по Pocket Option минимум ${MIN_DIRECT_AI_CANDLES} исторических свечей ни для одной пары.`);
    }
    const candidate = candidates[0];
    if (!candidate) {
      throw new Error("Не удалось подготовить данные выбранной пары.");
    }
    const initialEntryHistory = await freshSignalHistory(candidate.pair.symbol, 60);
    if (entryWindowFailure(initialEntryHistory.candles)) {
      stage = "entry-window";
      logTiming("pass");
      return { decision: "pass", reason: "Не удалось определить безопасное окно по последней закрытой свече." };
    }
    stage = "fresh-quote";
    const inputQuoteStartedAt = performance.now();
    const inputQuote = await waitFreshQuote(candidate.pair.symbol);
    quoteMs += performance.now() - inputQuoteStartedAt;
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
          currentPrice: inputQuote.price,
          quoteAgeMs: inputQuote.ageMs,
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
    const finalEntryHistory = await freshSignalHistory(best.pair.symbol, 60);
    if (entryWindowFailure(finalEntryHistory.candles)) {
      stage = "entry-window";
      logTiming("pass");
      return { decision: "pass", reason: "Не удалось подтвердить окно по последней закрытой свече." };
    }
    stage = "fresh-quote";
    const quoteStartedAt = performance.now();
    let entryQuote = await waitFreshQuote(best.pair.symbol);
    quoteMs += performance.now() - quoteStartedAt;
    let verificationHistory = await freshSignalHistory(best.pair.symbol, 60);
    if (entryWindowFailure(verificationHistory.candles)) {
      stage = "entry-window";
      logTiming("pass");
      return { decision: "pass", reason: "Последняя закрытая свеча не подтверждает безопасное окно." };
    }
    const finalWindowFailure = entryWindowFailure(verificationHistory.candles);
    if (finalWindowFailure) {
      stage = "entry-window";
      logTiming("pass");
      return finalWindowFailure;
    }
    const signal = buildDirectAiSignal(
      best.candles,
      expirySeconds,
      analysisSeconds,
      best.pair.name,
      best.pair.payout,
      review,
    );
    signal.openPrice = entryQuote.price;
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
