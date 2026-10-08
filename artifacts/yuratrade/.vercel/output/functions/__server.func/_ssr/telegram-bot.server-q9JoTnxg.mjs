import { A as isAdminId, j as levelForBalance } from "./router-CWkNhyQD.mjs";
import { verifyPocketAccountForTelegramUser } from "./pocket-gate.server-CSH3Pyex.mjs";
import { t as require_connectors_sdk } from "../_libs/replit__connectors-sdk.mjs";
import { createHash, timingSafeEqual } from "node:crypto";
//#region node_modules/.nitro/vite/services/ssr/assets/telegram-bot.server-q9JoTnxg.js
var import_connectors_sdk = require_connectors_sdk();
var POCKET_OPTION_REFERRAL_URL = "https://po-ru4.click/register?utm_campaign=857649&utm_source=affiliate&utm_medium=sr&a=iRpVNOoIijYLHF&al=1788919&ac=ftd&cid=974710&code=50START";
var ALREADY_REGISTERED_CALLBACK_DATA = "already_registered";
var messages = {
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
		tierNames: {
			iskra: "Искра",
			vector: "Вектор",
			apex: "Апекс"
		},
		dailyLimit: (count) => `${count} сигналов`
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
		tierNames: {
			iskra: "Іскра",
			vector: "Вектор",
			apex: "Апекс"
		},
		dailyLimit: (count) => `${count} сигналів`
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
		tierNames: {
			iskra: "Spark",
			vector: "Vector",
			apex: "Apex"
		},
		dailyLimit: (count) => `${count} signals`
	}
};
function telegramLocale(languageCode) {
	const language = languageCode?.toLowerCase() ?? "";
	if (language.startsWith("uk")) return "uk";
	if (language.startsWith("en")) return "en";
	return "ru";
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
function formatTelegramVerificationReply(result, languageCode) {
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
	const response = await new import_connectors_sdk.ReplitConnectors().proxy("telegram", `/${method}`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body)
	});
	const payload = await response.json();
	if (!response.ok || !payload.ok) throw new Error(`Telegram ${method} failed (${response.status}): ${payload.description ?? "request rejected"}`);
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
	if (callback.data !== "already_registered" || callback.message?.chat?.type !== "private" || !isValidChatId(callback.message.chat.id)) return;
	await sendTelegramMessage(callback.message.chat.id, buildTelegramPocketIdPrompt(callback.from?.language_code), {
		force_reply: true,
		input_field_placeholder: "123456789"
	});
}
async function handleMessage(message) {
	const chat = message.chat;
	if (chat?.type !== "private" || !isValidChatId(chat.id)) return;
	if (isTelegramStartCommand(message.text)) {
		const reply = buildTelegramStartReply(message.from?.language_code);
		await sendTelegramMessage(chat.id, reply.text, reply.reply_markup);
		return;
	}
	if (!isTelegramPocketIdPromptReply(message.reply_to_message) || typeof message.text !== "string" || typeof message.from?.id !== "number" || !Number.isSafeInteger(message.from.id)) return;
	const reply = formatTelegramVerificationReply(await verifyPocketAccountForTelegramUser(message.text.trim(), String(message.from.id)), message.from.language_code);
	await sendTelegramMessage(chat.id, reply.text);
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
