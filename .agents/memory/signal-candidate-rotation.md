---
name: Rotating signal candidates
description: Selection strategy for Pocket Option candidates that balances coverage against per-search latency.
---

Use a payout-descending pool of at most 8 active OTC currency pairs paying exactly 80% or 92%. Rotate the pool across searches and try candidates sequentially; a history timeout on one pair must not end the search while time remains.

**Why:** the user specified an eight-pair maximum and exact eligible payout levels, and a delayed history response for one pair should not block a usable alternative.

**How to apply:** sort eligible pairs by current payout, cap the selection at 8, advance a round-robin selector, and load each candidate's data sequentially within the overall signal deadline. Keep candle validation and quote freshness checks.
