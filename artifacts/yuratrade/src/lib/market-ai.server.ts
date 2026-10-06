import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { buildMarketAnalysisContext } from "./market-analysis-context.server.ts";
import type { MarketCandle } from "./signal-model.server.ts";
import { SIGNAL_ANALYSIS_TIMEOUT_MS } from "./signal-config.ts";

export const DIRECT_AI_MODEL = "gemini-3.6-flash";
export const DIRECT_AI_MODEL_LABEL = "Gemini 3.6 Flash";
export const PROXY_AI_MODEL = "gemini-2.5-flash";
export const PROXY_AI_MODEL_LABEL = "Gemini 2.5 Flash";
export const DIRECT_AI_HISTORY_CANDLES = 128;
export const MIN_DIRECT_AI_CANDLES = 15;
const DIRECT_AI_VISIBLE_CANDLES = 30;
const HIGHER_TIMEFRAME_VISIBLE_CANDLES = 24;

export type MarketAiCandidate = {
  symbol: string;
  name: string;
  candles: MarketCandle[];
  currentPrice: number;
  quoteAgeMs: number;
};

const signalReviewSchema = z.object({
  decision: z.literal("signal"),
  symbol: z.string().min(1).max(80),
  direction: z.enum(["call", "put"]),
  confidence: z.number().int().min(0).max(100),
  explanation: z.string().trim().min(1).max(1200),
});

const passReviewSchema = z.object({
  decision: z.literal("pass"),
  reason: z.string().trim().min(1).max(1200),
});

const reviewSchema = z.discriminatedUnion("decision", [
  signalReviewSchema,
  passReviewSchema,
]);

export type MarketAiReview = z.infer<typeof reviewSchema>;

export const DIRECT_AI_SYSTEM_PROMPT = [
  "Ты анализируешь одну OTC-валютную пару. В данных есть свежая цена, до 30 последних закрытых OHLC-свечей, до 24 полностью собранных свечей старшего таймфрейма, до 128 проверенных закрытых свечей для расчёта индикаторов и краткая серия close.",
  "Используй dataQuality для оценки полноты и свежести. Времена свечей заданы в Unix-секундах; null означает, что показатель недоступен, а не ноль. Значения с суффиксом Bps заданы в базисных пунктах.",
  "Учитывай EMA 9/21/50 и наклоны, RSI 14, MACD-гистограмму, Bollinger z-score, ATR и его отношение, недавние доходности, расстояния до прошлых максимумов/минимумов, а также ADX 14 и +DI/-DI. ADX оценивает силу, а не направление тренда; сравнивай +DI с -DI и проверяй согласованность с EMA, старшим таймфреймом и реальными OHLC-свечами.",
  "Не называй движение выраженным трендом, если ADX слабый или индикаторы и старший таймфрейм противоречат друг другу. Не выдумывай OHLC, индикаторы, новости или цены. Учитывай срок экспирации из входных данных; по умолчанию это 120 секунд.",
  "Поле trend сравнивает последнее закрытие с закрытием четырьмя свечами ранее; используй его вместе с индикаторами, а не как единственное основание.",
  "При корректных входных данных обязательно выбери направление вверх или вниз. Не используй вторую модель-классификатор. Не добавляй к заданному формату дополнительные поля или метки.",
  "Верни только один JSON-объект: {\"direction\":\"up\"|\"down\",\"explanation\":\"краткое объяснение на русском по переданным данным\",\"confidence\":0..100}. Уверенность — субъективная оценка, а не вероятность выигрыша и не подтверждённая статистика. Не обещай результат и не открывай сделки.",
].join(" ");

type ActiveGeminiModel = {
  model: string;
  label: string;
  proxyBaseUrl?: string;
};

export function activeGeminiModel(
  env: NodeJS.ProcessEnv = process.env,
): ActiveGeminiModel {
  const hasProxyBase = Boolean(env.AI_INTEGRATIONS_GEMINI_BASE_URL);
  const hasProxyKey = Boolean(env.AI_INTEGRATIONS_GEMINI_API_KEY);
  if (hasProxyBase || hasProxyKey) {
    if (!hasProxyBase || !hasProxyKey) {
      throw new Error("Настройки Gemini proxy неполные. Сигнал не выдан.");
    }
    return {
      model: PROXY_AI_MODEL,
      label: PROXY_AI_MODEL_LABEL,
      proxyBaseUrl: env.AI_INTEGRATIONS_GEMINI_BASE_URL,
    };
  }
  return { model: DIRECT_AI_MODEL, label: DIRECT_AI_MODEL_LABEL };
}

