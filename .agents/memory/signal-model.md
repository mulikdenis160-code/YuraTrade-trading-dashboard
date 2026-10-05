---
name: Signal model
description: Scope and safeguards for PRIME BOT's WebSocket-candle direction model.
---

The server-side signal flow uses read-only Pocket Option WebSocket candles and direct OpenAI analysis for the chosen direction. Do not gate signals on agreement with a separate local classifier, a confidence cutoff, or forward-validation scores. AI confidence is subjective; measured hit rate must come only from completed outcomes verified against actual Pocket Option prices.

**Why:** the user asked for the AI itself to analyze the candles and issue the signal; the local classifier must not prevent that. Self-rated confidence is not evidence of accuracy.

**How to apply:** keep the feed read-only, retain the pair-preparation countdown and fresh same-pair analysis, allow abstention for insufficient or invalid input, and never open trades automatically or present AI confidence as a win rate.
