---
name: Signal model
description: Scope and safeguards for PRIME BOT's WebSocket-candle direction model.
---

The current PRIME BOT signal strategy uses a fixed 120-second expiry and one-minute candles. Use 15–30 verified, closed candles; compare close[-1] with close[-5] for trend and compute standard deviation over the last 12 closes. Require a fresh quote no older than 20 seconds. Send these values to the provisioned Replit Gemini AI Integrations proxy and validate its JSON direction/explanation. Settle from a fresh quote after 120 seconds; retain verified local-journal and draw/overlay rules. Do not ask the user for a direct Google API key.

**Why:** the user specified this exact bot-only signal workflow and confirmed a fixed two-minute outcome check. A model confidence score is subjective, not a measured win rate.

**How to apply:** use the configured proxy; analyze one OTC currency pair per request. Preserve the independent data-quality and one-minute entry-window checks (at least 15 seconds remaining). Keep the feed read-only and never open trades automatically. Do not treat live OHLC/cadence checks as proof that prices match the chart.

Live proxy logs showed unbounded Gemini analysis frequently taking 10–16.5 seconds. Keep proxy reasoning bounded so normal analysis remains responsive under the user's 20-second total deadline, without changing providers or weakening signal safeguards.

**Why:** upstream analysis latency was close enough to the user's hard deadline to produce visible timeouts.

**How to apply:** evaluate latency and signal quality together before changing the reasoning limit or model configuration.
