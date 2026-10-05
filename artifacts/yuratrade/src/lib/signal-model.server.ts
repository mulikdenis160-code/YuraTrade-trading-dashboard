export type MarketCandle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
};

export const MIN_AI_SAMPLES = 160;
export const AI_HISTORY_CANDLES = 512;

export type AiCandleDecision =
  | {
      status: "ready";
      direction: "call" | "put";
      probability: number;
      expectedValue: number;
      brierScore: number;
      baselineBrier: number;
      sampleCount: number;
      validationTrades: number;
      validationWinRate: number;
      validationReturn: number;
    }
  | {
      status: "not-ready";
      reason: "insufficient-history" | "class-balance" | "failed-validation";
      sampleCount: number;
    }
  | { status: "no-edge"; sampleCount: number };

type Sample = { features: number[]; up: 0 | 1 };
type LogisticModel = { means: number[]; scales: number[]; weights: number[]; bias: number };
type Calibration = { slope: number; intercept: number };

const FEATURE_WINDOW = 24;
const MIN_VALIDATION_TRADES = 30;
const MIN_LIVE_EDGE = 0.02;
export const MIN_LIVE_WIN_PROBABILITY = 0.65;
const MIN_VALIDATION_WIN_RATE = 0.65;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function featureAt(candles: MarketCandle[], end: number) {
  const window = candles.slice(end - FEATURE_WINDOW, end);
  if (window.length < FEATURE_WINDOW) return null;

  const closes = window.map((candle) => candle.close);
  const ranges = window.map((candle) => Math.max(0, candle.high - candle.low));
  const totalRange = ranges.reduce((sum, value) => sum + value, 0);
  const averageRange = totalRange / ranges.length;
  const latest = closes[closes.length - 1];
  const rangeFloor = Math.max(averageRange, Math.abs(latest) * 1e-10, 1e-12);
  const momentum = (bars: number) => {
    const begin = window.length - bars;
    const slice = window.slice(begin);
    const denominator = slice.reduce((sum, candle) => sum + Math.max(0, candle.high - candle.low), 0);
    return denominator > 0 ? (slice[slice.length - 1].close - slice[0].open) / denominator : 0;
  };
  const candleAgreement = (bars: number) => {
    const slice = window.slice(-bars);
    return slice.filter((candle) => candle.close > candle.open).length / slice.length;
  };
  const bodyRatio = (bars: number) => {
    const slice = window.slice(-bars);
    return (
      slice.reduce((sum, candle) => {
        const range = Math.max(candle.high - candle.low, Math.abs(candle.close) * 1e-10, 1e-12);
        return sum + Math.abs(candle.close - candle.open) / range;
      }, 0) / slice.length
    );
  };

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  for (let index = 0; index < closes.length; index += 1) {
    sumX += index;
    sumY += closes[index];
    sumXY += index * closes[index];
    sumXX += index * index;
  }
  const slope = (closes.length * sumXY - sumX * sumY) / (closes.length * sumXX - sumX * sumX || 1);
  const high = Math.max(...window.map((candle) => candle.high));
  const low = Math.min(...window.map((candle) => candle.low));
  const range = Math.max(high - low, rangeFloor);
  const changes = closes.slice(1).map((close, index) => close - closes[index]);
  const gains = changes.reduce((sum, value) => sum + Math.max(0, value), 0);
  const losses = changes.reduce((sum, value) => sum + Math.max(0, -value), 0);
  const rsi = losses === 0 ? 1 : gains === 0 ? 0 : 1 - 1 / (1 + gains / losses);
  const recentVolatility = ranges.slice(-6).reduce((sum, value) => sum + value, 0) / 6;
  const baseVolatility = ranges.slice(-18, -6).reduce((sum, value) => sum + value, 0) / 12;

  return [
    clamp(momentum(4), -2, 2),
    clamp(momentum(12), -2, 2),
    clamp(momentum(24), -2, 2),
    candleAgreement(5),
    candleAgreement(12),
    bodyRatio(12),
    clamp(averageRange / Math.max(Math.abs(latest), 1e-12) * 1000, 0, 2),
    clamp((latest - low) / range, 0, 1),
    clamp((slope * FEATURE_WINDOW) / range, -2, 2),
    rsi,
    clamp(recentVolatility / Math.max(baseVolatility, rangeFloor), 0, 4),
  ];
}

