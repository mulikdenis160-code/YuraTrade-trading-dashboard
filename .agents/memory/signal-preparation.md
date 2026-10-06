---
name: Signal preparation flow
description: User-requested timing and clipboard behavior before issuing PRIME BOT signals.
---

Issue a quality-checked new signal immediately using its fresh entry quote: do not add a pair-selection countdown, repeat the same analysis, or automatically scan other expirations after an abstention. Show the abstention reason right away so the user can choose another expiry manually. After a loss, keep same-pair recovery bounded to three attempts and start it without preparation or display delays. Keep candle-quality and quote-freshness checks, the selected trade expiry, and copying the pair name without its trailing OTC label.

**Why:** the user asked to eliminate application-added waits; using the already validated result avoids a redundant analysis while retaining the data-quality safeguards and bounded recovery.

**How to apply:** preserve closed-candle, minimum-history, and fresh-quote checks; allow the AI to abstain; do not open trades automatically or shorten the user's chosen expiry. Keep recovery on the same pair, up to three attempts, without adding timers.
