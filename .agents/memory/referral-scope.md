---
name: Pocket Option partner scope
description: The current partner/referral scope for PRIME BOT.
---

Pocket Option partner onboarding is in scope: gate Telegram Mini App access on affiliate registration and a confirmed deposit. Keep work limited to that flow; do not add unrelated referral rewards or commission features unless requested.

Use a permanent one-to-one binding: each Telegram user ID can link to only one Pocket Option ID, and each Pocket Option ID to only one Telegram user ID. Do not offer an in-app disconnect or rebind path.

The partner response's `count_deposits` is the only field used to confirm a deposit. For tier selection, `sum_ftd` is used as the account's deposit amount only after `count_deposits` is positive. Public documentation has not confirmed the meaning or currency of either field, so the tier mapping remains provisional.

**Why:** the app needs a partner-sourced amount to assign a per-account tier, and `sum_ftd` is the available amount candidate; it must not be treated as proof of a deposit.

**How to apply:** enforce uniqueness on both IDs and fail closed on conflicts or API failures. Keep the positive deposit-count check independent from the `sum_ftd` tier calculation, and confirm field semantics and currency with the partner before treating the tier amount as authoritative.
