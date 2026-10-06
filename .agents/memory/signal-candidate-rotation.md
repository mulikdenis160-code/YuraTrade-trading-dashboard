---
name: Rotating signal candidates
description: Selection strategy for Pocket Option candidates that balances coverage against per-search latency.
---

Keep candidate searches in bounded batches and rotate through the eligible pool across attempts. Do not always recheck the same first slice, and do not load every pair's history in one request when that would make search latency excessive. Preserve direct AI abstention criteria.

**Why:** live search measurements showed feed setup and candle-history retrieval were subsecond while Claude analysis dominated latency, reaching roughly 16–48 seconds. Repeated identical pools also cannot discover a stronger setup elsewhere.

**How to apply:** when reducing latency, limit candidates per model call but continue rotating through the full eligible pool. Preserve payout, candle-quality, freshness, and abstention checks; optimize per-call analysis scope before weakening data safeguards.
