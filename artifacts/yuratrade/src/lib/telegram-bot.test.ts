import assert from "node:assert/strict";
import test from "node:test";
import {
  ALREADY_REGISTERED_CALLBACK_DATA,
  buildTelegramInstructions,
  buildTelegramLanguagePicker,
  buildTelegramMainMenuMarkup,
  buildTelegramPocketIdPrompt,
  buildTelegramStartReply,
  formatTelegramVerificationReply,
  isTelegramPocketIdPromptReply,
  isTelegramStartCommand,
  parseTelegramLocale,
  parseTelegramLocaleCallbackData,
  TELEGRAM_INSTRUCTIONS_CALLBACK_DATA,
  TELEGRAM_LANGUAGE_CALLBACK_DATA,
  telegramLocaleCallbackData,
} from "./telegram-bot.ts";
import { isAdminId, isValidPocketOptionId } from "./pocket-admin.ts";
import {
  telegramAdminBypassForPocketId,
} from "./telegram-admin.ts";
import { POCKET_OPTION_REFERRAL_URL } from "./pocket-gate-config.ts";

test("start command detection accepts bot addressing and payloads", () => {
  assert.equal(isTelegramStartCommand("/start"), true);
  assert.equal(isTelegramStartCommand("/start@Signalradikai_bot campaign"), true);
  assert.equal(isTelegramStartCommand("/started"), false);
  assert.equal(isTelegramStartCommand("hello /start"), false);
});

test("start message has registration and already-registered buttons, without Mini App", () => {
  assert.equal(
    POCKET_OPTION_REFERRAL_URL,
    "https://po-ru4.click/register?utm_campaign=857649&utm_source=affiliate&utm_medium=sr&a=iRpVNOoIijYLHF&al=1802408&ac=youtube&cid=985161",
  );
  const reply = buildTelegramStartReply("ru");
  assert.deepEqual(reply.reply_markup.inline_keyboard, [
    [{ text: "Регистрация в Pocket Option", url: POCKET_OPTION_REFERRAL_URL }],
    [{
      text: "Уже зарегистрирован",
      callback_data: ALREADY_REGISTERED_CALLBACK_DATA,
    }],
  ]);
  assert.equal(JSON.stringify(reply).includes("web_app"), false);
});

test("verified-user menu has localized actions and the configured destinations", () => {
  const reply = buildTelegramMainMenuMarkup("uk");
  assert.deepEqual(
    reply.inline_keyboard.map((row) => row[0]?.text),
    ["Відкрити SignalAI", "Обрати мову", "Інструкція", "Підтримка"],
  );
  const openButton = reply.inline_keyboard[0]?.[0];
  assert.ok(openButton && "web_app" in openButton);
  assert.equal(openButton.web_app.url, "https://vlados-trade-trading-dashboard.replit.app/");
  const languageButton = reply.inline_keyboard[1]?.[0];
  assert.ok(languageButton && "callback_data" in languageButton);
  assert.equal(languageButton.callback_data, TELEGRAM_LANGUAGE_CALLBACK_DATA);
  const instructionsButton = reply.inline_keyboard[2]?.[0];
  assert.ok(instructionsButton && "callback_data" in instructionsButton);
  assert.equal(instructionsButton.callback_data, TELEGRAM_INSTRUCTIONS_CALLBACK_DATA);
  const supportButton = reply.inline_keyboard[3]?.[0];
  assert.ok(supportButton && "url" in supportButton);
  assert.equal(supportButton.url, "https://t.me/vladosprime1");
  assert.equal(buildTelegramMainMenuMarkup("en").inline_keyboard[0]?.[0]?.text, "Open SignalAI");
  assert.equal(buildTelegramMainMenuMarkup("ru").inline_keyboard[1]?.[0]?.text, "Выбрать язык");
});

