---
name: Signal model
description: Scope and safeguards for PRIME BOT's WebSocket-candle direction model.
---

The current PRIME BOT signal settings use direct Gemini 3.6 Flash with `GEMINI_API_KEY`; if a complete Replit Gemini proxy is configured, use Gemini 2.5 Flash through it. Send one OTC currency pair per request and ask for up/down, one explanation, and confidence from 0–100. Do not put an abstention option, confidence cutoff, or second classifier in the model prompt. The model receives the live price, the last-close change versus four candles earlier, 12-close standard deviation, and up to 30 closed closes. The default expiry is 120 seconds on 60-second candles.

**Why:** the user replaced the earlier Claude/abstention settings with these explicit PRIME BOT parameters; the confidence score remains the model's subjective estimate, not a measured win rate.

**How to apply:** preserve independent safeguards for valid closed history (at least 15 candles), quote age (at most 20 seconds), and the next-minute entry window (at least 15 seconds remaining). Keep the feed read-only and never open trades automatically. Do not treat live OHLC/cadence checks as proof that prices match the chart.
