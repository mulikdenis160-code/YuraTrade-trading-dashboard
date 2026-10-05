import assert from "node:assert/strict";
import test from "node:test";
import {
  acceptsMarketAiReview,
  parseMarketAiReview,
} from "./market-ai.server.ts";

const validReview = JSON.stringify({
  decision: "signal",
  symbol: "EURUSD_otc",
  direction: "call",
  confidence: 84,
  explanation: {
    pairSelection: "Пара прошла предварительную проверку; в запросе была одна пара, сравнения с другими не было.",
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

test("a direct AI signal requires high confidence and agreement with the validated direction", () => {
  const review = parseMarketAiReview(validReview, ["EURUSD_otc"]);
  assert.ok(review);
  assert.equal(acceptsMarketAiReview(review, { symbol: "EURUSD_otc", direction: "call" }), true);
  assert.equal(acceptsMarketAiReview(review, { symbol: "EURUSD_otc", direction: "put" }), false);
  assert.equal(acceptsMarketAiReview(review, { symbol: "GBPUSD_otc", direction: "call" }), false);

  const lowerConfidence = parseMarketAiReview(
    JSON.stringify({ ...JSON.parse(validReview), confidence: 79 }),
    ["EURUSD_otc"],
  );
  assert.equal(acceptsMarketAiReview(lowerConfidence, { symbol: "EURUSD_otc", direction: "call" }), false);
});