function sigmoid(value: number) {
  const safe = clamp(value, -30, 30);
  return 1 / (1 + Math.exp(-safe));
}

function standardized(features: number[], means: number[], scales: number[]) {
  return features.map((value, index) => (value - means[index]) / scales[index]);
}

function fitLogistic(samples: Sample[]): LogisticModel {
  const featureCount = samples[0].features.length;
  const means = Array.from(
    { length: featureCount },
    (_, index) => samples.reduce((sum, sample) => sum + sample.features[index], 0) / samples.length,
  );
  const scales = Array.from({ length: featureCount }, (_, index) => {
    const variance =
      samples.reduce((sum, sample) => sum + (sample.features[index] - means[index]) ** 2, 0) / samples.length;
    return Math.sqrt(variance) || 1;
  });
  const rows = samples.map((sample) => standardized(sample.features, means, scales));
  const wins = samples.filter((sample) => sample.up === 1).length;
  const losses = samples.length - wins;
  const weights = Array(featureCount).fill(0) as number[];
  let bias = Math.log((wins + 1) / (losses + 1));

  for (let epoch = 0; epoch < 800; epoch += 1) {
    const gradients = Array(featureCount).fill(0) as number[];
    let biasGradient = 0;
    for (let row = 0; row < rows.length; row += 1) {
      const value = rows[row].reduce((sum, feature, index) => sum + feature * weights[index], bias);
      const error = sigmoid(value) - samples[row].up;
      biasGradient += error;
      for (let index = 0; index < featureCount; index += 1) gradients[index] += error * rows[row][index];
    }
    const rate = 0.06 / samples.length;
    bias -= rate * biasGradient;
    for (let index = 0; index < featureCount; index += 1) {
      weights[index] -= rate * (gradients[index] + 0.03 * weights[index]);
    }
  }
  return { means, scales, weights, bias };
}

function score(model: LogisticModel, features: number[]) {
  const row = standardized(features, model.means, model.scales);
  return row.reduce((sum, value, index) => sum + value * model.weights[index], model.bias);
}

function calibrate(logits: number[], labels: Array<0 | 1>): Calibration {
  let slope = 1;
  let intercept = 0;
  for (let epoch = 0; epoch < 600; epoch += 1) {
    let slopeGradient = 0;
    let interceptGradient = 0;
    for (let index = 0; index < logits.length; index += 1) {
      const error = sigmoid(slope * logits[index] + intercept) - labels[index];
      slopeGradient += error * logits[index];
      interceptGradient += error;
    }
    const rate = 0.025 / logits.length;
    slope -= rate * (slopeGradient + 0.02 * (slope - 1));
    intercept -= rate * interceptGradient;
  }
  return { slope, intercept };
}

function expectedValue(probabilityUp: number, payout: number, direction: "call" | "put") {
  const winProbability = direction === "call" ? probabilityUp : 1 - probabilityUp;
  return winProbability * (payout / 100) - (1 - winProbability);
}

function bestSide(probabilityUp: number, payout: number) {
  const callValue = expectedValue(probabilityUp, payout, "call");
  const putValue = expectedValue(probabilityUp, payout, "put");
  return callValue >= putValue
    ? { direction: "call" as const, probability: probabilityUp, expectedValue: callValue }
    : { direction: "put" as const, probability: 1 - probabilityUp, expectedValue: putValue };
}

