import { getSql } from "./db";
import { assertSameSiteRequest } from "./auth/isolation.server";
import { validateTelegramInitData as validateSignedInitData } from "./telegram-init-data.server";
import { parsePocketPartnerStatus } from "./pocket-partner-status";
import { evaluatePocketGateStatus } from "./pocket-gate-policy";
import { telegramAdminBypassForExactPair } from "./telegram-admin";
import type { PocketGateState, PocketGateVerification } from "./pocket-gate";
import type { TelegramLocale } from "./telegram-bot";

const PARTNER_ID = "857649";
const PARTNER_API_URL = "https://pocketpartners.me/api/v1/user-info";
const MAX_ATTEMPTS_PER_WINDOW = 5;
const PARTNER_REQUEST_TIMEOUT_MS = 8_000;

type GateIdentity = { telegramUserId: string; pocketOptionId: string };

function validateTelegramInitData(raw: string): string | null {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  return token ? validateSignedInitData(raw, token) : null;
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
): Promise<PocketGateState> {
  assertSameSiteRequest();
  const telegramUserId = validateTelegramInitData(initData);
  if (!telegramUserId) return { status: "telegram_required" };

  try {
    const pocketId = await readBindingByTelegram(telegramUserId);
    if (!pocketId) return { status: "unverified" };
    const adminBypass = telegramAdminBypassForExactPair(
      telegramUserId,
      pocketId,
    );
    if (adminBypass) return adminBypass;
    const partnerStatus = await readPartnerStatus(pocketId);
    const gate = evaluatePocketGateStatus(partnerStatus, pocketId, telegramUserId);
    if (gate.status === "not_registered") return { status: "unverified" };
    if (gate.status === "deposit_required") return { status: "deposit_required" };
    if (gate.status === "check_unavailable") return { status: "check_unavailable" };
    return { status: "verified", pocketId, depositAmount: gate.depositAmount };
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
               now() - interval '1 hour'
             THEN now()
             ELSE telegram_pocket_gate_attempts.window_started_at
           END,
           attempt_count = CASE
             WHEN telegram_pocket_gate_attempts.window_started_at <=
               now() - interval '1 hour'
             THEN 1
             ELSE telegram_pocket_gate_attempts.attempt_count + 1
           END
     RETURNING attempt_count`,
    [telegramUserId],
  );
  return Number(rows[0]?.attempt_count ?? 0);
}

async function readPartnerStatus(pocketOptionId: string) {
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

    if (response.status === 404) {
      return { registered: false, hasDeposit: false, depositAmount: null };
    }
    if (!response.ok) throw new Error("Partner API request failed.");

    const payload = await response.json() as unknown;
    return parsePocketPartnerStatus(payload, pocketOptionId);
  } finally {
    clearTimeout(timeout);
  }
}

async function verifyPocketAccountForTelegramIdentity(
  pocketOptionId: string,
  telegramUserId: string,
): Promise<PocketGateVerification> {
  if (!/^\d{9}$/.test(pocketOptionId)) return { status: "invalid_id" };

  try {
    const adminBypass = telegramAdminBypassForExactPair(
      telegramUserId,
      pocketOptionId,
    );
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
      if (
        existing[0].telegram_user_id !== telegramUserId ||
        existing[0].pocket_option_id !== pocketOptionId
      ) {
        return { status: "already_linked" };
      }
      if (adminBypass) return adminBypass;
      const partnerStatus = await readPartnerStatus(pocketOptionId);
      const gate = evaluatePocketGateStatus(partnerStatus, pocketOptionId, telegramUserId);
      if (gate.status !== "verified") return gate;
      return { status: "verified", pocketId: pocketOptionId, depositAmount: gate.depositAmount };
    }

    if (adminBypass) {
      const inserted = await sql.query<{ telegram_user_id: string }>(
        `INSERT INTO telegram_pocket_bindings (telegram_user_id, pocket_option_id)
         VALUES ($1, $2)
         ON CONFLICT DO NOTHING
         RETURNING telegram_user_id`,
        [telegramUserId, pocketOptionId],
      );
      if (inserted.length > 0) return adminBypass;

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
        ? adminBypass
        : { status: "already_linked" };
    }

    if (await incrementAttemptCount(telegramUserId) > MAX_ATTEMPTS_PER_WINDOW) {
      return { status: "rate_limited" };
    }

    const partnerStatus = await readPartnerStatus(pocketOptionId);
    const gate = evaluatePocketGateStatus(partnerStatus, pocketOptionId, telegramUserId);
    if (gate.status !== "verified") return gate;

    const inserted = await sql.query<{ telegram_user_id: string }>(
      `INSERT INTO telegram_pocket_bindings (telegram_user_id, pocket_option_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING
       RETURNING telegram_user_id`,
      [telegramUserId, pocketOptionId],
    );
    if (inserted.length > 0) {
      return { status: "verified", pocketId: pocketOptionId, depositAmount: gate.depositAmount };
    }

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
      ? { status: "verified", pocketId: pocketOptionId, depositAmount: gate.depositAmount }
      : { status: "already_linked" };
  } catch {
    return { status: "check_unavailable" };
  }
}

export async function verifyPocketAccountForTelegram(
  pocketOptionId: string,
  initData: string,
): Promise<PocketGateVerification> {
  if (!/^\d{9}$/.test(pocketOptionId)) return { status: "invalid_id" };

  assertSameSiteRequest();
  const telegramUserId = validateTelegramInitData(initData);
  if (!telegramUserId) return { status: "telegram_required" };

  return verifyPocketAccountForTelegramIdentity(pocketOptionId, telegramUserId);
}

export async function verifyPocketAccountForTelegramUser(
  pocketOptionId: string,
  telegramUserId: string,
): Promise<PocketGateVerification> {
  if (!/^\d{9}$/.test(pocketOptionId)) return { status: "invalid_id" };
  if (!/^\d{1,20}$/.test(telegramUserId)) return { status: "telegram_required" };

  return verifyPocketAccountForTelegramIdentity(pocketOptionId, telegramUserId);
}

export async function verifyLinkedPocketAccountForTelegramUser(
  telegramUserId: string,
): Promise<PocketGateVerification> {
  if (!/^\d{1,20}$/.test(telegramUserId)) {
    return { status: "telegram_required" };
  }

  try {
    const pocketOptionId = await readBindingByTelegram(telegramUserId);
    if (!pocketOptionId) return { status: "telegram_required" };
    return verifyPocketAccountForTelegramIdentity(pocketOptionId, telegramUserId);
  } catch {
    return { status: "check_unavailable" };
  }
}

export async function readTelegramLocale(
  telegramUserId: string,
): Promise<TelegramLocale | null> {
  const sql = await getSql();
  const rows = await sql.query<{ locale: string }>(
    "SELECT locale FROM telegram_pocket_bindings WHERE telegram_user_id = $1 LIMIT 1",
    [telegramUserId],
  );
  const locale = rows[0]?.locale;
  return locale === "ru" || locale === "uk" || locale === "en"
    ? locale
    : null;
}

export async function saveTelegramLocale(
  telegramUserId: string,
  locale: TelegramLocale,
): Promise<void> {
  const sql = await getSql();
  const rows = await sql.query<{ telegram_user_id: string }>(
    `UPDATE telegram_pocket_bindings
     SET locale = $1
     WHERE telegram_user_id = $2
     RETURNING telegram_user_id`,
    [locale, telegramUserId],
  );
  if (!rows[0]) {
    throw new Error("Cannot save a Telegram locale without a verified binding.");
  }
}

export async function requireVerifiedPocketAccess(
  initData: string | null | undefined,
): Promise<GateIdentity> {
  assertSameSiteRequest();
  if (!initData) throw new Error("Telegram Mini App authentication is required.");
  const telegramUserId = validateTelegramInitData(initData);
  if (!telegramUserId) throw new Error("Telegram Mini App authentication is invalid or expired.");
  const pocketOptionId = await readBindingByTelegram(telegramUserId);
  if (!pocketOptionId) throw new Error("Pocket Option access has not been verified.");
  return { telegramUserId, pocketOptionId };
}
