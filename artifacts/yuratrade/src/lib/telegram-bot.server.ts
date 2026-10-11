import { createHash, timingSafeEqual } from "node:crypto";
import {
  readTelegramLocale,
  saveTelegramLocale,
  verifyLinkedPocketAccountForTelegramUser,
  verifyPocketAccountForTelegramUser,
} from "./pocket-gate.server";
import {
  ALREADY_REGISTERED_CALLBACK_DATA,
  buildTelegramInstructions,
  buildTelegramLanguageChanged,
  buildTelegramLanguagePicker,
  buildTelegramMainMenuMarkup,
  buildTelegramPocketIdPrompt,
  buildTelegramStartReply,
  formatTelegramVerificationReply,
  isTelegramPocketIdPromptReply,
  isTelegramStartCommand,
  parseTelegramLocaleCallbackData,
  telegramLocale,
  TELEGRAM_INSTRUCTIONS_CALLBACK_DATA,
  TELEGRAM_LANGUAGE_CALLBACK_DATA,
} from "./telegram-bot";

type TelegramChat = {
  id?: number | string;
  type?: string;
};

type TelegramUser = {
  id?: number;
  language_code?: string;
};

type TelegramMessage = {
  chat?: TelegramChat;
  text?: unknown;
  from?: TelegramUser;
  reply_to_message?: {
    text?: unknown;
    from?: { is_bot?: unknown };
  };
};

type TelegramCallbackQuery = {
  id?: string;
  data?: string;
  from?: TelegramUser;
  message?: TelegramMessage;
};

type TelegramUpdate = {
  message?: TelegramMessage;
  callback_query?: TelegramCallbackQuery;
};

type TelegramApiEnvelope<T> = {
  ok: boolean;
  result?: T;
  description?: string;
};

function expectedWebhookSecret(): string | null {
  const sessionSecret = process.env["SESSION_SECRET"];
  if (!sessionSecret) return null;
  return createHash("sha256")
    .update("prime-bot:telegram-webhook:v1:")
    .update(sessionSecret)
    .digest("hex");
}

function hasValidWebhookSecret(received: string | null): boolean {
  const expected = expectedWebhookSecret();
  if (!expected || !received) return false;
  const receivedBytes = Buffer.from(received, "utf8");
  const expectedBytes = Buffer.from(expected, "utf8");
  return receivedBytes.length === expectedBytes.length &&
    timingSafeEqual(receivedBytes, expectedBytes);
}

