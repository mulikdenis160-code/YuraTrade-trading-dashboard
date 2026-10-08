import assert from "node:assert/strict";
import test from "node:test";
import {
  buildTelegramStartReply,
  isTelegramStartCommand,
  POCKET_OPTION_REFERRAL_URL,
  TELEGRAM_MINI_APP_URL,
} from "./telegram-start.ts";

test("recognizes the private /start command and its optional payload", () => {
  assert.equal(isTelegramStartCommand("/start"), true);
  assert.equal(isTelegramStartCommand("/start campaign"), true);
  assert.equal(isTelegramStartCommand("/start@Signalradikai_bot"), true);
  assert.equal(isTelegramStartCommand("/started"), false);
  assert.equal(isTelegramStartCommand("hello /start"), false);
  assert.equal(isTelegramStartCommand(undefined), false);
});

test("the Russian start reply has partner-registration and Mini App buttons", () => {
  const reply = buildTelegramStartReply("ru");
  assert.match(reply.text, /PRIME BOT/);
  const registrationButton = reply.reply_markup.inline_keyboard[0]?.[0];
  assert.ok(registrationButton && "url" in registrationButton);
  if (registrationButton && "url" in registrationButton) {
    assert.equal(registrationButton.url, POCKET_OPTION_REFERRAL_URL);
  }
  assert.deepEqual(reply.reply_markup.inline_keyboard[1]?.[0], {
    text: "Открыть PRIME BOT",
    web_app: { url: TELEGRAM_MINI_APP_URL },
  });
});

test("the start reply uses Ukrainian and English for matching Telegram locales", () => {
  assert.match(buildTelegramStartReply("uk-UA").text, /Вітаємо/);
  assert.match(buildTelegramStartReply("en-US").text, /Welcome/);
  assert.match(buildTelegramStartReply(undefined).text, /Привет/);
});