let client: GoogleGenAI | null = null;
let clientIdentity = "";

function getGeminiClient() {
  const hasProxy = Boolean(
    process.env.AI_INTEGRATIONS_GEMINI_BASE_URL ||
    process.env.AI_INTEGRATIONS_GEMINI_API_KEY,
  );
  const apiKey = hasProxy
    ? process.env.AI_INTEGRATIONS_GEMINI_API_KEY
    : process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      hasProxy
        ? "Настройки Gemini proxy неполные. Сигнал не выдан."
        : "Gemini не настроен. Добавьте GEMINI_API_KEY в Replit Secrets или настройте Replit Gemini proxy.",
    );
  }
  const model = activeGeminiModel();
  const identity = `${model.model}\u0000${apiKey}\u0000${model.proxyBaseUrl ?? ""}`;
  if (!client || clientIdentity !== identity) {
    client = new GoogleGenAI({
      apiKey,
      httpOptions: {
        ...(model.proxyBaseUrl
          ? { apiVersion: "", baseUrl: model.proxyBaseUrl }
          : {}),
        timeout: SIGNAL_ANALYSIS_TIMEOUT_MS,
        retryOptions: { attempts: 1 },
      },
    });
    clientIdentity = identity;
  }
  return { client, model };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function firstString(source: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function firstValue(source: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = source[key];
    if (value !== undefined && value !== null) return value;
  }
  return undefined;
}

function decodeJsonContent(content: string): unknown {
  const cleaned = content.trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start < 0 || end <= start) return null;
    try {
      return JSON.parse(cleaned.slice(start, end + 1));
    } catch {
      return null;
    }
  }
}

