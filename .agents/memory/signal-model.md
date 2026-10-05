---
name: Signal model
description: Scope and safeguards for PRIME BOT's WebSocket-candle direction model.
---

The server-side model must use historical candles received from Pocket Option through its WebSocket and choose the call/put direction itself. Do not train direction from the browser's settled journal or fall back to a heuristic. Keep the feed read-only. Split candle samples chronologically for training, calibration, and later validation; issue no signal unless the model beats the baseline and shows positive forward-test value with enough examples. The local settled journal measures actual app outcomes, not model inputs.

**Why:** the user explicitly wants the AI to analyze WebSocket candle data and generate the signal; claiming high accuracy without later-candle validation would be misleading.

**How to apply:** preserve read-only market access, show sample and holdout diagnostics, keep probabilities experimental, and fail closed whenever history or validation is insufficient.
