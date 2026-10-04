import WebSocket from "ws";

const FEED_URL = "wss://api-msk.po.market/socket.io/?EIO=4&transport=websocket";
const FEED_AUTH = process.env.POCKET_OPTION_FEED_AUTH ?? "";

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
  minutes: number;
  note: string;
  bars: Array<[number, number, number, number]>;
};

type Candle = { open: number; close: number; high: number; low: number };

type Pending = {
  asset: string;
  resolve: (candles: Candle[]) => void;
  reject: (error: Error) => void;
  timer: ReturnType<typeof setTimeout>;
};

const pairs = new Map<string, FeedPair>();
let balance: number | null = null;
let socket: WebSocket | null = null;
let ready: Promise<void> | null = null;
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
    if (!group || !Number.isFinite(payout)) continue;
    const symbol = String(row[1]);
    next.set(symbol, { symbol, name: cleanName(String(row[2] || symbol)), payout, group });
  }
  if (next.size > 0) {
    pairs.clear();
    for (const [symbol, pair] of next) pairs.set(symbol, pair);
  }
}

function asCandles(data: unknown[]) {
  const candles: Array<Candle & { time: number }> = [];
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

function rsiOf(closes: number[]) {
  const period = 14;
  if (closes.length < period + 1) return null;
  const window = closes.slice(-period - 1);
  let gain = 0;
  let loss = 0;
  for (let index = 1; index < window.length; index += 1) {
    const diff = window[index] - window[index - 1];
    if (diff >= 0) gain += diff;
    else loss -= diff;
  }
  if (loss === 0) return 100;
  const relative = gain / loss;
  return 100 - 100 / (1 + relative);
}

function describe(input: {
  direction: "call" | "put";
  agree: boolean;
  minutes: number;
  greens: number;
  rsi: number | null;
  smaDelta: number;
  band: number;
  slope: number;
}) {
  const side = input.direction === "call" ? "вверх" : "вниз";
  const rsiLine =
    input.rsi === null
      ? "RSI 14: мало свечей для расчёта"
      : `RSI 14: ${input.rsi.toFixed(1)} — ${
          input.rsi >= 70
            ? "перекуплен, импульс выдыхается"
            : input.rsi <= 30
              ? "перепродан, импульс вниз выдыхается"
              : input.rsi >= 50
                ? "импульс вверх, перекупленности нет"
                : "импульс вниз, перепроданности нет"
        }`;
  const slopeWord = input.slope > 0.05 ? "восходящий" : input.slope < -0.05 ? "нисходящий" : "плоский";
  const bandWord = input.band >= 0.66 ? "верхней" : input.band <= 0.33 ? "нижней" : "средней";
  return [
    rsiLine,
    `SMA 12: цена ${input.smaDelta >= 0 ? "выше" : "ниже"} средней на ${Math.abs(input.smaDelta).toFixed(3)}%`,
    `Диапазон: цена в ${bandWord} трети окна`,
    `Свечи: ${input.greens} бычьих и ${5 - input.greens} медвежьих из последних пяти`,
    `Наклон: ${slopeWord}${input.agree ? ", совпадает со свечами" : ", свечи спорят с наклоном"}`,
    `Срок ${input.minutes} мин. Вход ${side}: этот сценарий сильнее обратного.`,
  ].join("\n");
}

function judge(candles: Candle[], minutes: number, name: string, payout: number): FeedSignal & { strength: number } {
  const last = candles.slice(-12);
  const closes = last.map((candle) => candle.close);
  const count = closes.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  for (let index = 0; index < count; index += 1) {
    sumX += index;
    sumY += closes[index];
    sumXY += index * closes[index];
    sumXX += index * index;
  }
  const slope = (count * sumXY - sumX * sumY) / (count * sumXX - sumX * sumX || 1);
  const high = Math.max(...last.map((candle) => candle.high));
  const low = Math.min(...last.map((candle) => candle.low));
  const range = high - low || Math.abs(closes[count - 1]) * 0.0001;
  const slopeScore = Math.max(-1, Math.min(1, (slope * count) / range));
  const bodies = last.slice(-5);
  const greens = bodies.filter((candle) => candle.close >= candle.open).length;
  const bodyScore = bodies.reduce((sum, candle) => sum + Math.sign(candle.close - candle.open), 0) / bodies.length;
  const earlier = closes.slice(0, -1);
  const average = earlier.reduce((sum, price) => sum + price, 0) / Math.max(1, earlier.length);
  const levelScore = Math.max(-1, Math.min(1, ((closes[count - 1] - average) / range) * 2));
  const score = slopeScore * 0.5 + bodyScore * 0.3 + levelScore * 0.2;
  const direction = score >= 0 ? "call" : "put";
  const agree = Math.sign(slopeScore || score) === Math.sign(bodyScore || score);
  const full = candles.map((candle) => candle.close);
  const price = full[full.length - 1];
  const smaWindow = full.slice(-12);
  const sma = smaWindow.reduce((sum, value) => sum + value, 0) / smaWindow.length;
  const rsi = rsiOf(full);
  const pack = candles.slice(-28);
  const sample = pack[pack.length - 1]?.close ?? price;
  const digits = sample >= 100 ? 2 : sample >= 10 ? 3 : 5;
  const cut = (value: number) => Number(value.toFixed(digits));
  return {
    name,
    payout,
    direction,
    openPrice: price,
    minutes,
    note: describe({
      direction,
      agree,
      minutes,
      greens,
      rsi,
      smaDelta: ((price - sma) / (sma || 1)) * 100,
      band: (price - low) / range,
      slope: slopeScore,
    }),
    bars: pack.map((candle) => [cut(candle.open), cut(candle.high), cut(candle.low), cut(candle.close)]),
    strength: Math.abs(score) * (agree ? 1.2 : 0.75) * (payout / 100),
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
      if (quote && quote.at >= started - 4000) resolve(quote.price);
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
    failPending(new Error("Котировки сейчас недоступны."));
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
  if (!FEED_AUTH) {
    throw new Error("Pocket Option live feed is not configured.");
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
  const next = new WebSocket(FEED_URL, {
    headers: {
      Origin: "https://pocketoption.com",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36 Edg/154.0.0.0",
    },
    handshakeTimeout: 8000,
  });
  next.on("error", () => {
    if (socket === next) socket = null;
  });
  socket = next;
  next.on("message", (data) => handleMessage(next, textOf(data)));
  next.on("close", () => {
    if (socket === next) socket = null;
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
      if (!socket || socket.readyState === 3) connect();
      if (Date.now() - started > 12000) {
        clearInterval(timer);
        ready = null;
        reject(new Error("Котировки сейчас недоступны."));
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

async function loadCandles(symbol: string, seconds: number) {
  await ensureFeed();
  if (!pairs.has(symbol)) throw new Error("Эта пара сейчас недоступна.");
  if (!socket || socket.readyState !== WebSocket.OPEN) throw new Error("Котировки сейчас недоступны.");
  if (pending) failPending(new Error("Запрос сменён."));
  const current = socket;
  return new Promise<Candle[]>((resolve, reject) => {
    const timer = setTimeout(() => {
      if (pending?.asset === symbol) pending = null;
      reject(new Error("Цена не пришла. Попробуйте ещё раз."));
    }, 12000);
    pending = { asset: symbol, resolve, reject, timer };
    const now = Math.floor(Date.now() / 1000);
    current.send("42" + JSON.stringify(["changeSymbol", { asset: symbol, period: seconds }]));
    current.send(
      "42" +
        JSON.stringify([
          "loadHistoryPeriod",
          {
            asset: symbol,
            index: 7000 + Math.floor(Math.random() * 2000),
            time: now,
            offset: Math.max(seconds * 40, 2400),
            period: seconds,
          },
        ]),
    );
  });
}

export function followQuote(symbol: string) {
  const current = quotes.get(symbol);
  if (!current || Date.now() - current.at > 2000) subscribe(symbol);
  return quotes.get(symbol) ?? null;
}

export async function feedClose(symbol: string) {
  await ensureFeed();
  if (!pairs.has(symbol)) throw new Error("Эта пара сейчас недоступна.");
  const quote = quotes.get(symbol);
  if (quote && Date.now() - quote.at < 800) return quote.price;
  return waitQuote(symbol);
}

export async function feedSignal(symbol: string, seconds: number): Promise<FeedSignal> {
  await ensureFeed();
  subscribe(symbol);
  const candles = await loadCandles(symbol, seconds);
  const pair = pairs.get(symbol);
  if (!pair) throw new Error("Эта пара сейчас недоступна.");
  if (candles.length < 5) throw new Error("Мало свечей для этого срока.");
  const judged = judge(candles, Math.round(seconds / 60), pair.name, pair.payout);
  try {
    judged.openPrice = await waitQuote(symbol);
  } catch {
    /* candle close stays if a live tick does not arrive */
  }
  const { strength: _strength, ...signal } = judged;
  return signal;
}

export async function feedBest() {
  await ensureFeed();
  const ranked = [...pairs.values()]
    .filter((pair) => pair.payout === 92 || pair.payout === 80)
    .sort((a, b) => b.payout - a.payout);
  const live = ranked.filter((pair) => quotes.has(pair.symbol));
  const pool = (live.length >= 4 ? live : ranked).slice(0, 4);
  if (pool.length === 0) throw new Error("Нет пар с выплатой 92% или 80%.");
  let best: { signal: FeedSignal; symbol: string; group: PairGroup; seconds: number; strength: number } | null = null;
  for (const pair of pool) {
    for (const seconds of [60, 120]) {
      try {
        const candles = await loadCandles(pair.symbol, seconds);
        if (candles.length < 5) continue;
        const judged = judge(candles, seconds / 60, pair.name, pair.payout);
        if (!best || judged.strength > best.strength) {
          const { strength, ...signal } = judged;
          best = { signal, symbol: pair.symbol, group: pair.group, seconds, strength };
        }
      } catch {
        /* this pair or term did not answer, try the next */
      }
    }
  }
  if (!best) throw new Error("Не удалось выбрать пару. Попробуйте ещё раз.");
  try {
    best.signal.openPrice = await waitQuote(best.symbol);
  } catch {
    /* candle close stays */
  }
  return { ...best.signal, symbol: best.symbol, group: best.group, seconds: best.seconds };
}