function normalizeDirection(value: unknown): "call" | "put" | null {
  if (typeof value !== "string") return null;
  const token = value.trim().toLowerCase().split(/[\s(/_-]+/u)[0];
  if (["call", "up", "buy", "higher", "bullish", "long", "вверх", "покупка"].includes(token)) {
    return "call";
  }
  if (["put", "down", "sell", "lower", "bearish", "short", "вниз", "продажа"].includes(token)) {
    return "put";
  }
  return null;
}

function normalizeConfidence(value: unknown): number | null {
  const raw = typeof value === "string" ? Number(value.trim().replace(/%$/, "")) : value;
  if (typeof raw !== "number" || !Number.isFinite(raw) || raw < 0 || raw > 100) return null;
  const score = raw > 0 && raw <= 1 ? raw * 100 : raw;
  return Math.round(score);
}

function matchAllowedSymbol(value: unknown, allowedSymbols: string[]) {
  if (typeof value !== "string" || !value.trim()) return null;
  const normalized = value.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
  const matches = allowedSymbols.filter(
    (symbol) => symbol.toLowerCase().replace(/[^a-z0-9]/g, "") === normalized,
  );
  return matches.length === 1 ? matches[0] : null;
}

function normalizeExplanation(
  value: unknown,
  root: Record<string, unknown>,
): string | null {
  if (typeof value === "string") return value.trim().slice(0, 1200) || null;
  const source = isRecord(value) ? value : root;
  const parts = [
    firstString(source, ["explanation", "summary", "analysis", "reasoning", "rationale", "reason"]),
    firstString(source, ["candleEvidence", "candle_evidence", "evidence", "candleAnalysis", "candle_analysis"]),
    firstString(source, ["directionRationale", "direction_rationale", "directionReason", "direction_reason"]),
    firstString(source, ["riskFactors", "risk_factors", "risks", "risk"]),
    firstString(source, ["invalidation", "invalidationCondition", "invalidation_condition", "invalidationSignal"]),
  ];
  const explanation = [...new Set(parts.map((part) => part.trim()).filter(Boolean))].join(" ");
  return explanation.slice(0, 1200) || null;
}

function standardDeviation(values: number[]) {
  if (values.length === 0) return null;
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
  return Number.isFinite(variance) ? Math.sqrt(variance) : null;
}

export function parseMarketAiReview(content: string, allowedSymbols: string[]): MarketAiReview | null {
  const decoded = decodeJsonContent(content);
  if (!isRecord(decoded)) return null;
  const root = isRecord(decoded.result)
    ? decoded.result
    : isRecord(decoded.data)
      ? decoded.data
      : decoded;
  const decision = firstString(root, ["decision", "status", "type"]).toLowerCase();

  if (["pass", "abstain", "no_signal", "no-signal", "none"].includes(decision)) {
    const parsedPass = passReviewSchema.safeParse({
      decision: "pass",
      reason: (firstString(root, ["reason", "message", "explanation"]) || "ИИ не выбрал направление.").slice(0, 1200),
    });
    return parsedPass.success ? parsedPass.data : null;
  }

  const direction = normalizeDirection(firstValue(root, ["direction", "side", "action", "signal"]) ?? decision);
  if (!direction) return null;
  if (
    decision &&
    !["signal", "trade", "call", "put", "buy", "sell", "up", "down", "long", "short", "вверх", "вниз"].includes(decision)
  ) {
    return null;
  }

  const rawSymbol = firstValue(root, ["symbol", "pair", "asset", "ticker"]);
  const symbol = rawSymbol === undefined && allowedSymbols.length === 1
    ? allowedSymbols[0]
    : matchAllowedSymbol(rawSymbol, allowedSymbols);
  const confidence = normalizeConfidence(firstValue(root, [
    "confidence", "confidenceScore", "confidence_score", "certainty",
  ]));
  if (!symbol || confidence === null) return null;

  const rawExplanation = firstValue(root, ["explanation", "analysis", "reasoning"]);
  const explanation = normalizeExplanation(rawExplanation, root);
  if (!explanation) return null;

  const parsed = signalReviewSchema.safeParse({
    decision: "signal",
    symbol,
    direction,
    confidence,
    explanation,
  });
  return parsed.success ? parsed.data : null;
}

export function acceptsMarketAiReview(
  review: MarketAiReview | null,
  allowedSymbols: string[],
) {
  return review?.decision === "signal" && allowedSymbols.includes(review.symbol);
}

export function marketAiApiErrorMessage(error: unknown) {
  if (
    error instanceof Error &&
    (error.message.includes("Gemini не настроен") || error.message.includes("Настройки Gemini proxy"))
  ) {
    return error.message;
  }
  const status = isRecord(error)
    ? Number(error.status ?? error.statusCode)
    : Number.NaN;
  const name = error instanceof Error ? error.name.toLowerCase() : "";
  if (status === 401 || status === 403) {
    return "Gemini отклонил подключение. Проверьте API key или настройки proxy; сигнал не выдан.";
  }
  if (status === 429) {
    return "Gemini временно ограничил запросы. Подождите немного и попробуйте ещё раз.";
  }
  if (status === 408 || status === 504 || name.includes("timeout") || name.includes("abort")) {
    return "Анализ Gemini занял слишком много времени. Попробуйте ещё раз; сигнал не выдан.";
  }
  if (status === 400) {
    return "Gemini отклонил формат запроса. Проверьте настройку модели и повторите попытку.";
  }
  if (status === 404) {
    return "Выбранная модель Gemini сейчас недоступна. Проверьте имя модели и повторите попытку.";
  }
  if (status >= 500 || name.includes("connection")) {
    return "Сервис Gemini временно недоступен. Попробуйте ещё раз через минуту.";
  }
  return "Не удалось завершить анализ Gemini. Попробуйте ещё раз; сигнал не выдан.";
}

type ReviewMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type ReviewChoice = {
  message: { content: string | null; refusal?: string | null };
  finish_reason: string | null;
};

type ReviewCompletion = { choices: ReviewChoice[] };
type ReviewCompletionRequest = (messages: ReviewMessage[]) => Promise<ReviewCompletion>;

function requestMarketAiCompletion(messages: ReviewMessage[]) {
  const system = messages
    .filter((message) => message.role === "system")
    .map((message) => message.content)
    .join("\n\n");
  const userPrompt = messages
    .filter((message) => message.role === "user")
    .map((message) => message.content)
    .join("\n\n");
  const { client: gemini, model } = getGeminiClient();

  return gemini.models.generateContent({
    model: model.model,
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    config: {
      systemInstruction: system,
      responseMimeType: "application/json",
      maxOutputTokens: 512,
    },
  }).then((response) => ({
    choices: [{
      message: { content: response.text || null },
      finish_reason: String(response.candidates?.[0]?.finishReason ?? "STOP"),
    }],
  }));
}

function withTimeout<T>(request: Promise<T>, timeoutMs: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<T>((_, reject) => {
    timer = setTimeout(() => {
      const error = new Error(`Gemini request exceeded ${timeoutMs} ms.`);
      error.name = "TimeoutError";
      reject(error);
    }, timeoutMs);
  });
  return Promise.race([request, timeout]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

export async function requestMarketAiReviewOnce(
  request: ReviewCompletionRequest,
  baseMessages: ReviewMessage[],
  allowedSymbols: string[],
  timeoutMs = SIGNAL_ANALYSIS_TIMEOUT_MS,
): Promise<MarketAiReview> {
  let choice: ReviewChoice | undefined;
  const startedAt = performance.now();
  let timedOut = false;
  try {
    choice = (await withTimeout(request(baseMessages), timeoutMs)).choices[0];
  } catch (error) {
    timedOut = error instanceof Error && error.name.toLowerCase().includes("timeout");
    throw new Error(marketAiApiErrorMessage(error));
  } finally {
    console.info("[signal-ai-duration]", JSON.stringify({
      durationMs: Math.round(performance.now() - startedAt),
      timeoutMs,
      timedOut,
    }));
  }

  const content = choice?.message.content;
  const review = typeof content === "string"
    ? parseMarketAiReview(content, allowedSymbols)
    : null;
  if (review) return review;
  if (choice?.message.refusal) {
    throw new Error("Gemini отказался выполнить анализ. Сигнал не выдан.");
  }
  if (choice?.finish_reason?.toLowerCase().includes("max_tokens")) {
    throw new Error("Gemini оборвал ответ по лимиту длины. Сигнал не выдан.");
  }
  throw new Error("Gemini вернул ответ, который не удалось проверить. Сигнал не выдан.");
}

export async function analyzeMarketCandidates(
  expirySeconds: number,
  candleSeconds: number,
  candidates: MarketAiCandidate[],
  options: {
    nowSeconds?: number;
    request?: ReviewCompletionRequest;
  } = {},
): Promise<MarketAiReview> {
  const nowSeconds = options.nowSeconds ?? Math.floor(Date.now() / 1000);
  const preparedCandidates = candidates.slice(0, 1).map((candidate) => ({
    ...candidate,
    context: buildMarketAnalysisContext(candidate.candles, candleSeconds, nowSeconds),
  }));
  const eligibleCandidates = preparedCandidates.filter(
    (candidate) =>
      candidate.context.candles.length >= MIN_DIRECT_AI_CANDLES &&
      candidate.context.dataQuality.isFresh &&
      Number.isFinite(candidate.currentPrice) &&
      candidate.currentPrice > 0 &&
      Number.isFinite(candidate.quoteAgeMs) &&
      candidate.quoteAgeMs >= 0 &&
      candidate.quoteAgeMs <= 20_000,
  );
  if (eligibleCandidates.length === 0) {
    const hasEnoughButStaleHistory = preparedCandidates.some(
      (candidate) =>
        candidate.context.candles.length >= MIN_DIRECT_AI_CANDLES &&
        !candidate.context.dataQuality.isFresh,
    );
    return {
      decision: "pass",
      reason: hasEnoughButStaleHistory
        ? "Последняя закрытая свеча слишком старая для надёжного анализа. Сигнал не выдан."
        : preparedCandidates.some((candidate) =>
            !Number.isFinite(candidate.currentPrice) ||
            !Number.isFinite(candidate.quoteAgeMs) ||
            candidate.quoteAgeMs < 0 ||
            candidate.quoteAgeMs > 20_000
          )
          ? "Живая котировка старше 20 секунд или недоступна. Сигнал не выдан."
          : `После проверки данных нужно не менее ${MIN_DIRECT_AI_CANDLES} закрытых корректных свечей на пару.`,
    };
  }

  const candidate = eligibleCandidates[0];
  if (!candidate) {
    return { decision: "pass", reason: "Не удалось подготовить данные выбранной пары. Сигнал не выдан." };
  }
  const closes = candidate.context.candles
    .slice(-DIRECT_AI_VISIBLE_CANDLES)
    .map((candle) => candle.close);
  const recentCandles = candidate.context.candles
    .slice(-DIRECT_AI_VISIBLE_CANDLES)
    .map((candle) => ({
      time: candle.time,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
    }));
  const latestClose = closes.at(-1);
  const closeFourCandlesEarlier = closes.at(-5);
  const volatility = standardDeviation(closes.slice(-12));
  if (
    latestClose === undefined ||
    closeFourCandlesEarlier === undefined ||
    volatility === null
  ) {
    return {
      decision: "pass",
      reason: `Для анализа нужны минимум ${MIN_DIRECT_AI_CANDLES} закрытых корректных свечей.`,
    };
  }
  const trendChange = latestClose - closeFourCandlesEarlier;
  const trend = latestClose > closeFourCandlesEarlier
    ? "up"
    : latestClose < closeFourCandlesEarlier
      ? "down"
      : "flat";
  const input = {
    symbol: candidate.symbol,
    pair: candidate.name,
    expirySeconds,
    candleSeconds,
    currentPrice: candidate.currentPrice,
    quoteAgeMs: Math.round(candidate.quoteAgeMs),
    quoteVsLastCloseBps: Number((((candidate.currentPrice / latestClose) - 1) * 10_000).toFixed(3)),
    dataQuality: {
      ...candidate.context.dataQuality,
      expectedCandleSeconds: candleSeconds,
    },
    technicalIndicators: candidate.context.technicalIndicators,
    higherTimeframe: candidate.context.higherTimeframe
      ? {
          candleSeconds: candidate.context.higherTimeframe.candleSeconds,
          candles: candidate.context.higherTimeframe.candles
            .slice(-HIGHER_TIMEFRAME_VISIBLE_CANDLES)
            .map((candle) => ({
              time: candle.time,
              open: candle.open,
              high: candle.high,
              low: candle.low,
              close: candle.close,
            })),
          technicalIndicators: candidate.context.higherTimeframe.technicalIndicators,
        }
      : null,
    trend: {
      comparison: "последний закрытый close против close четыре минутные свечи назад",
      direction: trend,
      latestClose,
      closeFourCandlesEarlier,
      change: Number(trendChange.toPrecision(8)),
      changePercent: Number(((trendChange / closeFourCandlesEarlier) * 100).toPrecision(8)),
    },
    volatility: {
      periodCandles: 12,
      standardDeviation: Number(volatility.toPrecision(8)),
    },
    closes,
    candles: recentCandles,
  };

  const userPrompt = JSON.stringify(input);
  console.info("[signal-ai-input]", JSON.stringify({
    symbol: input.symbol,
    expirySeconds: input.expirySeconds,
    candleSeconds: input.candleSeconds,
    currentPrice: input.currentPrice,
    quoteAgeMs: input.quoteAgeMs,
    quoteVsLastCloseBps: input.quoteVsLastCloseBps,
    dataQuality: input.dataQuality,
    technicalIndicators: input.technicalIndicators,
    higherTimeframe: input.higherTimeframe
      ? {
          candleSeconds: input.higherTimeframe.candleSeconds,
          candleCount: input.higherTimeframe.candles.length,
          technicalIndicators: input.higherTimeframe.technicalIndicators,
        }
      : null,
    aiVisibleCandleCount: input.candles.length,
    latestClosedCandles: input.candles.slice(-3),
    payloadBytes: Buffer.byteLength(userPrompt, "utf8"),
  }));
  const baseMessages: ReviewMessage[] = [
    { role: "system", content: DIRECT_AI_SYSTEM_PROMPT },
    { role: "user", content: userPrompt },
  ];
  return requestMarketAiReviewOnce(
    options.request ?? requestMarketAiCompletion,
    baseMessages,
    [candidate.symbol],
  );
}
