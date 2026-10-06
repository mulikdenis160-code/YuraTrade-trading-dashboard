import assert from "node:assert/strict";
import test from "node:test";
import {
  acceptsMarketAiReview,
  analyzeMarketCandidates,
  DIRECT_AI_HISTORY_CANDLES,
  DIRECT_AI_MODEL,
  DIRECT_AI_SYSTEM_PROMPT,
  marketAiApiErrorMessage,
  MIN_DIRECT_AI_CANDLES,
  MIN_SIGNAL_ADX14,
  parseMarketAiReview,
  requestMarketAiReviewOnce,
} from "./market-ai.server.ts";
import type { MarketCandle } from "./signal-model.server.ts";
import { SIGNAL_ANALYSIS_TIMEOUT_MS } from "./signal-config.ts";

test("direct market analysis uses Gemini 3.6 Flash when no proxy is configured", () => {
  assert.equal(DIRECT_AI_MODEL, "gemini-3.6-flash");
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
  assert.match(review.explanation, /свечей/);
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
  assert.ok(review.explanation.length > 240);
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
    JSON.stringify({ ...JSON.parse(validReview), confidence: 0 }),
    ["EURUSD_otc"],
  );
  assert.equal(acceptsMarketAiReview(lowerConfidence, ["EURUSD_otc"]), true);
});

test("Gemini receives one pair, technical context, and no abstention option or confidence threshold", () => {
  assert.match(DIRECT_AI_SYSTEM_PROMPT, /одну OTC-валютную пару/);
  assert.match(DIRECT_AI_SYSTEM_PROMPT, /до 128 проверенных закрытых свечей/);
  assert.match(DIRECT_AI_SYSTEM_PROMPT, /ADX 14 и \+DI\/-DI/);
  assert.match(DIRECT_AI_SYSTEM_PROMPT, /старшим таймфреймом/);
  assert.match(DIRECT_AI_SYSTEM_PROMPT, /четырьмя свечами ранее/);
  assert.match(DIRECT_AI_SYSTEM_PROMPT, /выбери направление вверх или вниз/);
  assert.doesNotMatch(DIRECT_AI_SYSTEM_PROMPT, /\bpass\b|abstain|no_signal/i);
  assert.doesNotMatch(DIRECT_AI_SYSTEM_PROMPT, /порог уверенности/);
  assert.equal(DIRECT_AI_HISTORY_CANDLES, 128);
});

