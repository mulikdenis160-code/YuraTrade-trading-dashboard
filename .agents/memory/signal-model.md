---
name: Signal model
description: Scope and safeguards for PRIME BOT's WebSocket-candle direction model.
---

The server-side model must use historical candles received from Pocket Option through its WebSocket and choose the call/put direction itself. Do not train direction from the browser's settled journal or fall back to a heuristic. Keep the feed read-only. Split candle samples chronologically for training, calibration, and later validation. The user prioritizes observed WIN rate over signal volume; accept fewer or no signals rather than relaxing validation.

**Why:** the user chose maximum WIN rate over volume or payout-adjusted return, and a single historical loss is not enough evidence to tune the model.

**How to apply:** preserve read-only market access, show sample and holdout diagnostics, keep probabilities experimental, and fail closed whenever history or validation is insufficient. Never claim a high accuracy rate from a small holdout or tune to one outcome.
