---
name: Signal model
description: Scope and safeguards for PRIME BOT's WebSocket-candle direction model.
---

The current PRIME BOT uses the provisioned Replit Gemini AI Integrations proxy; do not ask the user for a direct Google API key. Analyze one OTC currency pair per request and ask for up/down, one explanation, and subjective confidence from 0–100. Match analysis candles to expiry: 1 minute through 3-minute expiries, 5 minutes for 5–30-minute expiries, and 15 minutes for longer expiries. ADX is context for Gemini, never an automatic pre-analysis rejection. Do not put an abstention option, confidence cutoff, or second classifier in the model prompt unless the user changes this requirement.

**Why:** the user said they do not have a direct Gemini key and explicitly asked to use Replit's proxy instead. A hard ADX cutoff had prevented Gemini from assessing otherwise eligible setups; the confidence score remains the model's subjective estimate, not a measured win rate.

**How to apply:** use the configured proxy and do not ask the user for a personal Google API key while it remains available. Preserve independent safeguards for valid closed history (at least 15 candles), fresh quotes (at most 20 seconds old), and a separate one-minute entry-window check (at least 15 seconds remaining). Keep the feed read-only and never open trades automatically. Do not treat live OHLC/cadence checks as proof that prices match the chart.
