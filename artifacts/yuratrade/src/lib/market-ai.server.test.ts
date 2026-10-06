import assert from "node:assert/strict";
import test from "node:test";
import {
  acceptsMarketAiReview,
  analyzeMarketCandidates,
  DIRECT_AI_MODEL,
  DIRECT_AI_SYSTEM_PROMPT,
  marketAiApiErrorMessage,
  MIN_DIRECT_AI_CANDLES,
  parseMarketAiReview,
  requestMarketAiReviewWithRepair,
} from "./market-ai.server.ts";
import type { MarketCandle } from "./signal-model.server.ts";

test("direct market analysis uses Claude Opus 5 through Replit AI Integrations", () => {
  assert.equal(DIRECT_AI_MODEL, "claude-opus-5");
});

const validReview = JSON.stringify({
  decision: "signal",
  symbol: "EURUSD_otc",
  direction: "call",
  confidence: 84,
  explanation: {
    pairSelection: "В запросе была одна пара, сравнения с другими не было.",
    candleEvidence: "Несколько последних свечей закрылись выше открытия, диапазон не расширяется.",
    directionRationale: "Последовательность свечей поддерживает краткосрочное движение вверх.",
    riskFactors: "Короткий горизонт и смена импульса могут опровергнуть этот сценарий.",
    invalidation: "Сценарий ослабнет, если следующие свечи закрепятся ниже недавних минимумов.",
  },
});

function risingCandles(count: number, startTime = 6_000, interval = 60): MarketCandle[] {
  const candles: MarketCandle[] = [];
  let close = 1;
  for (let index = 0; index < count; index += 1) {
    const open = close;
    close += 0.0001;
    candles.push({
      time: startTime + index * interval,
      open,
      high: close + 0.00005,
      low: open - 0.00005,
      close,
    });
  }
  return candles;
}

test("direct AI review accepts only an allowed pair with a valid structured response", () => {
  const review = parseMarketAiReview(validReview, ["EURUSD_otc"]);
  assert.equal(review?.decision, "signal");
  if (review?.decision !== "signal") return;
  assert.equal(review.symbol, "EURUSD_otc");
  assert.equal(review.confidence, 84);
  assert.match(review.explanation.candleEvidence, /свечей/);
});

test("direct AI review rejects malformed responses and pairs outside the candidate pool", () => {
  assert.equal(parseMarketAiReview("not json", ["EURUSD_otc"]), null);
  assert.equal(parseMarketAiReview(validReview, ["GBPUSD_otc"]), null);
  assert.equal(
    parseMarketAiReview(JSON.stringify({ decision: "signal", symbol: "EURUSD_otc" }), ["EURUSD_otc"]),
    null,
  );
});

test("direct AI review normalizes common JSON variations without changing the allowed pair", () => {
  const response = `\`\`\`json
${JSON.stringify({
  result: {
    status: "SIGNAL",
    pair: "EUR/USD OTC",
    side: "CALL (up)",
    confidence: "0.84",
    analysis: {
      pair_selection: "В запросе была одна пара.",
      candle_evidence: "Последние свечи закрылись выше открытия. ".repeat(12),
      direction_rationale: "Свечи поддерживают движение вверх.",
      risk_factors: "Импульс может быстро измениться.",
      invalidation: "Сценарий ослабнет при движении вниз.",
    },
    providerMetadata: { version: 2 },
  },
})}
\`\`\``;

  const review = parseMarketAiReview(response, ["EURUSD_otc"]);
  assert.equal(review?.decision, "signal");
  if (review?.decision !== "signal") return;
  assert.equal(review.symbol, "EURUSD_otc");
  assert.equal(review.direction, "call");
  assert.equal(review.confidence, 84);
  assert.ok(review.explanation.candleEvidence.length > 240);
});

test("direct AI review rejects an unknown symbol even when the response is otherwise usable", () => {
  const response = JSON.stringify({
    decision: "signal",
    symbol: "GBPUSD_otc",
    direction: "put",
    confidence: 82,
    explanation: { candleEvidence: "Свечи снижаются." },
  });
  assert.equal(parseMarketAiReview(response, ["EURUSD_otc"]), null);
});

test("a direct AI signal uses the AI decision without a confidence threshold or classifier agreement", () => {
  const review = parseMarketAiReview(validReview, ["EURUSD_otc"]);
  assert.ok(review);
  assert.equal(acceptsMarketAiReview(review, ["EURUSD_otc"]), true);
  assert.equal(acceptsMarketAiReview(review, ["GBPUSD_otc"]), false);

  const lowerConfidence = parseMarketAiReview(
    JSON.stringify({ ...JSON.parse(validReview), confidence: 79 }),
    ["EURUSD_otc"],
  );
  assert.equal(acceptsMarketAiReview(lowerConfidence, ["EURUSD_otc"]), true);
});

test("direct AI may abstain when candle data is valid but no direction has a clear edge", () => {
  assert.match(DIRECT_AI_SYSTEM_PROMPT, /30 корректных свечей — только условие достаточности входных данных/);
  assert.match(DIRECT_AI_SYSTEM_PROMPT, /возвращай pass, если OHLC боковые или хаотичные/);
  assert.match(DIRECT_AI_SYSTEM_PROMPT, /candleSeconds — интервал свечи/);
  assert.match(DIRECT_AI_SYSTEM_PROMPT, /числовой порог уверенности/);
  assert.match(DIRECT_AI_SYSTEM_PROMPT, /higherTimeframe/);
  assert.match(DIRECT_AI_SYSTEM_PROMPT, /не складывай механический балл/);
  assert.match(DIRECT_AI_SYSTEM_PROMPT, /Краткосрочное движение против старшего тренда само по себе не причина для pass/);
  assert.match(DIRECT_AI_SYSTEM_PROMPT, /подтверждённый разворот или ложный пробой/);
  assert.match(DIRECT_AI_SYSTEM_PROMPT, /если он последовательно поддержан OHLC/);
  assert.doesNotMatch(DIRECT_AI_SYSTEM_PROMPT, /возвращай pass только если/u);
});

