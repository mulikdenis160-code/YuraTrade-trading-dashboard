import { t as isAdminId } from "./pocket-admin-DnzTuOI1.mjs";
import { A as levelForBalance } from "./router-B0F2hKW2.mjs";
import { readTelegramLocale, saveTelegramLocale, verifyLinkedPocketAccountForTelegramUser, verifyPocketAccountForTelegramUser } from "./pocket-gate.server-By8mD9Rm.mjs";
import { createHash, timingSafeEqual } from "node:crypto";
//#region node_modules/.nitro/vite/services/ssr/assets/telegram-bot.server-44bG7GLN.js
var POCKET_OPTION_REFERRAL_URL = "https://po-ru4.click/register?utm_campaign=857649&utm_source=affiliate&utm_medium=sr&a=iRpVNOoIijYLHF&al=1788919&ac=ftd&cid=974710&code=50START";
var ALREADY_REGISTERED_CALLBACK_DATA = "already_registered";
var messages = {
	ru: {
		start: "Привет! Зарегистрируйтесь в Pocket Option по партнёрской ссылке и внесите депозит. Если вы уже зарегистрированы, нажмите кнопку ниже — бот проверит ваш ID и сообщит дневной лимит.",
		register: "Регистрация в Pocket Option",
		alreadyRegistered: "Уже зарегистрирован",
		askId: "Отправьте Pocket Option ID ответом на это сообщение. Обычные ID состоят из 9 цифр; настроенные админ-ID тоже принимаются.",
		invalidId: "Обычный ID должен состоять ровно из 9 цифр. Нажмите «Уже зарегистрирован» и отправьте ID ещё раз.",
		notRegistered: "По этому ID не найдена регистрация через партнёрскую ссылку PRIME BOT. Сначала зарегистрируйтесь по кнопке /start.",
		depositRequired: "Регистрация найдена, но Pocket Option пока не подтвердил депозит. Попробуйте проверить ID позже.",
		alreadyLinked: "Этот Pocket Option ID или Telegram-аккаунт уже связан с другой учётной записью. Изменить привязку здесь нельзя.",
		rateLimited: "Слишком много попыток проверки. Попробуйте снова через час.",
		unavailable: "Не удалось проверить ID сейчас. Попробуйте позже.",
		adminVerified: "Админ-доступ включён. Дневного лимита нет.",
		noLevel: "Pocket Option ID подтверждён и связан. Подтверждённого депозита пока недостаточно для первого уровня, поэтому сигналы пока недоступны.",
		verified: (level, limit) => `Pocket Option ID подтверждён и связан с этим Telegram-аккаунтом.\nУровень: ${level}.\nДневной лимит: ${limit}.`,
		unlimited: "без дневного лимита",
		tierNames: {
			iskra: "Базовый",
			vector: "Профессиональный",
			apex: "Глубокий"
		},
		dailyLimit: (count) => `${count} сигналов`,
		openSignalAI: "Открыть SignalAI",
		chooseLanguage: "Выбрать язык",
		instructions: "Инструкция",
		support: "Поддержка",
		chooseLanguagePrompt: "Выберите язык:",
		languageChanged: "Язык изменён.",
		instructionsText: "Как пользоваться SignalAI:\n1. Нажмите «Открыть SignalAI».\n2. Выберите доступную валютную пару и срок сигнала.\n3. Дождитесь окончания таймера и проверьте актуальные котировки перед входом.\n\nСделки выполняются вручную. Сигналы не гарантируют прибыль — торгуйте ответственно."
	},
	uk: {
		start: "Вітаємо! Зареєструйтеся в Pocket Option за партнерським посиланням і внесіть депозит. Якщо ви вже зареєстровані, натисніть кнопку нижче — бот перевірить ваш ID і повідомить денний ліміт.",
		register: "Реєстрація в Pocket Option",
		alreadyRegistered: "Уже зареєстрований",
		askId: "Надішліть Pocket Option ID у відповідь на це повідомлення. Звичайні ID містять 9 цифр; налаштовані адмін-ID також приймаються.",
		invalidId: "Звичайний ID має містити рівно 9 цифр. Натисніть «Уже зареєстрований» і надішліть ID ще раз.",
		notRegistered: "За цим ID не знайдено реєстрацію за партнерським посиланням PRIME BOT. Спочатку зареєструйтеся кнопкою /start.",
		depositRequired: "Реєстрацію знайдено, але Pocket Option ще не підтвердив депозит. Спробуйте перевірити ID пізніше.",
		alreadyLinked: "Цей Pocket Option ID або Telegram-акаунт уже пов’язаний з іншим обліковим записом. Змінити прив’язку тут не можна.",
		rateLimited: "Забагато спроб перевірки. Спробуйте знову за годину.",
		unavailable: "Зараз не вдалося перевірити ID. Спробуйте пізніше.",
		adminVerified: "Адмін-доступ увімкнено. Денний ліміт не застосовується.",
		noLevel: "Pocket Option ID підтверджено та пов’язано. Підтвердженого депозиту поки недостатньо для першого рівня, тому сигнали ще недоступні.",
		verified: (level, limit) => `Pocket Option ID підтверджено та пов’язано з цим Telegram-акаунтом.\nРівень: ${level}.\nДенний ліміт: ${limit}.`,
		unlimited: "без денного ліміту",
		tierNames: {
			iskra: "Базовий",
			vector: "Професійний",
			apex: "Глибокий"
		},
		dailyLimit: (count) => `${count} сигналів`,
		openSignalAI: "Відкрити SignalAI",
		chooseLanguage: "Обрати мову",
		instructions: "Інструкція",
		support: "Підтримка",
		chooseLanguagePrompt: "Оберіть мову:",
		languageChanged: "Мову змінено.",
		instructionsText: "Як користуватися SignalAI:\n1. Натисніть «Відкрити SignalAI».\n2. Оберіть доступну валютну пару та строк сигналу.\n3. Дочекайтеся завершення таймера й перевірте актуальні котирування перед входом.\n\nУгоди виконуються вручну. Сигнали не гарантують прибуток — торгуйте відповідально."
	},
	en: {
		start: "Welcome! Register with Pocket Option using the partner link and make a deposit. If you are already registered, tap the button below and the bot will verify your ID and show your daily limit.",
		register: "Register with Pocket Option",
		alreadyRegistered: "Already registered",
		askId: "Reply to this message with your Pocket Option ID. Regular IDs have 9 digits; configured admin IDs are accepted too.",
		invalidId: "A regular ID must contain exactly 9 digits. Tap “Already registered” and send it again.",
		notRegistered: "This ID is not registered through PRIME BOT’s partner link. Register using the button in /start first.",
		depositRequired: "The registration was found, but Pocket Option has not confirmed a deposit yet. Try again later.",
		alreadyLinked: "This Pocket Option ID or Telegram account is already linked to another account. The link cannot be changed here.",
		rateLimited: "Too many verification attempts. Try again in an hour.",
		unavailable: "The ID could not be verified right now. Try again later.",
		adminVerified: "Admin access is enabled. There is no daily signal limit.",
		noLevel: "The Pocket Option ID is verified and linked, but the confirmed deposit does not meet the first tier yet, so signals remain unavailable.",
		verified: (level, limit) => `The Pocket Option ID is verified and linked to this Telegram account.\nLevel: ${level}.\nDaily limit: ${limit}.`,
		unlimited: "unlimited",
		tierNames: {
			iskra: "Basic",
			vector: "Professional",
			apex: "Deep"
		},
		dailyLimit: (count) => `${count} signals`,
		openSignalAI: "Open SignalAI",
		chooseLanguage: "Choose language",
		instructions: "Instructions",
		support: "Support",
		chooseLanguagePrompt: "Choose a language:",
		languageChanged: "Language updated.",
		instructionsText: "How to use SignalAI:\n1. Tap “Open SignalAI”.\n2. Choose an available currency pair and signal expiry.\n3. Wait for the timer to finish and check the latest quote before entering.\n\nTrades are placed manually. Signals do not guarantee profit — trade responsibly."
	}
};
var SIGNAL_AI_URL = "https://vlados-trade-trading-dashboard.replit.app/";
var SUPPORT_URL = "https://t.me/vladosprime1";
var TELEGRAM_LANGUAGE_CALLBACK_DATA = "primebot:language";
var TELEGRAM_INSTRUCTIONS_CALLBACK_DATA = "primebot:instructions";
var LOCALE_CALLBACK_PREFIX = "primebot:locale:";
var telegramLocales = [
	"ru",
	"uk",
	"en"
];
function telegramLocale(languageCode) {
	const language = languageCode?.toLowerCase() ?? "";
	if (language.startsWith("uk")) return "uk";
	if (language.startsWith("en")) return "en";
	return "ru";
}
function parseTelegramLocale(value) {
	return typeof value === "string" && telegramLocales.includes(value) ? value : null;
}
function telegramLocaleCallbackData(locale) {
	return `${LOCALE_CALLBACK_PREFIX}${locale}`;
}
function parseTelegramLocaleCallbackData(value) {
	if (typeof value !== "string" || !value.startsWith(LOCALE_CALLBACK_PREFIX)) return null;
	return parseTelegramLocale(value.slice(16));
}
function buildTelegramMainMenuMarkup(languageCode) {
	const copy = messages[telegramLocale(languageCode)];
	return { inline_keyboard: [
		[{
			text: copy.openSignalAI,
			web_app: { url: SIGNAL_AI_URL }
		}],
		[{
			text: copy.chooseLanguage,
			callback_data: TELEGRAM_LANGUAGE_CALLBACK_DATA
		}],
		[{
			text: copy.instructions,
			callback_data: TELEGRAM_INSTRUCTIONS_CALLBACK_DATA
		}],
		[{
			text: copy.support,
			url: SUPPORT_URL
		}]
	] };
}
function buildTelegramLanguagePicker(languageCode) {
	return {
		text: messages[telegramLocale(languageCode)].chooseLanguagePrompt,
		reply_markup: { inline_keyboard: [[
			{
				text: "Русский",
				callback_data: telegramLocaleCallbackData("ru")
			},
			{
				text: "Українська",
				callback_data: telegramLocaleCallbackData("uk")
			},
			{
				text: "English",
				callback_data: telegramLocaleCallbackData("en")
			}
		]] }
	};
}
function buildTelegramInstructions(languageCode) {
	return messages[telegramLocale(languageCode)].instructionsText;
}
function buildTelegramLanguageChanged(languageCode) {
	return messages[telegramLocale(languageCode)].languageChanged;
}
function isTelegramStartCommand(text) {
	return typeof text === "string" && /^\/start(?:@[a-z0-9_]+)?(?:\s|$)/i.test(text.trim());
}
function buildTelegramStartReply(languageCode) {
	const copy = messages[telegramLocale(languageCode)];
	return {
		text: copy.start,
		reply_markup: { inline_keyboard: [[{
			text: copy.register,
			url: POCKET_OPTION_REFERRAL_URL
		}], [{
			text: copy.alreadyRegistered,
			callback_data: ALREADY_REGISTERED_CALLBACK_DATA
		}]] }
	};
}
function buildTelegramPocketIdPrompt(languageCode) {
	return messages[telegramLocale(languageCode)].askId;
}
function isTelegramPocketIdPromptReply(replyTo) {
	return replyTo?.from?.is_bot === true && Object.values(messages).some((copy) => copy.askId === replyTo.text);
}
function formatTelegramVerificationReply(result, languageCode, telegramUserId) {
	const copy = messages[telegramLocale(languageCode)];
	if (result.status !== "verified") return {
		text: {
			invalid_id: copy.invalidId,
			not_registered: copy.notRegistered,
			deposit_required: copy.depositRequired,
			already_linked: copy.alreadyLinked,
			telegram_required: copy.unavailable,
			rate_limited: copy.rateLimited,
			check_unavailable: copy.unavailable
		}[result.status],
		retryWithId: result.status === "invalid_id"
	};
	if (isAdminId(result.pocketId)) return {
		text: copy.adminVerified,
		retryWithId: false
	};
	const level = levelForBalance(result.depositAmount);
	if (!level) return {
		text: copy.noLevel,
		retryWithId: false
	};
	const levelName = copy.tierNames[level.id];
	const limit = level.daily === null ? copy.unlimited : copy.dailyLimit(level.daily);
	return {
		text: copy.verified(levelName, limit),
		retryWithId: false
	};
}
function expectedWebhookSecret() {
	const sessionSecret = process.env["SESSION_SECRET"];
	if (!sessionSecret) return null;
	return createHash("sha256").update("prime-bot:telegram-webhook:v1:").update(sessionSecret).digest("hex");
}
function hasValidWebhookSecret(received) {
	const expected = expectedWebhookSecret();
	if (!expected || !received) return false;
	const receivedBytes = Buffer.from(received, "utf8");
	const expectedBytes = Buffer.from(expected, "utf8");
	return receivedBytes.length === expectedBytes.length && timingSafeEqual(receivedBytes, expectedBytes);
}
async function telegramRequest(method, body) {
	const token = process.env["TELEGRAM_BOT_TOKEN"]?.trim();
	if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not configured");
	let response;
	try {
		response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body)
		});
	} catch {
		throw new Error(`Telegram ${method} request failed before a response`);
	}
	let payload;
	try {
		payload = await response.json();
	} catch {
		throw new Error(`Telegram ${method} returned an invalid response (${response.status})`);
	}
	if (!response.ok || !payload.ok) throw new Error(`Telegram ${method} failed (${response.status})`);
	return payload.result;
}
async function sendTelegramMessage(chatId, text, replyMarkup) {
	await telegramRequest("sendMessage", {
		chat_id: chatId,
		text,
		...replyMarkup ? { reply_markup: replyMarkup } : {}
	});
}
function isValidChatId(value) {
	return typeof value === "number" && Number.isSafeInteger(value) || typeof value === "string" && /^-?\d+$/.test(value);
}
async function handleCallbackQuery(callback) {
	if (typeof callback.id !== "string") return;
	await telegramRequest("answerCallbackQuery", { callback_query_id: callback.id });
	const chat = callback.message?.chat;
	const telegramUserId = callback.from?.id;
	if (chat?.type !== "private" || !isValidChatId(chat.id) || typeof telegramUserId !== "number" || !Number.isSafeInteger(telegramUserId)) return;
	const data = callback.data;
	if (data === "already_registered") {
		await sendTelegramMessage(chat.id, buildTelegramPocketIdPrompt(callback.from?.language_code), {
			force_reply: true,
			input_field_placeholder: "123456789"
		});
		return;
	}
	const chosenLocale = parseTelegramLocaleCallbackData(data);
	if (!(data === "primebot:language" || data === "primebot:instructions" || chosenLocale !== null)) return;
	const verification = await verifyLinkedPocketAccountForTelegramUser(String(telegramUserId));
	const locale = await readTelegramLocale(String(telegramUserId)) ?? telegramLocale(callback.from?.language_code);
	if (verification.status !== "verified") {
		const reply = formatTelegramVerificationReply(verification, locale, telegramUserId);
		const start = buildTelegramStartReply(locale);
		await sendTelegramMessage(chat.id, reply.text, start.reply_markup);
		return;
	}
	if (chosenLocale) {
		await saveTelegramLocale(String(telegramUserId), chosenLocale);
		await sendTelegramMessage(chat.id, buildTelegramLanguageChanged(chosenLocale), buildTelegramMainMenuMarkup(chosenLocale));
		return;
	}
	if (data === "primebot:language") {
		const picker = buildTelegramLanguagePicker(locale);
		await sendTelegramMessage(chat.id, picker.text, picker.reply_markup);
		return;
	}
	await sendTelegramMessage(chat.id, buildTelegramInstructions(locale), buildTelegramMainMenuMarkup(locale));
}
async function handleMessage(message) {
	const chat = message.chat;
	if (chat?.type !== "private" || !isValidChatId(chat.id)) return;
	if (isTelegramStartCommand(message.text)) {
		const telegramUserId = message.from?.id;
		if (typeof telegramUserId === "number" && Number.isSafeInteger(telegramUserId)) {
			const verification = await verifyLinkedPocketAccountForTelegramUser(String(telegramUserId));
			if (verification.status === "verified") {
				const locale = await readTelegramLocale(String(telegramUserId)) ?? telegramLocale(message.from?.language_code);
				const reply = formatTelegramVerificationReply(verification, locale, telegramUserId);
				await sendTelegramMessage(chat.id, reply.text, buildTelegramMainMenuMarkup(locale));
				return;
			}
		}
		const reply = buildTelegramStartReply(message.from?.language_code);
		await sendTelegramMessage(chat.id, reply.text, reply.reply_markup);
		return;
	}
	if (!isTelegramPocketIdPromptReply(message.reply_to_message) || typeof message.text !== "string" || typeof message.from?.id !== "number" || !Number.isSafeInteger(message.from.id)) return;
	const result = await verifyPocketAccountForTelegramUser(message.text.trim(), String(message.from.id));
	const reply = formatTelegramVerificationReply(result, message.from.language_code, message.from.id);
	const locale = await readTelegramLocale(String(message.from.id)) ?? telegramLocale(message.from.language_code);
	await sendTelegramMessage(chat.id, reply.text, result.status === "verified" ? buildTelegramMainMenuMarkup(locale) : void 0);
	if (reply.retryWithId) await sendTelegramMessage(chat.id, buildTelegramPocketIdPrompt(message.from.language_code), {
		force_reply: true,
		input_field_placeholder: "123456789"
	});
}
async function handleTelegramWebhook(request) {
	if (!hasValidWebhookSecret(request.headers.get("x-telegram-bot-api-secret-token"))) return new Response("unauthorized", { status: 401 });
	let update;
	try {
		update = await request.json();
	} catch {
		return new Response("invalid Telegram update", { status: 400 });
	}
	if (update.callback_query) await handleCallbackQuery(update.callback_query);
	else if (update.message) await handleMessage(update.message);
	return new Response("ok", { status: 200 });
}
//#endregion
export { handleTelegramWebhook };
