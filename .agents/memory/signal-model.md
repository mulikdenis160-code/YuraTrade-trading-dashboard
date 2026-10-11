---
name: Signal model
description: Scope and safeguards for PRIME BOT's WebSocket-candle direction model.
---

The user can select a PRIME BOT expiry from 30 seconds through 4 hours; default to 120 seconds. Send the chosen expiry to Gemini and choose the analysis candle interval with `analysisPeriodForExpiry`: 60-second candles through 3-minute expiry, 5-minute candles through 30 minutes, and 15-minute candles for longer expiries. Use 15–30 verified, closed candles; compare close[-1] with close[-5] for trend and compute standard deviation over the last 12 closes. Require a fresh quote no older than 20 seconds. Validate Gemini's JSON direction/explanation and settle from a fresh quote after the selected expiry. Do not ask the user for a direct Google API key.

**Why:** the user asked to restore the earlier per-signal expiry selection. A model confidence score is subjective, not a measured win rate.

**How to apply:** use the configured proxy; analyze one OTC currency pair per request. Preserve the independent data-quality and one-minute entry-window checks (at least 15 seconds remaining). Keep the feed read-only and never open trades automatically. Do not treat live OHLC/cadence checks as proof that prices match the chart.

Live proxy logs showed unbounded Gemini analysis frequently taking 10–16.5 seconds. Keep proxy reasoning bounded so normal analysis remains responsive under the user's 20-second total deadline, without changing providers or weakening signal safeguards.

**Why:** upstream analysis latency was close enough to the user's hard deadline to produce visible timeouts.

**How to apply:** evaluate latency and signal quality together before changing the reasoning limit or model configuration.
