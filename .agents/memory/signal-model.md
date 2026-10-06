---
name: Signal model
description: Scope and safeguards for PRIME BOT's WebSocket-candle direction model.
---

The server-side signal flow uses read-only Pocket Option WebSocket candles and direct Claude Opus 5 analysis through Replit AI Integrations for the chosen direction. Do not gate signals on agreement with a separate local classifier, a confidence cutoff, or forward-validation scores. The AI may abstain when valid candles do not show a clear edge; the minimum candle count is not a requirement to force a direction. Technical indicators derived from the same OHLC series are correlated context, not independent votes or a mechanical gate. AI confidence is subjective; measured hit rate must come only from completed outcomes verified against actual Pocket Option prices.

The user also wants broader signal discovery alongside better accuracy. Improve coverage and remove contradictory prompt wording, but never force a direction solely to increase signal count; only completed Pocket Option outcomes can establish measured accuracy.

**Why:** the user asked for the AI itself to analyze the candles and issue the signal; the local classifier must not prevent that. The old prompt forced a direction whenever enough candles existed, including weak or conflicting setups. Indicators reuse the same price observations, so counting them as separate votes can overstate evidence. Self-rated confidence is not evidence of accuracy. Signal frequency and accuracy cannot both be guaranteed from prompt settings alone.

**How to apply:** keep the feed read-only, retain the pair-preparation countdown and fresh same-pair analysis, use a bounded rotating candidate pool for broader coverage, pass additional timeframe and indicator context to the direct AI without turning it into a separate voting filter, allow the AI to pass on invalid, insufficient, or inconclusive candles without a numeric confidence gate, preserve that option when repairing malformed responses, and never open trades automatically or present AI confidence as a win rate. Verify exact Anthropic model IDs with the Replit runtime before switching: it rejected `claude-opus-5-5` as unsupported despite the published model list, while `claude-opus-5` passed a live request.