export function analyzeCandleHistory(
  candles: MarketCandle[],
  expirySeconds: number,
  candleSeconds: number,
  payout: number,
): AiCandleDecision {
  const exactHorizon = expirySeconds / candleSeconds;
  const horizon = Math.max(1, Math.ceil(exactHorizon));
  const samples: Sample[] = [];
  for (let end = FEATURE_WINDOW; end + horizon - 1 < candles.length; end += 1) {
    const features = featureAt(candles, end);
    if (!features) continue;
    const entry = candles[end - 1].close;
    const targetIndex = end - 1 + exactHorizon;
    const lowerIndex = Math.floor(targetIndex);
    const upperIndex = Math.ceil(targetIndex);
    const fraction = targetIndex - lowerIndex;
    const future =
      candles[lowerIndex].close +
      (candles[upperIndex].close - candles[lowerIndex].close) * fraction;
    if (future === entry) continue;
    samples.push({ features, up: future > entry ? 1 : 0 });
  }

  const sampleCount = samples.length;
  if (sampleCount < MIN_AI_SAMPLES) {
    return { status: "not-ready", reason: "insufficient-history", sampleCount };
  }

  const trainEnd = Math.floor(sampleCount * 0.7);
  const calibrationEnd = Math.floor(sampleCount * 0.85);
  const embargo = horizon;
  const training = samples.slice(0, Math.max(0, trainEnd - embargo));
  const calibrationSamples = samples.slice(trainEnd + embargo, Math.max(trainEnd + embargo, calibrationEnd - embargo));
  const validation = samples.slice(calibrationEnd + embargo);
  const trainingUps = training.filter((sample) => sample.up === 1).length;
  const calibrationUps = calibrationSamples.filter((sample) => sample.up === 1).length;
  const validationUps = validation.filter((sample) => sample.up === 1).length;
  if (
    trainingUps < 25 ||
    training.length - trainingUps < 25 ||
    calibrationUps < 8 ||
    calibrationSamples.length - calibrationUps < 8 ||
    validationUps < 8 ||
    validation.length - validationUps < 8
  ) {
    return { status: "not-ready", reason: "class-balance", sampleCount };
  }

  const model = fitLogistic(training);
  const calibrationLogits = calibrationSamples.map((sample) => score(model, sample.features));
  const calibration = calibrate(calibrationLogits, calibrationSamples.map((sample) => sample.up));
  const probabilities = validation.map((sample) =>
    sigmoid(calibration.slope * score(model, sample.features) + calibration.intercept),
  );
  const baselineRate = calibrationUps / calibrationSamples.length;
  const brierScore =
    probabilities.reduce((sum, probability, index) => sum + (probability - validation[index].up) ** 2, 0) /
    validation.length;
  const baselineBrier =
    validation.reduce((sum, sample) => sum + (baselineRate - sample.up) ** 2, 0) / validation.length;
  let validationTrades = 0;
  let validationWins = 0;
  let validationReturn = 0;
  for (let index = 0; index < validation.length; index += 1) {
    const choice = bestSide(probabilities[index], payout);
    if (choice.probability < MIN_LIVE_WIN_PROBABILITY || choice.expectedValue < MIN_LIVE_EDGE) continue;
    validationTrades += 1;
    const won = choice.direction === "call" ? validation[index].up === 1 : validation[index].up === 0;
    if (won) validationWins += 1;
    validationReturn += won ? payout / 100 : -1;
  }
  const averageValidationReturn = validationTrades ? validationReturn / validationTrades : 0;
  const validationWinRate = validationTrades ? validationWins / validationTrades : 0;
  if (
    brierScore >= baselineBrier ||
    validationTrades < MIN_VALIDATION_TRADES ||
    validationWinRate < MIN_VALIDATION_WIN_RATE ||
    averageValidationReturn <= 0
  ) {
    return { status: "not-ready", reason: "failed-validation", sampleCount };
  }

  const currentFeatures = featureAt(candles, candles.length);
  if (!currentFeatures) return { status: "not-ready", reason: "insufficient-history", sampleCount };
  const currentProbabilityUp = sigmoid(
    calibration.slope * score(model, currentFeatures) + calibration.intercept,
  );
  const choice = bestSide(currentProbabilityUp, payout);
  if (
    choice.probability < MIN_LIVE_WIN_PROBABILITY ||
    choice.expectedValue < MIN_LIVE_EDGE
  ) {
    return { status: "no-edge", sampleCount };
  }
  return {
    status: "ready",
    direction: choice.direction,
    probability: choice.probability,
    expectedValue: choice.expectedValue,
    brierScore,
    baselineBrier,
    sampleCount,
    validationTrades,
    validationWinRate,
    validationReturn: averageValidationReturn,
  };
}
