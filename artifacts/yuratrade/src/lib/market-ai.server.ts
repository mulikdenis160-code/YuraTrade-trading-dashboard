import OpenAI from "openai";
import { z } from "zod";
import type { MarketCandle } from "./signal-model.server.ts";

export const DIRECT_AI_MODEL = "gpt-6-astra";
export const MIN_DIRECT_AI_CONFIDENCE = 80;

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
  reason: z.string().trim().min(1).max(220),
}).strict();

const passReviewSchema = z.object({
  decision: z.literal("pass"),
  reason: z.string().trim().min(1).max(220),
}).strict();

const reviewSchema = z.discriminatedUnion("decision", [
  signalReviewSchema,
  passReviewSchema,
]);

export type MarketAiReview = z.infer<typeof reviewSchema>;

let client: OpenAI | null = null;

function getOpenAiClient() {
  const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
  const baseURL = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
  if (!apiKey || !baseURL) {
    throw new Error("Подключение OpenAI не настроено. Сигнал не выдан.");
  }
  if (!client) client = new OpenAI({ apiKey, baseURL });
  return client;
}

function candlesInBasisPoints(candles: MarketCandle[]) {
  const start = Math.max(0, candles.length - 128);
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
  let decoded: unknown;
  try {
    decoded = JSON.parse(content);
  } catch {
    return null;
  }

  const parsed = reviewSchema.safeParse(decoded);
  if (!parsed.success) return null;
  if (parsed.data.decision === "signal" && !allowedSymbols.includes(parsed.data.symbol)) return null;
  return parsed.data;
}

export function acceptsMarketAiReview(
  review: MarketAiReview | null,
  candidate: { symbol: string; direction: "call" | "put" },
) {
  return (
    review?.decision === "signal" &&
    review.symbol === candidate.symbol &&
    review.direction === candidate.direction &&
    review.confidence >= MIN_DIRECT_AI_CONFIDENCE
  );
}

export async function analyzeMarketCandidates(
  expirySeconds: number,
  candleSeconds: number,
  candidates: MarketAiCandidate[],
): Promise<MarketAiReview> {
  if (candidates.length === 0) return { decision: "pass", reason: "Нет свечных кандидатов для анализа." };

  const input = {
    expirySeconds,
    candleSeconds,
    candleFormat: "Последовательность OHLC, oldest-to-newest; значения в basis points относительно close предыдущей свечи.",
    candidates: candidates.map((candidate) => ({
      symbol: candidate.symbol,
      name: candidate.name,
      candles: candlesInBasisPoints(candidate.candles),
    })),
  };

  let content: string | null | undefined;
  try {
    const response = await getOpenAiClient().chat.completions.create({
      model: DIRECT_AI_MODEL,
      max_completion_tokens: 8192,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Ты анализируешь направление ближайшего движения по свечам OHLC для сигнала CALL/PUT. Используй только переданные данные, сравни доступные пары по вероятности верного направления и пропускай сомнительные ситуации. Не учитывай размер выплаты как причину повысить уверенность. Самооценка confidence не является статистически калиброванной вероятностью. Не обещай результат и не открывай сделки. Верни только JSON: либо {\"decision\":\"signal\",\"symbol\":\"точный symbol из списка\",\"direction\":\"call\"|\"put\",\"confidence\":0..100 целое,\"reason\":\"кратко по-русски\"}, либо {\"decision\":\"pass\",\"reason\":\"кратко по-русски\"}.",
        },
        {
          role: "user",
          content: JSON.stringify(input),
        },
      ],
    });
    content = response.choices[0]?.message?.content;
  } catch {
    throw new Error("OpenAI не смог завершить анализ. Сигнал не выдан.");
  }

  const review = content ? parseMarketAiReview(content, candidates.map((candidate) => candidate.symbol)) : null;
  if (!review) throw new Error("OpenAI вернул некорректный анализ. Сигнал не выдан.");
  return review;
}