test("analysis request supplies closed candles, indicators, and completed higher-timeframe context", async () => {
  const candles = risingCandles(101);
  const last = candles.at(-1)!;
  let userContent = "";
  const result = await analyzeMarketCandidates(
    600,
    60,
    [{ symbol: "EURUSD_otc", name: "EUR/USD OTC", candles }],
    {
      nowSeconds: last.time + 30,
      request: async (messages) => {
        userContent = messages.find((message) => message.role === "user")?.content ?? "";
        return {
          choices: [{ message: { content: validReview }, finish_reason: "stop" }],
        };
      },
    },
  );

  assert.equal(result.decision, "signal");
  const input = JSON.parse(userContent) as {
    horizonCandles: number;
    candidates: Array<{
      candles: number[][];
      dataQuality: { closedCandleCount: number; isFresh: boolean };
      technicalIndicators: { rsi14: number | null };
      higherTimeframe: { candleSeconds: number; candleCount: number; candles: number[][] } | null;
    }>;
  };
  assert.equal(input.horizonCandles, 10);
  assert.equal(input.candidates[0]?.candles.length, 64);
  assert.equal(input.candidates[0]?.dataQuality.closedCandleCount, 100);
  assert.equal(input.candidates[0]?.dataQuality.isFresh, true);
  assert.equal(input.candidates[0]?.technicalIndicators.rsi14, 100);
  assert.equal(input.candidates[0]?.higherTimeframe?.candleSeconds, 300);
  assert.equal(input.candidates[0]?.higherTimeframe?.candleCount, 16);
  assert.equal(input.candidates[0]?.higherTimeframe?.candles.length, 16);
});

test("stale candle history is rejected before calling the AI", async () => {
  const candles = risingCandles(40);
  const last = candles.at(-1)!;
  let aiCalled = false;
  const result = await analyzeMarketCandidates(
    60,
    60,
    [{ symbol: "EURUSD_otc", name: "EUR/USD OTC", candles }],
    {
      nowSeconds: last.time + 60 * 5,
      request: async () => {
        aiCalled = true;
        return { choices: [{ message: { content: validReview }, finish_reason: "stop" }] };
      },
    },
  );

  assert.deepEqual(result, {
    decision: "pass",
    reason: "Последняя закрытая свеча слишком старая для надёжного анализа. Сигнал не выдан.",
  });
  assert.equal(aiCalled, false);
});

test("a valid AI abstention preserves its reason for the interface", () => {
  const reason = "Направление не подтверждается последовательностью свечей.";
  assert.deepEqual(
    parseMarketAiReview(JSON.stringify({ decision: "pass", reason }), ["EURUSD_otc"]),
    { decision: "pass", reason },
  );
});

test("direct AI abstains when a candidate has too few candles", async () => {
  const result = await analyzeMarketCandidates(60, 60, [{
    symbol: "EURUSD_otc",
    name: "EUR/USD OTC",
    candles: Array.from({ length: MIN_DIRECT_AI_CANDLES - 1 }, (_, index) => ({
      time: index * 60,
      open: 1,
      high: 1.01,
      low: 0.99,
      close: 1,
    })),
  }]);

  assert.deepEqual(result, {
    decision: "pass",
    reason: `После проверки данных нужно не менее ${MIN_DIRECT_AI_CANDLES} закрытых корректных свечей на пару.`,
  });
});

test("direct AI rejects an otherwise large candle set when invalid rows leave too little history", async () => {
  const result = await analyzeMarketCandidates(60, 60, [{
    symbol: "EURUSD_otc",
    name: "EUR/USD OTC",
    candles: [
      ...Array.from({ length: MIN_DIRECT_AI_CANDLES - 1 }, (_, index) => ({
        time: index * 60 + 60,
        open: 1,
        high: 1.01,
        low: 0.99,
        close: 1,
      })),
      { time: 2_000, open: Number.NaN, high: 1.01, low: 0.99, close: 1 },
    ],
  }]);

  assert.equal(result.decision, "pass");
});

test("Anthropic request failures produce actionable messages without exposing raw errors", () => {
  assert.match(marketAiApiErrorMessage({ status: 429 }), /ограничил запросы/);
  assert.match(marketAiApiErrorMessage({ status: 401 }), /отклонил подключение/);
  assert.match(marketAiApiErrorMessage({ status: 503 }), /временно недоступен/);
});

test("an unparseable Anthropic response is retried once and the repaired signal is returned", async () => {
  let calls = 0;
  const review = await requestMarketAiReviewWithRepair(
    async (messages) => {
      calls += 1;
      if (calls === 1) {
        return { choices: [{ message: { content: "not valid JSON" }, finish_reason: "stop" }] };
      }
      const repairPrompt = messages.find(
        (message) => message.role === "user" && message.content.includes("Предыдущий ответ нельзя проверить"),
      )?.content ?? "";
      assert.match(repairPrompt, /верни pass/);
      assert.match(repairPrompt, /ясного преимущества нет/);
      return { choices: [{ message: { content: validReview }, finish_reason: "stop" }] };
    },
    [{ role: "user", content: "Свечи для анализа." }],
    ["EURUSD_otc"],
  );

  assert.equal(calls, 2);
  assert.equal(review.decision, "signal");
});
