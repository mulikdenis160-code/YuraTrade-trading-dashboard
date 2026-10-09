import assert from "node:assert/strict";
import test from "node:test";
import {
  ALREADY_REGISTERED_CALLBACK_DATA,
  buildTelegramPocketIdPrompt,
  buildTelegramStartReply,
  formatTelegramVerificationReply,
  isTelegramPocketIdPromptReply,
  isTelegramStartCommand,
} from "./telegram-bot.ts";
import { isAdminId } from "./pocket-admin.ts";
import { isTelegramAdminForPocketId } from "./telegram-admin.ts";
import { POCKET_OPTION_REFERRAL_URL } from "./pocket-gate-config.ts";

test("start command detection accepts bot addressing and payloads", () => {
  assert.equal(isTelegramStartCommand("/start"), true);
  assert.equal(isTelegramStartCommand("/start@Signalradikai_bot campaign"), true);
  assert.equal(isTelegramStartCommand("/started"), false);
  assert.equal(isTelegramStartCommand("hello /start"), false);
});

test("start message has registration and already-registered buttons, without Mini App", () => {
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

test("the already-registered button asks for the Pocket Option ID in the user's language", () => {
  assert.match(buildTelegramPocketIdPrompt("ru"), /9-значный/);
  assert.match(buildTelegramPocketIdPrompt("uk"), /9-значний/);
  assert.match(buildTelegramPocketIdPrompt("en"), /9-digit/);
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
    depositAmount: 60,
  }, "ru").text, /Искра.*10 сигналов/s);
  assert.match(formatTelegramVerificationReply({
    status: "verified",
    pocketId: "123456789",
    depositAmount: 200,
  }, "en").text, /Vector.*40 signals/s);
  assert.match(formatTelegramVerificationReply({
    status: "verified",
    pocketId: "123456789",
    depositAmount: 500,
  }, "en").text, /Apex.*unlimited/s);
  assert.match(formatTelegramVerificationReply({
    status: "verified",
    pocketId: "123456789",
    depositAmount: 20,
  }, "ru").text, /первого уровня/);
});

test("configured site and Telegram IDs are admins only for their matching Pocket Option account", () => {
  assert.equal(isAdminId("984367891"), true);
  assert.equal(isTelegramAdminForPocketId("984367891", "984367891"), true);
  assert.equal(isTelegramAdminForPocketId("984367891", "123456789"), false);
  assert.equal(isTelegramAdminForPocketId("123456789", "984367891"), false);
});

test("Telegram admin access is granted only after partner verification", () => {
  assert.match(formatTelegramVerificationReply({
    status: "verified",
    pocketId: "984367891",
    depositAmount: 0,
  }, "ru", "984367891").text, /администратора дневного лимита нет/);
  assert.match(formatTelegramVerificationReply({
    status: "not_registered",
  }, "ru", "984367891").text, /не найдена регистрация/);
});

test("unverified partner states are translated and invalid IDs can be retried", () => {
  assert.equal(formatTelegramVerificationReply({ status: "invalid_id" }, "ru").retryWithId, true);
  assert.match(formatTelegramVerificationReply({ status: "already_linked" }, "en").text, /already linked/);
  assert.match(formatTelegramVerificationReply({ status: "deposit_required" }, "uk").text, /депозит/);
});
