---
name: Signal preparation flow
description: User-requested timing and clipboard behavior before issuing PRIME BOT signals.
---

Complete signal analysis before showing the selected pair or starting its countdown; keep direction hidden until the countdown ends. Schedule release at a safe minute-entry window, then re-fetch one-minute history and a fresh quote, enforcing at least 15 seconds before the minute closes and a quote age of at most 20 seconds. Keep Gemini's request capped at 5 seconds and the bounded client preparation wait at 15 seconds. After a loss, repeat the same preparation flow for the same pair and original expiry. Allow up to three additional overlays for every level; wins and draws do not trigger an overlay. Copy the pair name without its trailing OTC label.

**Why:** users should only start copying once a usable signal exists; delaying release must not weaken the independent entry-safety checks.

**How to apply:** on both initial and recovery signals, wait for preparation to succeed before showing the pair/countdown. Reveal direction only after the countdown, revalidate the one-minute entry window and fresh quote before issuing, and reject unsafe entries. Keep recovery on the initial pair and expiry, and do not open trades automatically.
