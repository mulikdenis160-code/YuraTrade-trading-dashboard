---
name: Signal model
description: Scope and safeguards for PRIME BOT's WebSocket-candle direction model.
---

The current PRIME BOT uses the provisioned Replit Gemini AI Integrations proxy, so no direct Google API key is needed. Use Gemini 2.5 Flash through that proxy; direct Gemini 3.6 Flash is only the fallback when the proxy is absent and `GEMINI_API_KEY` is configured. Send one OTC currency pair per request and ask for up/down, one explanation, and confidence from 0–100. Do not put an abstention option, confidence cutoff, or second classifier in the model prompt. The model receives the live price, the last-close change versus four candles earlier, 12-close standard deviation, and up to 30 closed closes. The default expiry is 120 seconds on 60-second candles.

**Why:** the user said they do not have a direct Gemini key and explicitly asked to use Replit's proxy instead. The proxy was provisioned and returned a valid signal response during a live test; the confidence score remains the model's subjective estimate, not a measured win rate.

**How to apply:** use the configured proxy and do not ask the user for a personal Google API key while it remains available. Preserve independent safeguards for valid closed history (at least 15 candles), quote age (at most 20 seconds), and the next-minute entry window (at least 15 seconds remaining). Keep the feed read-only and never open trades automatically. Do not treat live OHLC/cadence checks as proof that prices match the chart.
