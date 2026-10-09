---
name: Pocket Option partner scope
description: The current partner/referral scope for PRIME BOT.
---

Pocket Option verification stays in Telegram chat: ask for the 9-digit Pocket Option ID, verify it through the partner API, and deny ordinary IDs absent from partner data. The configured exact Telegram/Pocket Option admin pair may bypass the partner-record and deposit checks. Only after successful verification or this exact admin bypass, show the requested optional menu with an “Open SignalAI” Mini App button, language selection, instructions, and support. Keep one-to-one bindings.

Use a permanent one-to-one binding: each Telegram user ID can link to only one Pocket Option ID, and each Pocket Option ID to only one Telegram user ID. Do not offer an in-app disconnect or rebind path.

The partner response's `count_deposits` is the only field used to confirm a deposit. For tier selection, `sum_ftd` is used as the account's deposit amount only after `count_deposits` is positive. Public documentation has not confirmed the meaning or currency of either field, so the tier mapping remains provisional.

The Telegram bot's admin bypass is limited to the configured exact pair: Telegram ID `984367891` and Pocket Option ID `984367891`. Do not extend it to other site admin IDs or let another Telegram user claim the admin Pocket Option ID.

**Why:** users asked for direct in-chat verification, an optional post-verification menu, and bot access for the configured admin ID after the partner API rejected it. The exact Telegram/Pocket Option pairing limits that exception. The app also needs a partner-sourced amount to assign a per-account tier; `sum_ftd` is the available amount candidate and must not be treated as proof of a deposit.

**How to apply:** enforce uniqueness on both IDs and fail closed on conflicts. Keep ordinary-user verification in chat and fail closed on partner API failures; allow only the configured admin pair to skip the partner record and deposit checks. Show the optional launch menu after verification or this exact bypass. Keep the positive deposit-count check independent from the `sum_ftd` tier calculation, and confirm field semantics and currency with the partner before treating the tier amount as authoritative.
