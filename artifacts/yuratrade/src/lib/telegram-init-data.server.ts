import { createHmac, timingSafeEqual } from "node:crypto";

const MAX_INIT_DATA_AGE_SECONDS = 24 * 60 * 60;
const MAX_FUTURE_CLOCK_SKEW_SECONDS = 60;

export function validateTelegramInitData(
  raw: string,
  botToken: string,
  nowMilliseconds = Date.now(),
): string | null {
  if (!raw || raw.length > 10_000 || !botToken) return null;

  const values = new Map<string, string>();
  for (const [key, value] of new URLSearchParams(raw).entries()) {
    if (values.has(key)) return null;
    values.set(key, value);
  }

  const suppliedHash = values.get("hash");
  const authDateText = values.get("auth_date");
  const userText = values.get("user");
  if (
    !suppliedHash ||
    !/^[\da-f]{64}$/i.test(suppliedHash) ||
    !authDateText ||
    !userText
  ) {
    return null;
  }

  const authDate = Number(authDateText);
  const now = Math.floor(nowMilliseconds / 1000);
  if (
    !Number.isSafeInteger(authDate) ||
    authDate <= 0 ||
    authDate > now + MAX_FUTURE_CLOCK_SKEW_SECONDS ||
    now - authDate > MAX_INIT_DATA_AGE_SECONDS
  ) {
    return null;
  }

  let telegramUserId: number;
  try {
    const parsed: unknown = JSON.parse(userText);
    if (
      parsed === null ||
      typeof parsed !== "object" ||
      Array.isArray(parsed) ||
      !("id" in parsed) ||
      (typeof parsed.id !== "number" && typeof parsed.id !== "string")
    ) {
      return null;
    }
    telegramUserId = Number(parsed.id);
    if (!Number.isSafeInteger(telegramUserId) || telegramUserId <= 0) return null;
  } catch {
    return null;
  }

  const checkString = [...values.entries()]
    .filter(([key]) => key !== "hash")
    .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secretKey = createHmac("sha256", "WebAppData")
    .update(botToken)
    .digest();
  const expectedHash = createHmac("sha256", secretKey)
    .update(checkString)
    .digest();
  const actualHash = Buffer.from(suppliedHash, "hex");
  if (
    actualHash.length !== expectedHash.length ||
    !timingSafeEqual(actualHash, expectedHash)
  ) {
    return null;
  }

  return String(telegramUserId);
}
