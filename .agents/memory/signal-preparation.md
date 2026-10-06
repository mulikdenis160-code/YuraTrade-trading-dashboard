---
name: Signal preparation flow
description: User-requested timing and clipboard behavior before issuing PRIME BOT signals.
---

Complete candidate selection and signal preparation within a 7-second total deadline when the feed is healthy; Gemini may use up to 6 seconds, and independent quote/history work should overlap. Never weaken data-quality, fresh-quote, or safe-entry checks to force a signal. Keep direction hidden until the countdown ends. Schedule release at a safe minute-entry window, then re-fetch one-minute history and a fresh quote, enforcing at least 15 seconds before the minute closes and a quote age of at most 20 seconds. After a loss, repeat the same preparation flow for the same pair and original expiry. Allow up to three additional overlays for every level; wins and draws do not trigger an overlay. Copy the pair name without its trailing OTC label.

**Why:** the user wants searches to finish within 7 seconds while keeping signal reliability and entry safety intact.

**How to apply:** enforce the 7-second deadline from the start of initial search and on recovery preparation. On both flows, show the pair/countdown only after preparation succeeds, reveal direction only after the countdown, revalidate the one-minute entry window and fresh quote before issuing, and reject unsafe entries. Treat the deadline as a target for a healthy feed, not a reason to issue a signal from incomplete data. Keep recovery on the initial pair and expiry, and do not open trades automatically.
