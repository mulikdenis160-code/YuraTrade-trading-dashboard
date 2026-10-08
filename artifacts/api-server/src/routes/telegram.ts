import { Router, type IRouter } from "express";
import { logger } from "../lib/logger";
import {
  isValidTelegramWebhookSecret,
  sendTelegramStartReply,
} from "../lib/telegram";
import { isTelegramStartCommand } from "../lib/telegram-start";

type TelegramUpdate = {
  message?: {
    text?: unknown;
    chat?: {
      id?: unknown;
      type?: unknown;
    };
    from?: {
      language_code?: unknown;
    };
  };
};

const router: IRouter = Router();

router.post("/telegram/webhook", async (req, res) => {
  if (!isValidTelegramWebhookSecret(req.get("x-telegram-bot-api-secret-token"))) {
    return res.sendStatus(401);
  }

  const update = req.body as TelegramUpdate;
  const message = update?.message;
  if (
    message?.chat?.type !== "private" ||
    !isTelegramStartCommand(message.text)
  ) {
    return res.sendStatus(200);
  }

  const chatId = message.chat.id;
  if (
    (typeof chatId !== "number" || !Number.isSafeInteger(chatId)) &&
    (typeof chatId !== "string" || !/^-?\d+$/.test(chatId))
  ) {
    return res.sendStatus(200);
  }

  try {
    await sendTelegramStartReply(
      chatId as number | string,
      typeof message.from?.language_code === "string"
        ? message.from.language_code
        : undefined,
    );
    return res.sendStatus(200);
  } catch (err) {
    logger.error({ err }, "Telegram /start reply failed");
    return res.sendStatus(502);
  }
});

export default router;