test("analysis request transfers verified OHLC, indicators, quality, higher timeframe, and quote context", async () => {
  const candles = risingCandles(101);
  const last = candles.at(-1)!;
  let userContent = "";
  const result = await analyzeMarketCandidates(
    120,
    60,
    [{
      symbol: "EURUSD_otc",
      name: "EUR/USD OTC",
      candles,
      currentPrice: 1.12345,
      quoteAgeMs: 125,
    }],
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
    symbol: string;
    expirySeconds: number;
    candleSeconds: number;
    currentPrice: number;
    quoteAgeMs: number;
    trend: {
      direction: string;
      latestClose: number;
      closeFourCandlesEarlier: number;
      changePercent: number;
    };
    volatility: { periodCandles: number; standardDeviation: number };
    quoteVsLastCloseBps: number;
    dataQuality: {
      closedCandleCount: number;
      latestClosedCandleTime: number | null;
      missingIntervals: number;
      isFresh: boolean;
    };
    technicalIndicators: {
      ema: { ema50Slope5Bps: number | null };
      rsi14: number | null;
      directionalMovement: {
        adx14: number | null;
        plusDi14: number | null;
        minusDi14: number | null;
      };
    };
    higherTimeframe: {
      candleSeconds: number;
      candles: Array<{ time: number; open: number; high: number; low: number; close: number }>;
      technicalIndicators: { recentReturnBps: { bars14: number | null } };
    } | null;
    closes: number[];
    candles: Array<{ time: number; open: number; high: number; low: number; close: number }>;
  };
  assert.equal(input.symbol, "EURUSD_otc");
  assert.equal(input.expirySeconds, 120);
  assert.equal(input.candleSeconds, 60);
  assert.equal(input.currentPrice, 1.12345);
  assert.equal(input.quoteAgeMs, 125);
  assert.equal(input.closes.length, 30);
  assert.equal(input.candles.length, 30);
  assert.equal(input.candles[0]?.time, candles[70]?.time);
  assert.equal(input.dataQuality.closedCandleCount, 100);
  assert.equal(input.dataQuality.latestClosedCandleTime, candles[99]?.time);
  assert.equal(input.dataQuality.missingIntervals, 0);
  assert.equal(input.dataQuality.isFresh, true);
  assert.ok(Number.isFinite(input.quoteVsLastCloseBps));
  assert.notEqual(input.technicalIndicators.ema.ema50Slope5Bps, null);
  assert.equal(input.technicalIndicators.rsi14, 100);
  assert.ok(input.technicalIndicators.directionalMovement.adx14! > 20);
  assert.ok(
    input.technicalIndicators.directionalMovement.plusDi14! >
      input.technicalIndicators.directionalMovement.minusDi14!,
  );
  assert.equal(input.higherTimeframe?.candleSeconds, 300);
  assert.equal(input.higherTimeframe?.candles.length, 20);
  assert.ok(input.higherTimeframe?.technicalIndicators.recentReturnBps.bars14! > 0);
  assert.equal(input.trend.latestClose, input.closes.at(-1));
  assert.equal(input.trend.closeFourCandlesEarlier, input.closes.at(-5));
  assert.ok(input.trend.changePercent > 0);
  assert.equal(input.volatility.periodCandles, 12);
  assert.ok(input.volatility.standardDeviation > 0);
});

test("weak ADX returns no signal without calling Gemini", async () => {
  const candles = Array.from({ length: 64 }, (_, index) => ({
    time: 6_000 + index * 60,
    open: 1.1,
    high: 1.10005,
    low: 1.09995,
    close: 1.1,
  }));
  let called = false;
  const result = await analyzeMarketCandidates(
    120,
    60,
    [{
      symbol: "EURUSD_otc",
      name: "EUR/USD OTC",
      candles,
      currentPrice: 1.1,
      quoteAgeMs: 0,
    }],
    {
      nowSeconds: candles.at(-1)!.time + 30,
      request: async () => {
        called = true;
        return { choices: [{ message: { content: validReview }, finish_reason: "stop" }] };
      },
    },
  );

  assert.equal(MIN_SIGNAL_ADX14, 20);
  assert.equal(result.decision, "pass");
  if (result.decision === "pass") assert.match(result.reason, /ADX\(14\).*ниже 20/);
  assert.equal(called, false);
});

test("missing ADX history returns no signal without calling Gemini", async () => {
  const candles = risingCandles(20);
  let called = false;
  const result = await analyzeMarketCandidates(
    120,
    60,
    [{
      symbol: "EURUSD_otc",
      name: "EUR/USD OTC",
      candles,
      currentPrice: candles.at(-1)!.close,
      quoteAgeMs: 0,
    }],
    {
      nowSeconds: candles.at(-1)!.time + 30,
      request: async () => {
        called = true;
        return { choices: [{ message: { content: validReview }, finish_reason: "stop" }] };
      },
    },
  );

  assert.equal(result.decision, "pass");
  if (result.decision === "pass") {
    assert.match(result.reason, /недостаточно.*ADX\(14\)/i);
    assert.match(result.reason, /не менее 28/);
  }
  assert.equal(called, false);
});

