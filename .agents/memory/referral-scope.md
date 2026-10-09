---
name: Pocket Option partner scope
description: The current partner/referral scope for PRIME BOT.
---

Pocket Option partner onboarding is in scope. The Telegram bot must work entirely in the chat: ask for the 9-digit Pocket Option ID, verify it through the partner API, and return the applicable plan only after the partner confirms the account. An ID absent from the partner data is denied; do not force bot users to open the website or Mini App.

Use a permanent one-to-one binding: each Telegram user ID can link to only one Pocket Option ID, and each Pocket Option ID to only one Telegram user ID. Do not offer an in-app disconnect or rebind path.

The partner response's `count_deposits` is the only field used to confirm a deposit. For tier selection, `sum_ftd` is used as the account's deposit amount only after `count_deposits` is positive. Public documentation has not confirmed the meaning or currency of either field, so the tier mapping remains provisional.

The configured admin Pocket Option ID and Telegram user ID form an exact pair. Admin status may waive the deposit requirement only after the partner API confirms that Pocket Option account exists; the Telegram ID alone must never grant access for an unrecognized Pocket Option ID.

**Why:** users asked for direct in-chat verification and denial when the partner has no record. The app also needs a partner-sourced amount to assign a per-account tier; `sum_ftd` is the available amount candidate and must not be treated as proof of a deposit.

**How to apply:** enforce uniqueness on both IDs and fail closed on conflicts or API failures. Keep the positive deposit-count check independent from the `sum_ftd` tier calculation, and confirm field semantics and currency with the partner before treating the tier amount as authoritative.
