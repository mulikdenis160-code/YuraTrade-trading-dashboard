import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { buildMarketAnalysisContext } from "./market-analysis-context.server.ts";
import type { MarketCandle } from "./signal-model.server.ts";

export const DIRECT_AI_MODEL = "claude-opus-5";
export const DIRECT_AI_MODEL_LABEL = "Claude Opus 5";
export const DIRECT_AI_HISTORY_CANDLES = 128;
export const MIN_DIRECT_AI_CANDLES = 30;
const DIRECT_AI_VISIBLE_CANDLES = 32;
const DIRECT_AI_VISIBLE_HIGHER_TIMEFRAME_CANDLES = 16;

export type MarketAiCandidate = {
  symbol: string;
  name: string;
  candles: MarketCandle[];
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
  "Ты непосредственно анализируешь переданные свечи OHLC и выбираешь направление CALL или PUT, если для него есть ясное преимущество.",
  "Не используй отдельный классификатор, числовой порог уверенности, исторический порог точности или проверку на отложенной выборке как дополнительный фильтр.",
  "Минимум 30 корректных свечей — только условие достаточности входных данных, а не причина обязательно выдать сигнал.",
  "Не выдумывай направление: возвращай pass, если OHLC боковые или хаотичные, оба направления одинаково правдоподобны, либо сценарий держится только на одной свече без подтверждения. Краткосрочное движение против старшего тренда само по себе не причина для pass: проверь подтверждённый разворот или ложный пробой по закрытым свечам и прежним экстремумам; если структура это не поддерживает — верни pass.",
  "Проверяй контекст на нескольких масштабах: сопоставь короткую структуру OHLC с higherTimeframe, режимом волатильности, импульсом, EMA, RSI, MACD, Bollinger z-score и расстоянием до недавних границ диапазона. Ищи возможный пробой, ложный пробой, отбой от уровня и смену импульса.",
  "Эти индикаторы рассчитаны из тех же свечей, поэтому не считай их независимыми подтверждениями и не складывай механический балл. Используй их как проверяемые описания цены; при противоречии индикаторов и OHLC, пропуске важных интервалов или устаревании истории объясни риск либо верни pass.",
  "Если higherTimeframe отсутствует или содержит мало свечей, прямо учитывай ограниченность контекста и не достраивай недостающие бары. Не используй незакрытые свечи.",
  "Оцени ожидаемое движение к концу указанной экспирации, а не только цвет последних свечей. Учитывай, что candleSeconds — интервал свечи, а не гарантированный период прогноза; сравни horizonCandles с доступной историей.",
  "Сравни все доступные пары и выбери наиболее убедительный сценарий на указанную экспирацию, если он последовательно поддержан OHLC. Не требуй, чтобы все индикаторы совпадали; при отсутствии связной свечной структуры верни pass.",
  "Используй только переданные данные, не учитывай размер выплаты как причину повысить уверенность, не выдумывай индикаторы, уровни цены, новости или сведения, которых нет во входных данных. Технические расстояния даны в basis points, RSI — 0..100, Bollinger z-score — в стандартных отклонениях.",
  "Самооценка confidence субъективна и не является статистически калиброванной вероятностью или исторической точностью. Не обещай результат и не открывай сделки.",
  "Все пять текстов explanation напиши по-русски: pairSelection — почему выбрана эта пара; если пара одна, прямо скажи, что сравнения не было; candleEvidence — конкретные видимые свойства OHLC; directionRationale — почему эти свечи поддерживают CALL или PUT; riskFactors — что может привести к ошибке; invalidation — какое наблюдаемое движение ослабит сценарий без выдуманной цены.",
  "Кратко, но содержательно: каждое поле explanation — одно короткое предложение примерно до 180 символов. Верни только JSON: либо {\"decision\":\"signal\",\"symbol\":\"точный symbol из списка\",\"direction\":\"call\"|\"put\",\"confidence\":0..100 целое,\"explanation\":{\"pairSelection\":\"...\",\"candleEvidence\":\"...\",\"directionRationale\":\"...\",\"riskFactors\":\"...\",\"invalidation\":\"...\"}}, либо {\"decision\":\"pass\",\"reason\":\"кратко по-русски\"}.",
].join(" ");

let client: Anthropic | null = null;

