---
name: Signal model
description: Scope and safeguards for PRIME BOT's WebSocket-candle direction model.
---

The server-side signal flow uses read-only Pocket Option WebSocket candles and direct Claude Opus 5 analysis through Replit AI Integrations for the chosen direction. Do not gate signals on agreement with a separate local classifier, a confidence cutoff, or forward-validation scores. The AI may abstain when valid candles do not show a clear edge; the minimum candle count is not a requirement to force a direction. AI confidence is subjective; measured hit rate must come only from completed outcomes verified against actual Pocket Option prices.

**Why:** the user asked for the AI itself to analyze the candles and issue the signal; the local classifier must not prevent that. The old prompt forced a direction whenever enough candles existed, including weak or conflicting setups. Self-rated confidence is not evidence of accuracy.

**How to apply:** keep the feed read-only, retain the pair-preparation countdown and fresh same-pair analysis, allow the direct AI to pass on invalid, insufficient, or inconclusive candles without a numeric confidence gate, preserve that option when repairing malformed responses, and never open trades automatically or present AI confidence as a win rate. Verify exact Anthropic model IDs with the Replit runtime before switching: it rejected `claude-opus-5-5` as unsupported despite the published model list, while `claude-opus-5` passed a live request.
