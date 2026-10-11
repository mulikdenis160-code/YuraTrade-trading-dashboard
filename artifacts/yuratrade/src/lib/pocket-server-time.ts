const MAX_SERVER_CLOCK_OFFSET_SECONDS = 14 * 60 * 60;

export function estimatePocketServerClockOffsetSeconds(
  rawServerTime: number,
  receivedAtMs: number,
): number | null {
  if (!Number.isFinite(rawServerTime) || rawServerTime <= 0 || !Number.isFinite(receivedAtMs)) {
    return null;
  }
  const serverTimeSeconds = rawServerTime >= 1_000_000_000_000
    ? rawServerTime / 1000
    : rawServerTime;
  const offsetSeconds = serverTimeSeconds - receivedAtMs / 1000;
  if (Math.abs(offsetSeconds) > MAX_SERVER_CLOCK_OFFSET_SECONDS) return null;
  return Math.round(offsetSeconds);
}

export function pocketHistoryRequestTime(
  nowMs: number,
  serverClockOffsetSeconds: number,
  periodSeconds: number,
): number {
  if (
    !Number.isFinite(nowMs) ||
    !Number.isFinite(serverClockOffsetSeconds) ||
    !Number.isInteger(periodSeconds) ||
    periodSeconds <= 0
  ) {
    throw new Error("Некорректное время для запроса истории Pocket Option.");
  }
  const serverTimeSeconds = nowMs / 1000 + serverClockOffsetSeconds;
  return Math.floor(serverTimeSeconds / periodSeconds) * periodSeconds;
}
