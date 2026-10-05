import type { SignalJournalEntry } from "./signal-journal.ts";

export const MIN_MODEL_SAMPLES = 120;

export type SignalModelInput = Pick<
  SignalJournalEntry,
  "direction" | "payout" | "seconds" | "step" | "ruleScore" | "bars"
>;

export type SignalModelAssessment = {
  status: "collecting" | "ready" | "unreliable";
  reason?: "sample-count" | "class-balance" | "no-baseline-edge";
  sampleCount: number;
  minimumSamples: number;
  validationCount: number;
  probability?: number;
  expectedValue?: number;
  brierScore?: number;
  baselineBrier?: number;
};

type Example = { features: number[]; label: 0 | 1 };
type LogisticModel = { means: number[]; scales: number[]; weights: number[]; bias: number };

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function featuresOf(input: SignalModelInput) {
  const bars = input.bars.slice(-8);
  if (bars.length < 3) return null;

  const ranges = bars.map(([, high, low]) => Math.max(0, high - low));
  const rangeSum = ranges.reduce((sum, value) => sum + value, 0);
  const [firstOpen] = bars[0];
  const [, , , lastClose] = bars[bars.length - 1];
  const directionSign = input.direction === "call" ? 1 : -1;
  const directionalCandles = bars.filter(([open, , , close]) =>
    input.direction === "call" ? close >= open : close <= open,
  ).length;
  const bodyRatios = bars.map(([open, high, low, close]) => {
    const range = Math.max(high - low, Math.abs(close) * 1e-8, 1e-12);
    return Math.abs(close - open) / range;
  });
  const averageBodyRatio = bodyRatios.reduce((sum, value) => sum + value, 0) / bars.length;
  const averageNormalizedRange =
    ranges.reduce((sum, value, index) => sum + value / Math.max(Math.abs(bars[index][3]), 1e-12), 0) /
    bars.length;
  const momentum = rangeSum > 0 ? (lastClose - firstOpen) / rangeSum : 0;

  return [
    clamp(input.ruleScore, 0, 1),
    clamp(input.payout / 100, 0, 1),
    clamp(Math.log(Math.max(1, input.seconds / 60)) / Math.log(240), 0, 1),
    directionSign,
    clamp(input.step / 3, 0, 1),
    clamp(momentum, -2, 2),
    directionalCandles / bars.length,
    averageBodyRatio,
    clamp(averageNormalizedRange * 1000, 0, 2),
  ];
}

function sigmoid(value: number) {
  const safe = clamp(value, -30, 30);
  return 1 / (1 + Math.exp(-safe));
}

function standardize(features: number[], means: number[], scales: number[]) {
  return features.map((value, index) => (value - means[index]) / scales[index]);
}

function fitLogistic(examples: Example[]): LogisticModel {
  const featureCount = examples[0].features.length;
  const means = Array.from({ length: featureCount }, (_, index) =>
    examples.reduce((sum, example) => sum + example.features[index], 0) / examples.length,
  );
  const scales = Array.from({ length: featureCount }, (_, index) => {
    const variance =
      examples.reduce((sum, example) => sum + (example.features[index] - means[index]) ** 2, 0) /
      examples.length;
    return Math.sqrt(variance) || 1;
  });
  const rows = examples.map((example) => standardize(example.features, means, scales));
  const positiveCount = examples.filter((example) => example.label === 1).length;
  const negativeCount = examples.length - positiveCount;
  const weights = Array(featureCount).fill(0) as number[];
  let bias = Math.log((positiveCount + 1) / (negativeCount + 1));

  for (let epoch = 0; epoch < 700; epoch += 1) {
    const gradients = Array(featureCount).fill(0) as number[];
    let biasGradient = 0;
    for (let row = 0; row < rows.length; row += 1) {
      const logit = rows[row].reduce((sum, value, index) => sum + value * weights[index], bias);
      const error = sigmoid(logit) - examples[row].label;
      biasGradient += error;
      for (let index = 0; index < featureCount; index += 1) {
        gradients[index] += error * rows[row][index];
      }
    }
    const rate = 0.08 / examples.length;
    bias -= rate * biasGradient;
    for (let index = 0; index < featureCount; index += 1) {
      weights[index] -= rate * (gradients[index] + 0.02 * weights[index]);
    }
  }

  return { means, scales, weights, bias };
}

