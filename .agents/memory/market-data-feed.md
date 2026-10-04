---
name: Market data feed
description: User-stated requirement to connect live market data for signal generation.
---

The user said the live data feed will need to be connected for the signal dashboard.

**Why:** the user stated this after the preview was launched without live quotes.

**How to apply:** keep the UI runnable while disconnected; confirm the data provider and use fresh authorization through Replit Secrets before enabling live access. Do not reuse an authorization credential embedded in an uploaded source archive.