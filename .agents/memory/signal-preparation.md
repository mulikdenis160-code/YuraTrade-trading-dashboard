---
name: Signal preparation flow
description: User-requested timing and clipboard behavior before issuing PRIME BOT signals.
---

Select a rotating pair and start fetching candles and analyzing it as soon as the 10-second copy window begins; never reveal direction during the wait. Cap Gemini analysis to one request and 5 seconds, and cap any client wait after the countdown at 5 seconds. At countdown end, recheck the 15-second entry buffer and obtain a fresh quote no older than 20 seconds. After a loss, repeat the same pre-analysis and hidden-result flow for the same pair and original expiry. Allow up to three additional overlays for every level; wins and draws do not trigger an overlay. Copy the pair name without its trailing OTC label.

**Why:** the user wants the signal ready as the copy timer ends; waiting until afterward caused analysis to overrun the safe entry window.

**How to apply:** start preparation during the copy timer on both initial and recovery signals, but withhold the result until it ends. Revalidate the entry window and quote immediately before returning a signal; reject unsafe entries instead of weakening those checks. Keep recovery on the initial pair and expiry, and do not open trades automatically.
