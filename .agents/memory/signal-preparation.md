---
name: Signal preparation flow
description: User-requested timing and clipboard behavior before issuing PRIME BOT signals.
---

Issue a validated signal without a pair-selection countdown or repeated analysis. Use the default two-minute expiry and one-minute candles. Require the target next-minute candle to have opened with at least 15 seconds remaining, and use a quote no older than 20 seconds. After a loss, keep recovery on the same pair with at most two additional overlays and no preparation delay. Continue copying the pair name without its trailing OTC label.

**Why:** the user set the current entry timing, expiry, candle interval, and recovery limit; waiting inside the app would add a delay and could make the quote stale.

**How to apply:** preserve valid closed-candle and fresh-quote checks; reject late entry rather than issuing a stale signal; do not open trades automatically or shorten an explicitly selected expiry.
