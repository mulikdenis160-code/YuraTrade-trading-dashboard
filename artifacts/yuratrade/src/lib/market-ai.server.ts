import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { buildMarketAnalysisContext } from "./market-analysis-context.server.ts";
import type { MarketCandle } from "./signal-model.server.ts";

export const DIRECT_AI_MODEL = "gemini-3.6-flash";
export const DIRECT_AI_MODEL_LABEL = "Gemini 3.6 Flash";
export const PROXY_AI_MODEL = "gemini-2.5-flash";
export const PROXY_AI_MODEL_LABEL = "Gemini 2.5 Flash";
export const DIRECT_AI_HISTORY_CANDLES = 32;
export const MIN_DIRECT_AI_CANDLES = 15;
const DIRECT_AI_VISIBLE_CANDLES = 30;

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
  explanation: z.object({
    pairSelection: z.string().trim().min(1).max(1200),
    candleEvidence: z.string().trim().min(1).max(1200),
    directionRationale: z.string().trim().min(1).max(1200),
    riskFactors: z.string().trim().min(1).max(1200),
    invalidation: z.string().trim().min(1).max(1200),
  }),
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
  "Ты анализируешь одну OTC-валютную пару по минутным закрытиям. Доступно до 30 последних close по порядку от старых к новым, текущая живая цена, сравнение последнего close с close четыре свечи назад и стандартное отклонение 12 последних close.",
  "Тренд уже рассчитан как сравнение последнего закрытия с закрытием четырьмя минутными свечами ранее. Волатильность — population standard deviation двенадцати последних закрытий в тех же ценовых единицах.",
  "Используй только переданные значения; не выдумывай OHLC, индикаторы, новости или дополнительные цены. Учти срок экспирации 120 секунд.",
  "При корректных входных данных обязательно выбери направление вверх или вниз. Не возвращай pass, abstain, no_signal, decision или symbol. Не используй вторую модель-классификатор и не применяй порог уверенности.",
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
      ...(model.proxyBaseUrl
        ? { httpOptions: { apiVersion: "", baseUrl: model.proxyBaseUrl } }
        : {}),
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
) {
  const source = isRecord(value) ? value : {};
  const general = typeof value === "string"
    ? value.trim()
    : firstString(root, ["analysis", "reasoning", "rationale", "summary", "reason"]);
  const missing = "ИИ не предоставил отдельное пояснение для этого пункта.";
  const pairSelection = firstString(source, [
    "pairSelection", "pair_selection", "pairReason", "pair_reason",
  ]).slice(0, 1200);
  const candleEvidence = firstString(source, [
    "candleEvidence", "candle_evidence", "evidence", "candleAnalysis", "candle_analysis",
  ]).slice(0, 1200);
  const directionRationale = firstString(source, [
    "directionRationale", "direction_rationale", "rationale", "directionReason", "direction_reason",
  ]).slice(0, 1200) || general.slice(0, 1200);
  const riskFactors = firstString(source, ["riskFactors", "risk_factors", "risks", "risk"]).slice(0, 1200);
  const invalidation = firstString(source, [
    "invalidation", "invalidationCondition", "invalidation_condition", "invalidationSignal",
  ]).slice(0, 1200);
  const explanation = {
    pairSelection: pairSelection || missing,
    candleEvidence: candleEvidence || missing,
    directionRationale: directionRationale || missing,
    riskFactors: riskFactors || missing,
    invalidation: invalidation || missing,
  };
  const hasExplanation = Boolean(
    pairSelection || candleEvidence || directionRationale || riskFactors || invalidation,
  );
  return hasExplanation ? explanation : null;
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
  if (status === 408 || status === 504 || name.includes("timeout")) {
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
      maxOutputTokens: 8192,
    },
  }).then((response) => ({
    choices: [{
      message: { content: response.text || null },
      finish_reason: String(response.candidates?.[0]?.finishReason ?? "STOP"),
    }],
  }));
}

