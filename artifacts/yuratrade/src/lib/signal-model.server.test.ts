import assert from "node:assert/strict";
import test from "node:test";
import {
  AI_HISTORY_CANDLES,
  analyzeCandleHistory,
  type MarketCandle,
} from "./signal-model.server.ts";

function candleHistory(count: number): MarketCandle[] {
  const rows: MarketCandle[] = [];
  let priorClose = 1.1;
  for (let index = 0; index < count; index += 1) {
    const open = priorClose;
    const close = 1.1 + Math.sin((index / 80) * Math.PI * 2) * 0.001;
    const high = Math.max(open, close) + 0.00004;
    const low = Math.min(open, close) - 0.00004;
    rows.push({ time: index * 60, open, high, low, close });
    priorClose = close;
  }
  return rows;
}

test("AI model requires enough historical WebSocket candles", () => {
  const result = analyzeCandleHistory(candleHistory(80), 60, 60, 92);
  assert.equal(result.status, "not-ready");
  if (result.status === "not-ready") assert.equal(result.reason, "insufficient-history");
});

test("AI model chooses high-win-probability signals only after forward validation", () => {
  const result = analyzeCandleHistory(candleHistory(AI_HISTORY_CANDLES), 60, 60, 92);
  assert.equal(result.status, "ready");
  if (result.status !== "ready") return;
  assert.ok(result.probability >= 0.65 && result.probability <= 1);
  assert.ok(result.expectedValue >= 0.02);
  assert.ok(result.brierScore < result.baselineBrier);
  assert.ok(result.validationTrades >= 30);
  assert.ok(result.validationWinRate >= 0.65);
  assert.ok(result.validationReturn > 0);
});