function getAnthropicClient() {
  const apiKey = process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY;
  const baseURL = process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL;
  if (!apiKey || !baseURL) {
    throw new Error("Подключение Anthropic через Replit AI Integrations не настроено. Сигнал не выдан.");
  }
  if (!client) client = new Anthropic({ apiKey, baseURL, timeout: 45_000, maxRetries: 1 });
  return client;
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

function candlesInBasisPoints(candles: MarketCandle[]) {
  const start = Math.max(0, candles.length - DIRECT_AI_VISIBLE_CANDLES);
  let previousClose = candles[start - 1]?.close ?? candles[start]?.open ?? 1;
  const result: number[][] = [];

  for (let index = start; index < candles.length; index += 1) {
    const candle = candles[index];
    const base = previousClose || candle.open || 1;
    const toBasisPoints = (price: number) => Number((((price / base) - 1) * 10_000).toFixed(2));
    result.push([
      toBasisPoints(candle.open),
      toBasisPoints(candle.high),
      toBasisPoints(candle.low),
      toBasisPoints(candle.close),
    ]);
    previousClose = candle.close;
  }
  return result;
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
  if (error instanceof Error && error.message.includes("Подключение Anthropic через Replit AI Integrations не настроено")) {
    return error.message;
  }
  const status = isRecord(error)
    ? Number(error.status ?? error.statusCode)
    : Number.NaN;
  const name = error instanceof Error ? error.name.toLowerCase() : "";
  if (status === 401 || status === 403) {
    return "Anthropic отклонил подключение. Проверьте настройки интеграции; сигнал не выдан.";
  }
  if (status === 429) {
    return "Anthropic временно ограничил запросы. Подождите немного и попробуйте ещё раз.";
  }
  if (status === 408 || status === 504 || name.includes("timeout")) {
    return "Анализ Claude занял слишком много времени. Попробуйте ещё раз; сигнал не выдан.";
  }
  if (status === 400) {
    return "Anthropic отклонил формат запроса. Попробуйте ещё раз; если ошибка повторится, проверьте настройку модели.";
  }
  if (status === 404) {
    return "Модель Claude Opus 5 сейчас недоступна. Попробуйте ещё раз позже.";
  }
  if (status >= 500 || name.includes("connection")) {
    return "Сервис Anthropic временно недоступен. Попробуйте ещё раз через минуту.";
  }
  return "Не удалось завершить анализ Claude. Попробуйте ещё раз; сигнал не выдан.";
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
  const requestMessages = messages.flatMap((message) => {
    if (message.role === "system") return [];
    return [{ role: message.role, content: message.content }];
  });

  return getAnthropicClient().messages.create({
    model: DIRECT_AI_MODEL,
    max_tokens: 2048,
    system,
    messages: requestMessages,
  }).then((response) => {
    const content = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n");
    const refusal = response.stop_reason === "refusal"
      ? content || "Anthropic отказался выполнить анализ."
      : null;

    return {
      choices: [{
        message: { content: content || null, refusal },
        finish_reason: response.stop_reason === "max_tokens" ? "length" : response.stop_reason,
      }],
    };
  });
}

export async function requestMarketAiReviewWithRepair(
  request: ReviewCompletionRequest,
  baseMessages: ReviewMessage[],
  allowedSymbols: string[],
): Promise<MarketAiReview> {
  let firstChoice: ReviewChoice | undefined;
  try {
    firstChoice = (await request(baseMessages)).choices[0];
  } catch (error) {
    throw new Error(marketAiApiErrorMessage(error));
  }

  const firstContent = firstChoice?.message.content;
  const firstReview = typeof firstContent === "string"
    ? parseMarketAiReview(firstContent, allowedSymbols)
    : null;
  if (firstReview) return firstReview;
  if (firstChoice?.message.refusal) {
    throw new Error("Claude отказался выполнить анализ. Сигнал не выдан.");
  }

  const repairMessages: ReviewMessage[] = [
    ...baseMessages,
    ...(typeof firstContent === "string" && firstContent
      ? [{ role: "assistant" as const, content: firstContent.slice(0, 16_000) }]
      : []),
    {
      role: "user",
      content:
        "Предыдущий ответ нельзя проверить. Повтори анализ по исходным правилам и верни один корректный JSON-объект. Если ясного преимущества нет, верни pass с краткой причиной и не вынуждай себя выбирать направление. Если выдаёшь signal, используй точный symbol из списка, направление call или put, числовую confidence от 0 до 100 и все пять полей explanation. Не добавляй факты, которых нет в свечах.",
    },
  ];

  let retryChoice: ReviewChoice | undefined;
  try {
    retryChoice = (await request(repairMessages)).choices[0];
  } catch (error) {
    throw new Error(marketAiApiErrorMessage(error));
  }

  const retryContent = retryChoice?.message.content;
  const retryReview = typeof retryContent === "string"
    ? parseMarketAiReview(retryContent, allowedSymbols)
    : null;
  if (retryReview) return retryReview;
  if (retryChoice?.message.refusal) {
    throw new Error("Claude отказался выполнить анализ повторно. Сигнал не выдан.");
  }
  if (firstChoice?.finish_reason === "length" || retryChoice?.finish_reason === "length") {
    throw new Error("Claude оборвал ответ по лимиту длины. Повторите запрос; сигнал не выдан.");
  }
  if (typeof firstContent !== "string" && typeof retryContent !== "string") {
    throw new Error("Claude не вернул текст анализа после повторного запроса. Сигнал не выдан.");
  }
  throw new Error("Claude дважды вернул ответ, который не удалось проверить. Повторите запрос; сигнал не выдан.");
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
    candleFormat: "Массив candles содержит до 32 последних закрытых OHLC oldest-to-newest; значения в basis points относительно close предыдущей свечи. technicalIndicators и dataQuality рассчитаны по всей доступной истории (до 128 закрытых свечей). higherTimeframe содержит до 16 последних полностью собранных свечей.",
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