export async function requestMarketAiReviewOnce(
  request: ReviewCompletionRequest,
  baseMessages: ReviewMessage[],
  allowedSymbols: string[],
): Promise<MarketAiReview> {
  let choice: ReviewChoice | undefined;
  try {
    choice = (await request(baseMessages)).choices[0];
  } catch (error) {
    throw new Error(marketAiApiErrorMessage(error));
  }

  const content = choice?.message.content;
  const review = typeof content === "string"
    ? parseMarketAiReview(content, allowedSymbols)
    : null;
  if (review) return review;
  if (choice?.message.refusal) {
    throw new Error("Gemini отказался выполнить анализ. Сигнал не выдан.");
  }
  if (choice?.finish_reason.toLowerCase().includes("max_tokens")) {
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
  const preparedCandidates = candidates.map((candidate) => ({
    ...candidate,
    context: buildMarketAnalysisContext(candidate.candles, candleSeconds, nowSeconds),
  }));
  const eligibleCandidates = preparedCandidates.filter(
    (candidate) =>
      candidate.context.candles.length >= MIN_DIRECT_AI_CANDLES &&
      candidate.context.dataQuality.isFresh,
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
        : `После проверки данных нужно не менее ${MIN_DIRECT_AI_CANDLES} закрытых корректных свечей на пару.`,
    };
  }

  const input = {
    expirySeconds,
    candleSeconds,
    horizonCandles: expirySeconds / candleSeconds,
    candleFormat: "Массив candles содержит до 64 последних закрытых OHLC oldest-to-newest; значения в basis points относительно close предыдущей свечи. technicalIndicators и dataQuality рассчитаны по всей доступной истории (до 128 закрытых свечей). higherTimeframe содержит до 16 последних полностью собранных свечей.",
    indicatorFormat: {
      recentReturnBps: "Изменение close за указанное число свечей в basis points.",
      ema9Vs21Bps: "EMA 9 относительно EMA 21; положительное значение означает EMA 9 выше EMA 21.",
      emaSlope5Bps: "Изменение EMA за 5 свечей в basis points; знак показывает направление наклона.",
      rsi14: "RSI 14 в диапазоне 0..100.",
      macdHistogramBps: "Знак и величина MACD-гистограммы в basis points относительно последнего close.",
      bollingerZ20: "Отклонение последнего close от средней Bollinger 20 в стандартных отклонениях.",
      atr14Bps: "Средний истинный диапазон за 14 свечей в basis points.",
      atr5To14Ratio: "Отношение ATR 5 к ATR 14; выше 1 означает недавнее расширение диапазона.",
      prior20HighDistanceBps: "Предыдущий максимум 20 свечей относительно текущего close; отрицательное значение означает close выше максимума.",
      prior20LowDistanceBps: "Текущий close относительно предыдущего минимума 20 свечей; отрицательное значение означает close ниже минимума.",
      null: "Истории недостаточно для надёжного расчёта этого показателя.",
    },
    candidates: eligibleCandidates.map((candidate) => ({
      symbol: candidate.symbol,
      name: candidate.name,
      dataQuality: candidate.context.dataQuality,
      technicalIndicators: candidate.context.technicalIndicators,
      higherTimeframe: candidate.context.higherTimeframe
        ? {
            candleSeconds: candidate.context.higherTimeframe.candleSeconds,
            candleCount: Math.min(
              DIRECT_AI_VISIBLE_HIGHER_TIMEFRAME_CANDLES,
              candidate.context.higherTimeframe.candles.length,
            ),
            candles: candlesInBasisPoints(
              candidate.context.higherTimeframe.candles.slice(-DIRECT_AI_VISIBLE_HIGHER_TIMEFRAME_CANDLES),
            ),
          }
        : null,
      candles: candlesInBasisPoints(candidate.context.candles),
    })),
  };

  const userPrompt = JSON.stringify(input);
  const baseMessages: ReviewMessage[] = [
    { role: "system", content: DIRECT_AI_SYSTEM_PROMPT },
    { role: "user", content: userPrompt },
  ];
  const allowedSymbols = eligibleCandidates.map((candidate) => candidate.symbol);
  return requestMarketAiReviewWithRepair(
    options.request ?? requestMarketAiCompletion,
    baseMessages,
    allowedSymbols,
  );
}
