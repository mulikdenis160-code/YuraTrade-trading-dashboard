import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import { validateTelegramInitData } from "./telegram-init-data.server.ts";

const BOT_TOKEN = "test-only-telegram-bot-token";
const NOW_MS = 2_000_000_000_000;

function makeInitData({
  token = BOT_TOKEN,
  authDate = Math.floor(NOW_MS / 1000),
  user = { id: 123456789 },
}: {
  token?: string;
  authDate?: number;
  user?: unknown;
} = {}) {
  const entries: Array<[string, string]> = [
    ["auth_date", String(authDate)],
    ["query_id", "test-query-id"],
    ["user", JSON.stringify(user)],
  ];
  const checkString = [...entries]
    .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
  const secretKey = createHmac("sha256", "WebAppData").update(token).digest();
  const hash = createHmac("sha256", secretKey).update(checkString).digest("hex");
  return new URLSearchParams([...entries, ["hash", hash]]).toString();
}

test("accepts valid, signed Telegram initData and returns its user ID", () => {
  assert.equal(
    validateTelegramInitData(makeInitData(), BOT_TOKEN, NOW_MS),
    "123456789",
  );
});

test("rejects changed data and duplicate fields", () => {
  const valid = makeInitData();
  const tampered = valid.replace("test-query-id", "other-query-id");
  assert.equal(validateTelegramInitData(tampered, BOT_TOKEN, NOW_MS), null);

  const duplicate = `${valid}&auth_date=${Math.floor(NOW_MS / 1000)}`;
  assert.equal(validateTelegramInitData(duplicate, BOT_TOKEN, NOW_MS), null);
  const alteredHash = new URLSearchParams(valid);
  const hash = alteredHash.get("hash") ?? "";
  alteredHash.set("hash", `${hash.startsWith("0") ? "1" : "0"}${hash.slice(1)}`);
  assert.equal(validateTelegramInitData(alteredHash.toString(), BOT_TOKEN, NOW_MS), null);
});

test("rejects expired and implausibly future initData", () => {
  const now = Math.floor(NOW_MS / 1000);
  assert.equal(
    validateTelegramInitData(
      makeInitData({ authDate: now - 24 * 60 * 60 - 1 }),
      BOT_TOKEN,
      NOW_MS,
    ),
    null,
  );
  assert.equal(
    validateTelegramInitData(
      makeInitData({ authDate: now + 61 }),
      BOT_TOKEN,
      NOW_MS,
    ),
    null,
  );
});

test("rejects invalid user IDs, hashes, and oversized input", () => {
  assert.equal(
    validateTelegramInitData(makeInitData({ user: { id: 0 } }), BOT_TOKEN, NOW_MS),
    null,
  );
  assert.equal(validateTelegramInitData("x".repeat(10_001), BOT_TOKEN, NOW_MS), null);
});
