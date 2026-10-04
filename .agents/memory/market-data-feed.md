---
name: Market data feed
description: User-stated requirement to connect live market data for signal generation.
---

The user chose Pocket Option as the signal dashboard's live quote source.

**Why:** the user confirmed the live feed is needed and selected Pocket Option, then provided fresh authorization through Replit Secrets.

**How to apply:** keep the feed read-only; store authorization only in Replit Secrets, never in source files, and do not reuse credentials embedded in uploaded archives.