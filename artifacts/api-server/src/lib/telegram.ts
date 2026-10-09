import { createHash } from "node:crypto";
import { logger } from "./logger";

const APP_ORIGIN = "https://vlados-trade-trading-dashboard.replit.app";
const TELEGRAM_WEBHOOK_URL = `${APP_ORIGIN}/telegram/webhook`;
const PREVIOUS_TELEGRAM_WEBHOOK_URL = `${APP_ORIGIN}/api/telegram/webhook`;

type TelegramApiEnvelope<T> = {
  ok: boolean;
  result?: T;
  description?: string;
};

type WebhookInfo = {
  url?: string;
};

function webhookSecret(): string | null {
  const sessionSecret = process.env["SESSION_SECRET"];
  if (!sessionSecret) return null;
  return createHash("sha256")
    .update("prime-bot:telegram-webhook:v1:")
    .update(sessionSecret)
    .digest("hex");
}

async function telegramRequest<T>(
  method: string,
  body?: Record<string, unknown>,
): Promise<T> {
  const token = process.env["TELEGRAM_BOT_TOKEN"]?.trim();
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not configured");

  let response: Response;
  try {
    response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: body ? "POST" : "GET",
      ...(body
        ? {
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }
        : {}),
    });
  } catch {
    throw new Error(`Telegram ${method} request failed before a response`);
  }

  let payload: TelegramApiEnvelope<T>;
  try {
    payload = await response.json() as TelegramApiEnvelope<T>;
  } catch {
    throw new Error(
      `Telegram ${method} returned an invalid response (${response.status})`,
    );
  }
  if (!response.ok || !payload.ok) {
    throw new Error(
      `Telegram ${method} failed (${response.status})`,
    );
  }
  return payload.result as T;
}

function webhookOrigin(url: string): string {
  try {
    return new URL(url).origin;
  } catch {
    return "invalid-url";
  }
}

export async function ensureTelegramWebhook(): Promise<void> {
  if (process.env["NODE_ENV"] !== "production") return;
  const secret = webhookSecret();
  if (!secret) {
    logger.error("SESSION_SECRET is unavailable; Telegram webhook was not registered");
    return;
  }

  try {
    const current = await telegramRequest<WebhookInfo>("getWebhookInfo");
    if (
      current.url &&
      current.url !== TELEGRAM_WEBHOOK_URL &&
      current.url !== PREVIOUS_TELEGRAM_WEBHOOK_URL
    ) {
      logger.error(
        { existingWebhookOrigin: webhookOrigin(current.url) },
        "Telegram webhook already points elsewhere; refusing to replace it",
      );
      return;
    }

    await telegramRequest("setWebhook", {
      url: TELEGRAM_WEBHOOK_URL,
      secret_token: secret,
      allowed_updates: ["message", "callback_query"],
      drop_pending_updates: false,
    });
    logger.info(
      { webhookUrl: TELEGRAM_WEBHOOK_URL },
      "Telegram bot webhook registered",
    );
  } catch (err) {
    logger.error({ err }, "Telegram webhook registration failed");
  }
}
