---
name: Pocket Option partner scope
description: The current partner/referral scope for PRIME BOT.
---

Pocket Option partner onboarding is in scope: gate Telegram Mini App access on affiliate registration and a confirmed deposit. Keep work limited to that flow; do not add unrelated referral rewards or commission features unless requested.

Use a permanent one-to-one binding: each Telegram user ID can link to only one Pocket Option ID, and each Pocket Option ID to only one Telegram user ID. Do not offer an in-app disconnect or rebind path.

The partner response's `count_deposits` is currently treated as the explicit deposit count. Public documentation confirming its exact semantics was not found; `sum_ftd` is not proof of a deposit.

**Why:** the user explicitly chose a permanent one-to-one identity link. Public partner API documentation did not confirm the meaning of `count_deposits`.

**How to apply:** enforce uniqueness on both IDs and fail closed on conflicts or API failures. Do not treat a Pocket Option ID as proof of account ownership; verify `count_deposits` semantics with the partner before changing the deposit rule.