async function telegramRequest<T>(
  method: string,
  body: Record<string, unknown>,
): Promise<T> {
  const token = process.env["TELEGRAM_BOT_TOKEN"]?.trim();
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not configured");

  let response: Response;
  try {
    response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
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

async function sendTelegramMessage(
  chatId: number | string,
  text: string,
  replyMarkup?: Record<string, unknown>,
): Promise<void> {
  await telegramRequest("sendMessage", {
    chat_id: chatId,
    text,
    ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
  });
}

function isValidChatId(value: unknown): value is number | string {
  return (
    (typeof value === "number" && Number.isSafeInteger(value)) ||
    (typeof value === "string" && /^-?\d+$/.test(value))
  );
}

async function handleCallbackQuery(callback: TelegramCallbackQuery): Promise<void> {
  if (typeof callback.id !== "string") return;
  await telegramRequest("answerCallbackQuery", {
    callback_query_id: callback.id,
  });

  const chat = callback.message?.chat;
  const telegramUserId = callback.from?.id;
  if (
    chat?.type !== "private" ||
    !isValidChatId(chat.id) ||
    typeof telegramUserId !== "number" ||
    !Number.isSafeInteger(telegramUserId)
  ) {
    return;
  }

  const data = callback.data;
  if (data === ALREADY_REGISTERED_CALLBACK_DATA) {
    await sendTelegramMessage(
      chat.id,
      buildTelegramPocketIdPrompt(callback.from?.language_code),
      {
        force_reply: true,
        input_field_placeholder: "123456789",
      },
    );
    return;
  }

  const chosenLocale = parseTelegramLocaleCallbackData(data);
  const isMenuAction = data === TELEGRAM_LANGUAGE_CALLBACK_DATA ||
    data === TELEGRAM_INSTRUCTIONS_CALLBACK_DATA ||
    chosenLocale !== null;
  if (!isMenuAction) return;

  const verification = await verifyLinkedPocketAccountForTelegramUser(
    String(telegramUserId),
  );
  const locale = await readTelegramLocale(String(telegramUserId)) ??
    telegramLocale(callback.from?.language_code);
  if (verification.status !== "verified") {
    const reply = formatTelegramVerificationReply(
      verification,
      locale,
      telegramUserId,
    );
    const start = buildTelegramStartReply(locale);
    await sendTelegramMessage(chat.id, reply.text, start.reply_markup);
    return;
  }

  if (chosenLocale) {
    await saveTelegramLocale(String(telegramUserId), chosenLocale);
    await sendTelegramMessage(
      chat.id,
      buildTelegramLanguageChanged(chosenLocale),
      buildTelegramMainMenuMarkup(chosenLocale),
    );
    return;
  }

  if (data === TELEGRAM_LANGUAGE_CALLBACK_DATA) {
    const picker = buildTelegramLanguagePicker(locale);
    await sendTelegramMessage(chat.id, picker.text, picker.reply_markup);
    return;
  }

  await sendTelegramMessage(
    chat.id,
    buildTelegramInstructions(locale),
    buildTelegramMainMenuMarkup(locale),
  );
}

async function handleMessage(message: TelegramMessage): Promise<void> {
  const chat = message.chat;
  if (chat?.type !== "private" || !isValidChatId(chat.id)) return;

  if (isTelegramStartCommand(message.text)) {
    const telegramUserId = message.from?.id;
    if (typeof telegramUserId === "number" && Number.isSafeInteger(telegramUserId)) {
      const verification = await verifyLinkedPocketAccountForTelegramUser(
        String(telegramUserId),
      );
      if (verification.status === "verified") {
        const locale = await readTelegramLocale(String(telegramUserId)) ??
          telegramLocale(message.from?.language_code);
        const reply = formatTelegramVerificationReply(
          verification,
          locale,
          telegramUserId,
        );
        await sendTelegramMessage(
          chat.id,
          reply.text,
          buildTelegramMainMenuMarkup(locale),
        );
        return;
      }
    }

    const reply = buildTelegramStartReply(message.from?.language_code);
    await sendTelegramMessage(chat.id, reply.text, reply.reply_markup);
    return;
  }

  if (
    !isTelegramPocketIdPromptReply(message.reply_to_message) ||
    typeof message.text !== "string" ||
    typeof message.from?.id !== "number" ||
    !Number.isSafeInteger(message.from.id)
  ) {
    return;
  }

  const result = await verifyPocketAccountForTelegramUser(
    message.text.trim(),
    String(message.from.id),
  );
  const reply = formatTelegramVerificationReply(
    result,
    message.from.language_code,
    message.from.id,
  );
  const locale = await readTelegramLocale(String(message.from.id)) ??
    telegramLocale(message.from.language_code);
  await sendTelegramMessage(
    chat.id,
    reply.text,
    result.status === "verified"
      ? buildTelegramMainMenuMarkup(locale)
      : undefined,
  );
  if (reply.retryWithId) {
    await sendTelegramMessage(
      chat.id,
      buildTelegramPocketIdPrompt(message.from.language_code),
      {
        force_reply: true,
        input_field_placeholder: "123456789",
      },
    );
  }
}

export async function handleTelegramWebhook(request: Request): Promise<Response> {
  if (!hasValidWebhookSecret(
    request.headers.get("x-telegram-bot-api-secret-token"),
  )) {
    return new Response("unauthorized", { status: 401 });
  }

  let update: TelegramUpdate;
  try {
    update = await request.json() as TelegramUpdate;
  } catch {
    return new Response("invalid Telegram update", { status: 400 });
  }

  if (update.callback_query) {
    await handleCallbackQuery(update.callback_query);
  } else if (update.message) {
    await handleMessage(update.message);
  }

  return new Response("ok", { status: 200 });
}
