export const MIN_EXPIRY_MINUTES = 1;
export const MAX_EXPIRY_MINUTES = 240;
export const MIN_EXPIRY_SECONDS = MIN_EXPIRY_MINUTES * 60;
export const MAX_EXPIRY_SECONDS = MAX_EXPIRY_MINUTES * 60;
export const ANALYSIS_PERIODS_SECONDS = [60, 180, 300, 900] as const;

export function isValidExpirySeconds(value: number): boolean {
  return (
    Number.isInteger(value) &&
    value >= MIN_EXPIRY_SECONDS &&
    value <= MAX_EXPIRY_SECONDS &&
    value % 60 === 0
  );
}

export function analysisPeriodForExpiry(expirySeconds: number) {
  const expiryMinutes = Math.ceil(expirySeconds / 60);
  if (expiryMinutes <= 5) return 60;
  if (expiryMinutes <= 15) return 180;
  if (expiryMinutes <= 60) return 300;
  return 900;
}

export function lookbackForExpiry(expirySeconds: number, analysisSeconds: number) {
  const barsPerExpiry = expirySeconds / analysisSeconds;
  return Math.max(12, Math.min(28, Math.ceil(barsPerExpiry * 1.5)));
}

export function formatExpiry(seconds: number) {
  const minutes = Math.max(1, Math.round(seconds / 60));
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours === 0) return `${minutes} мин`;
  return remainingMinutes === 0 ? `${hours} ч` : `${hours} ч ${remainingMinutes} мин`;
}