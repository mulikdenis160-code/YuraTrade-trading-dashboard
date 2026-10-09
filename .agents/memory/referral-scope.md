---
name: Pocket Option partner scope
description: The current partner/referral scope for PRIME BOT.
---

Pocket Option verification stays in Telegram chat: ask for the 9-digit Pocket Option ID, verify ordinary IDs through the partner API, and deny ordinary IDs absent from partner data. Any Telegram user who enters one of the configured Pocket Option admin IDs receives admin access without partner-record, deposit, or matching-Telegram-ID checks. Keep these admin claims separate from ordinary one-to-one bindings. After verification or an admin claim, show the optional menu with an “Open SignalAI” Mini App button, language selection, instructions, and support.

Use a permanent one-to-one binding for ordinary accounts: each Telegram user ID can link to only one Pocket Option ID, and each Pocket Option ID to only one Telegram user ID. Admin Pocket Option IDs may be claimed by multiple Telegram users in separate admin-access records. Do not offer an in-app disconnect or rebind path.

The partner response's `count_deposits` is the only field used to confirm a deposit. For tier selection, `sum_ftd` is used as the account's deposit amount only after `count_deposits` is positive. Public documentation has not confirmed the meaning or currency of either field, so the tier mapping remains provisional.

The Telegram bot's admin bypass applies to all configured Pocket Option admin IDs: `113510708`, `92535291`, and `984367891`. Any Telegram user may enter one of these IDs; no exact Telegram-ID pairing is required.

**Why:** the user explicitly asked for any person entering a configured admin ID to receive admin access, without pairing it to a specific Telegram account. This intentionally makes the admin IDs shared access codes; anyone who knows one can claim its privileges. The app also needs a partner-sourced amount to assign a per-account tier; `sum_ftd` is the available amount candidate and must not be treated as proof of a deposit.

**How to apply:** enforce uniqueness on both IDs for ordinary bindings and fail closed on conflicts. Keep ordinary-user verification in chat and fail closed on partner API failures. Allow any Telegram user to claim one of the configured admin Pocket Option IDs without creating an ordinary one-to-one binding; persist that claim separately so Mini App access can resolve the selected admin ID. Show the optional launch menu after verification or an admin claim. Keep the positive deposit-count check independent from the `sum_ftd` tier calculation, and confirm field semantics and currency with the partner before treating the tier amount as authoritative.
