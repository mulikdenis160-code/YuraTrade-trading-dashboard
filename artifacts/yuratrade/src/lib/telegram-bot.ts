import { levelForBalance } from "./levels.ts";
import { isAdminId } from "./pocket-admin.ts";
import { isTelegramAdminForPocketId } from "./telegram-admin.ts";
import { POCKET_OPTION_REFERRAL_URL } from "./pocket-gate-config.ts";
import type { PocketGateVerification } from "./pocket-gate.ts";

export const ALREADY_REGISTERED_CALLBACK_DATA = "already_registered";

type Locale = "ru" | "uk" | "en";

const messages: Record<
  Locale,
  {
    start: string;
    register: string;
    alreadyRegistered: string;
    askId: string;
    invalidId: string;
    notRegistered: string;
    depositRequired: string;
    alreadyLinked: string;
    rateLimited: string;
    unavailable: string;
    adminVerified: string;
    noLevel: string;
    verified: (level: string, limit: string) => string;
    unlimited: string;
    tierNames: Record<"iskra" | "vector" | "apex", string>;
    dailyLimit: (count: number) => string;
  }
> = {
  ru: {
    start: "Привет! Зарегистрируйтесь в Pocket Option по партнёрской ссылке и внесите депозит. Если вы уже зарегистрированы, нажмите кнопку ниже — бот проверит ваш ID и сообщит дневной лимит.",
    register: "Регистрация в Pocket Option",
    alreadyRegistered: "Уже зарегистрирован",
    askId: "Введите 9-значный Pocket Option ID ответом на это сообщение.",
    invalidId: "ID должен состоять ровно из 9 цифр. Нажмите «Уже зарегистрирован» и отправьте ID ещё раз.",
    notRegistered: "По этому ID не найдена регистрация через партнёрскую ссылку PRIME BOT. Сначала зарегистрируйтесь по кнопке /start.",
    depositRequired: "Регистрация найдена, но Pocket Option пока не подтвердил депозит. Попробуйте проверить ID позже.",
    alreadyLinked: "Этот Pocket Option ID или Telegram-аккаунт уже связан с другой учётной записью. Изменить привязку здесь нельзя.",
    rateLimited: "Слишком много попыток проверки. Попробуйте снова через час.",
    unavailable: "Не удалось проверить ID сейчас. Попробуйте позже.",
    adminVerified: "Pocket Option ID подтверждён и связан с этим Telegram-аккаунтом. Для администратора дневного лимита нет.",
    noLevel: "Pocket Option ID подтверждён и связан. Подтверждённого депозита пока недостаточно для первого уровня, поэтому сигналы пока недоступны.",
    verified: (level, limit) => `Pocket Option ID подтверждён и связан с этим Telegram-аккаунтом.\nУровень: ${level}.\nДневной лимит: ${limit}.`,
    unlimited: "без дневного лимита",
    tierNames: { iskra: "Искра", vector: "Вектор", apex: "Апекс" },
    dailyLimit: (count) => `${count} сигналов`,
  },
  uk: {
    start: "Вітаємо! Зареєструйтеся в Pocket Option за партнерським посиланням і внесіть депозит. Якщо ви вже зареєстровані, натисніть кнопку нижче — бот перевірить ваш ID і повідомить денний ліміт.",
    register: "Реєстрація в Pocket Option",
    alreadyRegistered: "Уже зареєстрований",
    askId: "Введіть 9-значний Pocket Option ID у відповідь на це повідомлення.",
    invalidId: "ID має містити рівно 9 цифр. Натисніть «Уже зареєстрований» і надішліть ID ще раз.",
    notRegistered: "За цим ID не знайдено реєстрацію за партнерським посиланням PRIME BOT. Спочатку зареєструйтеся кнопкою /start.",
    depositRequired: "Реєстрацію знайдено, але Pocket Option ще не підтвердив депозит. Спробуйте перевірити ID пізніше.",
    alreadyLinked: "Цей Pocket Option ID або Telegram-акаунт уже пов’язаний з іншим обліковим записом. Змінити прив’язку тут не можна.",
    rateLimited: "Забагато спроб перевірки. Спробуйте знову за годину.",
    unavailable: "Зараз не вдалося перевірити ID. Спробуйте пізніше.",
    adminVerified: "Pocket Option ID підтверджено та пов’язано з цим Telegram-акаунтом. Для адміністратора денного ліміту немає.",
    noLevel: "Pocket Option ID підтверджено та пов’язано. Підтвердженого депозиту поки недостатньо для першого рівня, тому сигнали ще недоступні.",
    verified: (level, limit) => `Pocket Option ID підтверджено та пов’язано з цим Telegram-акаунтом.\nРівень: ${level}.\nДенний ліміт: ${limit}.`,
    unlimited: "без денного ліміту",
    tierNames: { iskra: "Іскра", vector: "Вектор", apex: "Апекс" },
    dailyLimit: (count) => `${count} сигналів`,
  },
  en: {
    start: "Welcome! Register with Pocket Option using the partner link and make a deposit. If you are already registered, tap the button below and the bot will verify your ID and show your daily limit.",
    register: "Register with Pocket Option",
    alreadyRegistered: "Already registered",
    askId: "Reply to this message with your 9-digit Pocket Option ID.",
    invalidId: "The ID must contain exactly 9 digits. Tap “Already registered” and send it again.",
    notRegistered: "This ID is not registered through PRIME BOT’s partner link. Register using the button in /start first.",
    depositRequired: "The registration was found, but Pocket Option has not confirmed a deposit yet. Try again later.",
    alreadyLinked: "This Pocket Option ID or Telegram account is already linked to another account. The link cannot be changed here.",
    rateLimited: "Too many verification attempts. Try again in an hour.",
    unavailable: "The ID could not be verified right now. Try again later.",
    adminVerified: "The Pocket Option ID is verified and linked to this Telegram account. Admin access has no daily limit.",
    noLevel: "The Pocket Option ID is verified and linked, but the confirmed deposit does not meet the first tier yet, so signals remain unavailable.",
    verified: (level, limit) => `The Pocket Option ID is verified and linked to this Telegram account.\nLevel: ${level}.\nDaily limit: ${limit}.`,
    unlimited: "unlimited",
    tierNames: { iskra: "Spark", vector: "Vector", apex: "Apex" },
    dailyLimit: (count) => `${count} signals`,
  },
};

