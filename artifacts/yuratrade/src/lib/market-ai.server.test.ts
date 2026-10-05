import assert from "node:assert/strict";
import test from "node:test";
import {
  acceptsMarketAiReview,
  analyzeMarketCandidates,
  MIN_DIRECT_AI_CANDLES,
  parseMarketAiReview,
} from "./market-ai.server.ts";

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
    reason: `Нужно не менее ${MIN_DIRECT_AI_CANDLES} свечей на пару.`,
  });
});
