export const MIN_RULE_SCORE = 0.22;

export function assessSignalQuality(score: number, slopeScore: number, bodyScore: number) {
  const qualityScore = Number.isFinite(score) ? Math.abs(score) : 0;
  const trendDirection = Math.sign(slopeScore);
  const candleDirection = Math.sign(bodyScore);
  const agrees = trendDirection !== 0 && trendDirection === candleDirection;

  return {
    qualityScore,
    agrees,
    eligible: agrees && qualityScore >= MIN_RULE_SCORE,
  };
}