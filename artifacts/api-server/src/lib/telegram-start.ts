export const TELEGRAM_WEBHOOK_URL =
  "https://vlados-trade-trading-dashboard.replit.app/api/telegram/webhook";
export const TELEGRAM_MINI_APP_URL =
  "https://vlados-trade-trading-dashboard.replit.app/";
export const POCKET_OPTION_REFERRAL_URL =
  "https://po-ru4.click/register?utm_campaign=857649&utm_source=affiliate&utm_medium=sr&a=iRpVNOoIijYLHF&al=1788919&ac=ftd&cid=974710&code=50START";

type Locale = "ru" | "uk" | "en";

export type TelegramStartReply = {
  text: string;
  reply_markup: {
    inline_keyboard: Array<
      Array<
        | { text: string; url: string }
        | { text: string; web_app: { url: string } }
      >
    >;
  };
};

export function isTelegramStartCommand(text: unknown): text is string {
  return typeof text === "string" &&
    /^\/start(?:@[a-z0-9_]+)?(?:\s|$)/i.test(text.trim());
}

function localeFor(languageCode: string | undefined): Locale {
  const language = languageCode?.toLowerCase() ?? "";
  if (language.startsWith("uk")) return "uk";
  if (language.startsWith("en")) return "en";
  return "ru";
}

export function buildTelegramStartReply(languageCode?: string): TelegramStartReply {
  const locale = localeFor(languageCode);
  const messages: Record<Locale, { text: string; register: string; open: string }> = {
    ru: {
      text: "Привет! Чтобы начать пользоваться PRIME BOT, зарегистрируйтесь в Pocket Option по партнёрской ссылке, внесите депозит и откройте приложение для проверки Pocket Option ID.",
      register: "Регистрация в Pocket Option",
      open: "Открыть PRIME BOT",
    },
    uk: {
      text: "Вітаємо! Щоб почати користуватися PRIME BOT, зареєструйтеся в Pocket Option за партнерським посиланням, внесіть депозит і відкрийте застосунок для перевірки Pocket Option ID.",
      register: "Реєстрація в Pocket Option",
      open: "Відкрити PRIME BOT",
    },
    en: {
      text: "Welcome to PRIME BOT! Register with Pocket Option using the partner link, make a deposit, then open the app to verify your Pocket Option ID.",
      register: "Register with Pocket Option",
      open: "Open PRIME BOT",
    },
  };
  const message = messages[locale];

  return {
    text: message.text,
    reply_markup: {
      inline_keyboard: [
        [{ text: message.register, url: POCKET_OPTION_REFERRAL_URL }],
        [{ text: message.open, web_app: { url: TELEGRAM_MINI_APP_URL } }],
      ],
    },
  };
}