test("analysis submits only one pair even when multiple candidates are provided", async () => {
  const candles = risingCandles(30);
  const last = candles.at(-1)!;
  let userContent = "";
  await analyzeMarketCandidates(
    120,
    60,
    [
      {
        symbol: "EURUSD_otc",
        name: "EUR/USD OTC",
        candles,
        currentPrice: 1.1,
        quoteAgeMs: 0,
      },
      {
        symbol: "GBPUSD_otc",
        name: "GBP/USD OTC",
        candles,
        currentPrice: 1.2,
        quoteAgeMs: 0,
      },
    ],
    {
      nowSeconds: last.time + 30,
      request: async (messages) => {
        userContent = messages.find((message) => message.role === "user")?.content ?? "";
        return { choices: [{ message: { content: validReview }, finish_reason: "STOP" }] };
      },
    },
  );
  const input = JSON.parse(userContent) as { symbol: string; pair: string };
  assert.equal(input.symbol, "EURUSD_otc");
  assert.equal(input.pair, "EUR/USD OTC");
});

test("stale candle history is rejected before calling the AI", async () => {
  const candles = risingCandles(40);
  const last = candles.at(-1)!;
  let aiCalled = false;
  const result = await analyzeMarketCandidates(
    60,
    60,
    [{
      symbol: "EURUSD_otc",
      name: "EUR/USD OTC",
      candles,
      currentPrice: 1.2,
      quoteAgeMs: 0,
    }],
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

test("a quote older than 20 seconds is rejected before calling the AI", async () => {
  const candles = risingCandles(20);
  const last = candles.at(-1)!;
  let aiCalled = false;
  const result = await analyzeMarketCandidates(
    120,
    60,
    [{
      symbol: "EURUSD_otc",
      name: "EUR/USD OTC",
      candles,
      currentPrice: 1.2,
      quoteAgeMs: 20_001,
    }],
    {
      nowSeconds: last.time + 30,
      request: async () => {
        aiCalled = true;
        return { choices: [{ message: { content: validReview }, finish_reason: "STOP" }] };
      },
    },
  );
  assert.deepEqual(result, {
    decision: "pass",
    reason: "Живая котировка старше 20 секунд или недоступна. Сигнал не выдан.",
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

test("local data checks stop the request when a candidate has too few candles", async () => {
  const result = await analyzeMarketCandidates(60, 60, [{
    symbol: "EURUSD_otc",
    name: "EUR/USD OTC",
    currentPrice: 1,
    quoteAgeMs: 0,
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
    currentPrice: 1,
    quoteAgeMs: 0,
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

test("Gemini request failures produce actionable messages without exposing raw errors", () => {
  assert.match(marketAiApiErrorMessage({ status: 429 }), /ограничил запросы/);
  assert.match(marketAiApiErrorMessage({ status: 401 }), /отклонил подключение/);
  assert.match(marketAiApiErrorMessage({ status: 503 }), /временно недоступен/);
});

test("a valid compact Gemini response is accepted without a second classifier", () => {
  const review = parseMarketAiReview(
    JSON.stringify({
      direction: "up",
      explanation: "Цена растёт по последним закрытиям.",
      confidence: 0,
    }),
    ["EURUSD_otc"],
  );
  assert.equal(review?.decision, "signal");
  if (review?.decision !== "signal") return;
  assert.equal(review.symbol, "EURUSD_otc");
  assert.equal(review.direction, "call");
  assert.equal(review.confidence, 0);
});

test("an unparseable Gemini response fails after exactly one model request", async () => {
  let calls = 0;
  await assert.rejects(
    requestMarketAiReviewOnce(
      async () => {
      calls += 1;
        return { choices: [{ message: { content: "not valid JSON" }, finish_reason: "stop" }] };
      },
      [{ role: "user", content: "Свечи для анализа." }],
      ["EURUSD_otc"],
    ),
    /не удалось проверить/,
  );
  assert.equal(calls, 1);
});

test("a Gemini analysis request is stopped at the five-second budget", async () => {
  assert.equal(SIGNAL_ANALYSIS_TIMEOUT_MS, 5_000);
  const request = async () => new Promise<{ choices: never[] }>(() => {});
  await assert.rejects(
    requestMarketAiReviewOnce(request, [], ["EURUSD_otc"], 10),
    /занял слишком много времени/,
  );
});
