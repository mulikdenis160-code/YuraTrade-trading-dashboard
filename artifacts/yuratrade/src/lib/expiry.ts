import { SIGNAL_CANDLE_SECONDS } from "./signal-config.ts";

export const MIN_EXPIRY_MINUTES = 1;
export const MAX_EXPIRY_MINUTES = 240;
export const MIN_EXPIRY_SECONDS = MIN_EXPIRY_MINUTES * 60;
export const MAX_EXPIRY_SECONDS = MAX_EXPIRY_MINUTES * 60;

export const ANALYSIS_PERIODS_SECONDS = [SIGNAL_CANDLE_SECONDS, 300, 900] as const;
export const EXPIRY_OPTIONS_MINUTES = [1, 2, 3, 5, 10, 15, 25, 30, 60, 120, 180, 240] as const;
export const EXPIRY_OPTIONS_SECONDS = [
  30,
  ...EXPIRY_OPTIONS_MINUTES.map((minutes) => minutes * 60),
] as const;

export function alternativeExpiryMinutes(currentMinutes: number) {
  const currentPeriod = analysisPeriodForExpiry(currentMinutes * 60);
  const otherOptions = [...EXPIRY_OPTIONS_MINUTES]
    .filter((minutes) => minutes !== currentMinutes)
    .sort((a, b) => Math.abs(a - currentMinutes) - Math.abs(b - currentMinutes) || a - b);
  const samePeriod = otherOptions.find(
    (minutes) => analysisPeriodForExpiry(minutes * 60) === currentPeriod,
  );
  const differentPeriod = otherOptions.find(
    (minutes) => analysisPeriodForExpiry(minutes * 60) !== currentPeriod,
  );

  const alternatives: number[] = [];
  if (samePeriod !== undefined) alternatives.push(samePeriod);
  if (differentPeriod !== undefined && differentPeriod !== samePeriod) alternatives.push(differentPeriod);
  return alternatives;
}

export function isValidExpirySeconds(value: number): boolean {
  return (
    Number.isInteger(value) &&
    (value === 30 || value >= MIN_EXPIRY_SECONDS) &&
    value <= MAX_EXPIRY_SECONDS &&
    (value === 30 || value % 60 === 0)
  );
}

export function analysisPeriodForExpiry(expirySeconds: number) {
  if (expirySeconds <= 3 * 60) return 60;
  if (expirySeconds <= 30 * 60) return 300;
  return 900;
}

export function lookbackForExpiry(expirySeconds: number, analysisSeconds: number) {
  const barsPerExpiry = expirySeconds / analysisSeconds;
  return Math.max(12, Math.min(28, Math.ceil(barsPerExpiry * 1.5)));
}

export function formatExpiry(seconds: number) {
  if (seconds === 30) return "30 сек";
  const minutes = Math.max(1, Math.round(seconds / 60));
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours === 0) return `${minutes} мин`;
  return remainingMinutes === 0 ? `${hours} ч` : `${hours} ч ${remainingMinutes} мин`;
}