function logit(model: LogisticModel, features: number[]) {
  return standardize(features, model.means, model.scales).reduce(
    (sum, value, index) => sum + value * model.weights[index],
    model.bias,
  );
}

function fitCalibration(logits: number[], labels: Array<0 | 1>) {
  let slope = 1;
  let intercept = 0;
  for (let epoch = 0; epoch < 500; epoch += 1) {
    let slopeGradient = 0;
    let interceptGradient = 0;
    for (let index = 0; index < logits.length; index += 1) {
      const error = sigmoid(slope * logits[index] + intercept) - labels[index];
      slopeGradient += error * logits[index];
      interceptGradient += error;
    }
    const rate = 0.03 / logits.length;
    slope -= rate * (slopeGradient + 0.02 * (slope - 1));
    intercept -= rate * interceptGradient;
  }
  return { slope, intercept };
}

export function assessSignalModel(entries: SignalJournalEntry[], candidate: SignalModelInput): SignalModelAssessment {
  // Use journal time order for separate training, calibration, and forward-test sets.
  const chronological = entries
    .filter(
      (entry) =>
        entry.group === "fx" &&
        (entry.outcome === "win" || entry.outcome === "loss") &&
        featuresOf(entry) !== null,
    )
    .sort((a, b) => a.startedAt - b.startedAt)
    .map((entry) => ({
      features: featuresOf(entry)!,
      label: entry.outcome === "win" ? (1 as const) : (0 as const),
    }));

  const sampleCount = chronological.length;
  const trainCount = Math.floor(sampleCount * 0.7);
  const calibrationEnd = Math.floor(sampleCount * 0.85);
  const training = chronological.slice(0, trainCount);
  const calibrationSet = chronological.slice(trainCount, calibrationEnd);
  const validation = chronological.slice(calibrationEnd);
  const collecting = (): SignalModelAssessment => ({
    status: "collecting",
    reason: "sample-count",
    sampleCount,
    minimumSamples: MIN_MODEL_SAMPLES,
    validationCount: validation.length,
  });
  if (sampleCount < MIN_MODEL_SAMPLES) return collecting();

  const trainingWins = training.filter((example) => example.label === 1).length;
  const calibrationWins = calibrationSet.filter((example) => example.label === 1).length;
  const validationWins = validation.filter((example) => example.label === 1).length;
  if (
    trainingWins < 25 ||
    training.length - trainingWins < 25 ||
    calibrationWins < 5 ||
    calibrationSet.length - calibrationWins < 5 ||
    validationWins < 5 ||
    validation.length - validationWins < 5
  ) {
    return { ...collecting(), reason: "class-balance" };
  }

  const model = fitLogistic(training);
  const calibrationLogits = calibrationSet.map((example) => logit(model, example.features));
  const calibration = fitCalibration(calibrationLogits, calibrationSet.map((example) => example.label));
  const validationLogits = validation.map((example) => logit(model, example.features));
  const probabilities = validationLogits.map((value) => sigmoid(calibration.slope * value + calibration.intercept));
  const baseRate = calibrationWins / calibrationSet.length;
  const brierScore =
    probabilities.reduce((sum, value, index) => sum + (value - validation[index].label) ** 2, 0) /
    validation.length;
  const baselineBrier =
    validation.reduce((sum, example) => sum + (baseRate - example.label) ** 2, 0) / validation.length;

  if (brierScore >= baselineBrier) {
    return {
      status: "unreliable",
      reason: "no-baseline-edge",
      sampleCount,
      minimumSamples: MIN_MODEL_SAMPLES,
      validationCount: validation.length,
      brierScore,
      baselineBrier,
    };
  }
  const candidateFeatures = featuresOf(candidate);
  if (!candidateFeatures) {
    return {
      status: "unreliable",
      reason: "no-baseline-edge",
      sampleCount,
      minimumSamples: MIN_MODEL_SAMPLES,
      validationCount: validation.length,
      brierScore,
      baselineBrier,
    };
  }
  const probability = sigmoid(calibration.slope * logit(model, candidateFeatures) + calibration.intercept);
  const expectedValue = probability * (candidate.payout / 100) - (1 - probability);
  return {
    status: "ready",
    sampleCount,
    minimumSamples: MIN_MODEL_SAMPLES,
    validationCount: validation.length,
    probability,
    expectedValue,
    brierScore,
    baselineBrier,
  };
}
