import { createHmac, timingSafeEqual } from "node:crypto";
import { getSql } from "./db";

const PARTNER_ID = "857649";
const PARTNER_API_URL = "https://pocketpartners.me/api/v1/user-info";
const MAX_INIT_DATA_AGE_SECONDS = 24 * 60 * 60;
const MAX_FUTURE_CLOCK_SKEW_SECONDS = 60;
const ATTEMPT_WINDOW_SECONDS = 60 * 60;
const MAX_ATTEMPTS_PER_WINDOW = 5;
const PARTNER_REQUEST_TIMEOUT_MS = 8_000;

type TelegramUser = { id: number | string };
type PartnerStatus = { registered: boolean; hasDeposit: boolean };
type GateIdentity = { telegramUserId: string; pocketOptionId: string };

function recordOf(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function telegramBotToken(): string {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!token) throw new Error("Telegram server configuration is missing.");
  return token;
}

export function validateTelegramInitData(raw: string): string | null {
  if (!raw || raw.length > 10_000) return null;

  let entries: Array<[string, string]>;
  try {
    entries = [...new URLSearchParams(raw).entries()];
  } catch {
    return null;
  }

  const values = new Map<string, string>();
  for (const [key, value] of entries) {
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
  const now = Math.floor(Date.now() / 1000);
  if (
    !Number.isSafeInteger(authDate) ||
    authDate <= 0 ||
    authDate > now + MAX_FUTURE_CLOCK_SKEW_SECONDS ||
    now - authDate > MAX_INIT_DATA_AGE_SECONDS
  ) {
    return null;
  }

  let telegramUser: TelegramUser;
  try {
    const parsed = JSON.parse(userText) as unknown;
    const user = recordOf(parsed);
    if (!user || (typeof user.id !== "number" && typeof user.id !== "string")) {
      return null;
    }
    const numericId = Number(user.id);
    if (!Number.isSafeInteger(numericId) || numericId <= 0) return null;
    telegramUser = { id: user.id };
  } catch {
    return null;
  }

  const checkString = [...values.entries()]
    .filter(([key]) => key !== "hash")
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  let expectedHash: Buffer;
  try {
    const secretKey = createHmac("sha256", "WebAppData")
      .update(telegramBotToken())
      .digest();
    expectedHash = createHmac("sha256", secretKey).update(checkString).digest();
  } catch {
    return null;
  }

  const actualHash = Buffer.from(suppliedHash, "hex");
  if (actualHash.length !== expectedHash.length || !timingSafeEqual(actualHash, expectedHash)) {
    return null;
  }

  return String(telegramUser.id);
}

async function readBindingByTelegram(telegramUserId: string) {
  const sql = await getSql();
  const rows = await sql.query<{ pocket_option_id: string }>(
    "SELECT pocket_option_id FROM telegram_pocket_bindings WHERE telegram_user_id = $1 LIMIT 1",
    [telegramUserId],
  );
  return rows[0]?.pocket_option_id ?? null;
}

export async function getPocketGateStateForTelegram(
  initData: string,
): Promise<
  | { status: "verified"; pocketId: string }
  | { status: "unverified" | "telegram_required" | "check_unavailable" }
> {
  const telegramUserId = validateTelegramInitData(initData);
  if (!telegramUserId) return { status: "telegram_required" };

  try {
    const pocketId = await readBindingByTelegram(telegramUserId);
    return pocketId
      ? { status: "verified", pocketId }
      : { status: "unverified" };
  } catch {
    return { status: "check_unavailable" };
  }
}

async function incrementAttemptCount(telegramUserId: string): Promise<number> {
  const sql = await getSql();
  const rows = await sql.query<{ attempt_count: number | string }>(
    `INSERT INTO telegram_pocket_gate_attempts
       (telegram_user_id, window_started_at, attempt_count)
     VALUES ($1, now(), 1)
     ON CONFLICT (telegram_user_id) DO UPDATE
       SET window_started_at = CASE
             WHEN telegram_pocket_gate_attempts.window_started_at <=
               now() - ($2 * interval '1 second')
             THEN now()
             ELSE telegram_pocket_gate_attempts.window_started_at
           END,
           attempt_count = CASE
             WHEN telegram_pocket_gate_attempts.window_started_at <=
               now() - ($2 * interval '1 second')
             THEN 1
             ELSE telegram_pocket_gate_attempts.attempt_count + 1
           END
     RETURNING attempt_count`,
    [telegramUserId, ATTEMPT_WINDOW_SECONDS],
  );
  return Number(rows[0]?.attempt_count ?? 0);
}

function positiveNumber(value: unknown): boolean {
  if (typeof value !== "number" && typeof value !== "string") return false;
  if (typeof value === "string" && value.trim() === "") return false;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0;
}

function partnerRecord(payload: unknown): Record<string, unknown> | null {
  const root = recordOf(payload);
  if (!root) return null;
  return recordOf(root.user) ?? recordOf(root.data) ?? root;
}

async function readPartnerStatus(pocketOptionId: string): Promise<PartnerStatus> {
  const apiKey = process.env.POCKET_OPTION_PARTNER_API_KEY?.trim();
  if (!apiKey) throw new Error("Partner API configuration is missing.");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PARTNER_REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(
      `${PARTNER_API_URL}/${encodeURIComponent(pocketOptionId)}/${PARTNER_ID}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/json",
        },
        signal: controller.signal,
      },
    );

    if (response.status === 404) return { registered: false, hasDeposit: false };
    if (!response.ok) throw new Error("Partner API request failed.");

    const payload = await response.json() as unknown;
    const user = partnerRecord(payload);
    if (!user || !("uid" in user)) {
      throw new Error("Partner API response is missing account identity.");
    }
    if (!("count_deposits" in user) && !("sum_ftd" in user)) {
      throw new Error("Partner API response is missing deposit status.");
    }

    const registered = String(user.uid) === pocketOptionId;
    const hasDeposit =
      positiveNumber(user.count_deposits) || positiveNumber(user.sum_ftd);
    return { registered, hasDeposit };
  } finally {
    clearTimeout(timeout);
  }
}

export async function verifyPocketAccountForTelegram(
  pocketOptionId: string,
  initData: string,
): Promise<
  | "verified"
  | "invalid_id"
  | "not_registered"
  | "deposit_required"
  | "already_linked"
  | "telegram_required"
  | "rate_limited"
  | "check_unavailable"
> {
  if (!/^\d{9}$/.test(pocketOptionId)) return "invalid_id";

  const telegramUserId = validateTelegramInitData(initData);
  if (!telegramUserId) return "telegram_required";

  try {
    const sql = await getSql();
    const existing = await sql.query<{
      telegram_user_id: string;
      pocket_option_id: string;
    }>(
      `SELECT telegram_user_id, pocket_option_id
       FROM telegram_pocket_bindings
       WHERE telegram_user_id = $1 OR pocket_option_id = $2
       LIMIT 1`,
      [telegramUserId, pocketOptionId],
    );
    if (existing[0]) {
      return existing[0].telegram_user_id === telegramUserId &&
        existing[0].pocket_option_id === pocketOptionId
        ? "verified"
        : "already_linked";
    }

    if (await incrementAttemptCount(telegramUserId) > MAX_ATTEMPTS_PER_WINDOW) {
      return "rate_limited";
    }

    const partnerStatus = await readPartnerStatus(pocketOptionId);
    if (!partnerStatus.registered) return "not_registered";
    if (!partnerStatus.hasDeposit) return "deposit_required";

    const inserted = await sql.query<{ telegram_user_id: string }>(
      `INSERT INTO telegram_pocket_bindings (telegram_user_id, pocket_option_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING
       RETURNING telegram_user_id`,
      [telegramUserId, pocketOptionId],
    );
    if (inserted.length > 0) return "verified";

    const conflict = await sql.query<{
      telegram_user_id: string;
      pocket_option_id: string;
    }>(
      `SELECT telegram_user_id, pocket_option_id
       FROM telegram_pocket_bindings
       WHERE telegram_user_id = $1 OR pocket_option_id = $2
       LIMIT 1`,
      [telegramUserId, pocketOptionId],
    );
    return conflict[0]?.telegram_user_id === telegramUserId &&
      conflict[0]?.pocket_option_id === pocketOptionId
      ? "verified"
      : "already_linked";
  } catch {
    return "check_unavailable";
  }
}

export async function requireVerifiedPocketAccess(
  initData: string | null | undefined,
): Promise<GateIdentity> {
  if (!initData) throw new Error("Telegram Mini App authentication is required.");
  const telegramUserId = validateTelegramInitData(initData);
  if (!telegramUserId) throw new Error("Telegram Mini App authentication is invalid or expired.");
  const pocketOptionId = await readBindingByTelegram(telegramUserId);
  if (!pocketOptionId) throw new Error("Pocket Option access has not been verified.");
  return { telegramUserId, pocketOptionId };
}
