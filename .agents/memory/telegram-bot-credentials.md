---
name: Telegram bot credentials
description: Keep PRIME BOT Telegram API and Mini App identity tied to the same bot token.
---

Use `TELEGRAM_BOT_TOKEN` from Replit Secrets for Bot API requests, webhook registration, and Telegram Mini App `initData` signature validation. Do not route only part of the app through a separately configured Telegram integration, because that can send replies from a different bot than the one whose `initData` is being validated. Never hardcode or log the token.

**Why:** the Telegram bot identity must stay consistent across direct messages, webhook updates, and Mini App authentication.

**How to apply:** when switching bots, store the fresh BotFather token in Replit Secrets and keep every server-side Telegram API call on that same variable. Verify build and typecheck, but do not call `setWebhook` or publish without user authorization.