test("language picker accepts only supported locales and exposes localized instructions", () => {
  const picker = buildTelegramLanguagePicker("en");
  assert.equal(picker.text, "Choose a language:");
  assert.deepEqual(
    picker.reply_markup.inline_keyboard[0]?.map((button) => button.callback_data),
    [
      telegramLocaleCallbackData("ru"),
      telegramLocaleCallbackData("uk"),
      telegramLocaleCallbackData("en"),
    ],
  );
  assert.equal(parseTelegramLocale("uk"), "uk");
  assert.equal(parseTelegramLocale("fr"), null);
  assert.equal(parseTelegramLocaleCallbackData("primebot:locale:en"), "en");
  assert.equal(parseTelegramLocaleCallbackData("primebot:locale:admin"), null);
  assert.match(buildTelegramInstructions("uk"), /торгуйте відповідально/);
});

test("the already-registered button asks for the Pocket Option ID in the user's language", () => {
  assert.match(buildTelegramPocketIdPrompt("ru"), /админ-ID/);
  assert.match(buildTelegramPocketIdPrompt("uk"), /адмін-ID/);
  assert.match(buildTelegramPocketIdPrompt("en"), /admin IDs/);
  assert.equal(isTelegramPocketIdPromptReply({
    text: buildTelegramPocketIdPrompt("en"),
    from: { is_bot: true },
  }), true);
  assert.equal(isTelegramPocketIdPromptReply({
    text: "Any bot message",
    from: { is_bot: true },
  }), false);
});

test("verification replies report the same tier limits as the website", () => {
  assert.match(formatTelegramVerificationReply({
    status: "verified",
    pocketId: "123456789",
    depositAmount: 50,
  }, "ru").text, /Базовый.*10 сигналов/s);
  assert.match(formatTelegramVerificationReply({
    status: "verified",
    pocketId: "123456789",
    depositAmount: 60,
  }, "ru").text, /Базовый.*10 сигналов/s);
  assert.match(formatTelegramVerificationReply({
    status: "verified",
    pocketId: "123456789",
    depositAmount: 150,
  }, "en").text, /Professional.*40 signals/s);
  assert.match(formatTelegramVerificationReply({
    status: "verified",
    pocketId: "123456789",
    depositAmount: 400,
  }, "en").text, /Deep.*unlimited/s);
  assert.match(formatTelegramVerificationReply({
    status: "verified",
    pocketId: "123456789",
    depositAmount: 50,
    tierGrantId: "apex",
  }, "en").text, /Deep.*unlimited/s);
  assert.match(formatTelegramVerificationReply({
    status: "verified",
    pocketId: "123456789",
    depositAmount: 20,
  }, "ru").text, /депозит от \$50/);
});

test("configured admin IDs bypass verification when entered in Telegram", () => {
  assert.equal(isAdminId("984367891"), true);
  assert.equal(isAdminId("987651256"), true);
  for (const pocketId of ["113510708", "92535291", "984367891", "987651256"]) {
    assert.equal(isValidPocketOptionId(pocketId), true);
    assert.deepEqual(
      telegramAdminBypassForPocketId(pocketId),
      { status: "verified", pocketId, depositAmount: 0 },
    );
  }
  assert.equal(isValidPocketOptionId("12345678"), false);
  assert.equal(telegramAdminBypassForPocketId("123456789"), null);
});

test("admin verification is independent of partner registration and deposit results", () => {
  assert.deepEqual(
    telegramAdminBypassForPocketId("984367891"),
    { status: "verified", pocketId: "984367891", depositAmount: 0 },
  );
  assert.match(formatTelegramVerificationReply({
    status: "verified",
    pocketId: "984367891",
    depositAmount: 0,
  }, "ru", "984367891").text, /Админ-доступ включён.*Дневного лимита нет/s);
  assert.match(formatTelegramVerificationReply({
    status: "not_registered",
  }, "ru", "984367891").text, /не найдена регистрация/);
});

test("unverified partner states are translated and invalid IDs can be retried", () => {
  assert.equal(formatTelegramVerificationReply({ status: "invalid_id" }, "ru").retryWithId, true);
  assert.match(formatTelegramVerificationReply({ status: "already_linked" }, "en").text, /already linked/);
  assert.match(formatTelegramVerificationReply({ status: "deposit_required" }, "uk").text, /депозит/);
});
