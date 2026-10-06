---
name: Signal preparation flow
description: User-requested timing and clipboard behavior before issuing PRIME BOT signals.
---

Select a rotating pair and show it for a 10-second copy window before fetching fresh candles and analyzing it; do not reveal direction during the wait. Preserve the user's selected expiry and existing candle/quote validation, including the 15-second entry buffer and 20-second quote-age limit. After a loss, repeat the 10-second window and analyze the same pair at the original expiry. Allow up to three additional overlays for every level; wins and draws do not trigger an overlay. Copy the pair name without its trailing OTC label.

**Why:** the user requested time to copy the pair before each signal and three recovery attempts at every level; the signal still needs a fresh quote after the wait.

**How to apply:** keep the copy wait before analysis, then fetch fresh market data and reject late entries rather than issuing stale signals. Keep recovery on the initial pair and expiry, and do not open trades automatically.
