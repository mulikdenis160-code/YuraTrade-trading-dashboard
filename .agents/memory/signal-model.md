---
name: Signal model
description: Scope and safeguards for PRIME BOT's WebSocket-candle direction model.
---

The server-side signal flow uses Pocket Option WebSocket candles and keeps the feed read-only. The user prioritizes WIN rate over signal volume and explicitly asked for direct OpenAI candle analysis. OpenAI GPT-6 Astra may select one eligible pair/direction from a batch of up to four, but a signal requires an exact agreement with the independently forward-validated local classifier and at least 80/100 subjective AI confidence. Never present that self-rating as calibrated probability or observed win rate.

**Why:** the user requested maximum WIN rate and direct AI analysis; prior historical replay produced only one qualified outcome, so there is not enough evidence to claim improved accuracy.

**How to apply:** train, calibrate, and validate chronologically; fail closed if history or forward validation is insufficient, or if the direct AI and local model disagree. Keep probabilities experimental and do not tune to one outcome.