export function telegramLocale(languageCode?: string): Locale {
  const language = languageCode?.toLowerCase() ?? "";
  if (language.startsWith("uk")) return "uk";
  if (language.startsWith("en")) return "en";
  return "ru";
}

export function isTelegramStartCommand(text: unknown): text is string {
  return typeof text === "string" &&
    /^\/start(?:@[a-z0-9_]+)?(?:\s|$)/i.test(text.trim());
}

export function buildTelegramStartReply(languageCode?: string) {
  const copy = messages[telegramLocale(languageCode)];
  return {
    text: copy.start,
    reply_markup: {
      inline_keyboard: [
        [{ text: copy.register, url: POCKET_OPTION_REFERRAL_URL }],
        [{
          text: copy.alreadyRegistered,
          callback_data: ALREADY_REGISTERED_CALLBACK_DATA,
        }],
      ],
    },
  };
}

export function buildTelegramPocketIdPrompt(languageCode?: string) {
  return messages[telegramLocale(languageCode)].askId;
}

export function isTelegramPocketIdPromptReply(
  replyTo: { text?: unknown; from?: { is_bot?: unknown } } | undefined,
): boolean {
  return replyTo?.from?.is_bot === true &&
    Object.values(messages).some((copy) => copy.askId === replyTo.text);
}

export function formatTelegramVerificationReply(
  result: PocketGateVerification,
  languageCode?: string,
  telegramUserId?: number | string | null,
): { text: string; retryWithId: boolean } {
  const locale = telegramLocale(languageCode);
  const copy = messages[locale];
  if (result.status !== "verified") {
    const responses: Record<
      Exclude<PocketGateVerification["status"], "verified">,
      string
    > = {
      invalid_id: copy.invalidId,
      not_registered: copy.notRegistered,
      deposit_required: copy.depositRequired,
      already_linked: copy.alreadyLinked,
      telegram_required: copy.unavailable,
      rate_limited: copy.rateLimited,
      check_unavailable: copy.unavailable,
    };
    return {
      text: responses[result.status],
      retryWithId: result.status === "invalid_id",
    };
  }

  if (
    isAdminId(result.pocketId) ||
    isTelegramAdminForPocketId(telegramUserId, result.pocketId)
  ) {
    return { text: copy.adminVerified, retryWithId: false };
  }

  const level = levelForBalance(result.depositAmount);
  if (!level) return { text: copy.noLevel, retryWithId: false };

  const levelName = copy.tierNames[level.id];
  const limit = level.daily === null
    ? copy.unlimited
    : copy.dailyLimit(level.daily);
  return {
    text: copy.verified(levelName, limit),
    retryWithId: false,
  };
}
