---
name: Rotating signal candidates
description: Selection strategy for Pocket Option candidates that balances coverage against per-search latency.
---

Keep candidate searches in bounded batches and rotate through the eligible pool across attempts. Do not always recheck the same first slice, and do not load every pair's history in one request when that would make search latency excessive. Preserve direct AI abstention criteria.

**Why:** sequential Pocket Option history requests and comparative Claude analysis can make an all-at-once scan slow; repeated identical pools cannot discover a stronger setup elsewhere.

**How to apply:** keep payout, candle-quality, and fresh-quote checks intact; advance the candidate window even after a pass so the next search examines different pairs. Broader coverage improves search coverage, not guaranteed outcomes.
