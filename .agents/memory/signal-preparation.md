---
name: Signal preparation flow
description: User-requested timing and clipboard behavior before issuing PRIME BOT signals.
---

Complete candidate selection and signal preparation within a 20-second total deadline; Gemini may use up to 19 seconds, and independent quote/history work should overlap. Return as soon as preparation succeeds rather than waiting for the full limit. Never weaken data-quality, fresh-quote, or safe-entry checks to force a signal. Quote acquisition must wait longer than the 2-second resubscribe throttle; currently allow 8 seconds, while keeping the overall 20-second preparation deadline. Keep direction hidden until the countdown ends. The user-visible copy countdown must run for its full configured delay starting when the prepared pair is shown, even if the server's planned release timestamp is near or past due to transit; after it ends, re-fetch one-minute history and a fresh quote, enforcing at least 15 seconds before the minute closes and a quote age of at most 20 seconds. After a loss, repeat the same preparation flow for the same pair and original expiry. Allow up to three additional overlays for every level; wins and draws do not trigger an overlay. Count intermediate failed attempts as overlays, not completed losses; record one loss only if the last allowed overlay also fails. Copy the pair name without its trailing OTC label.

**Why:** the user wants analysis as fast as possible, with a hard maximum of 20 seconds and no loss of signal or entry safety.

**How to apply:** enforce the 20-second deadline from the start of initial search and on recovery preparation, while letting successful calls return immediately. On both flows, show the pair/countdown only after preparation succeeds, anchor the full copy delay to when the client displays the pair, reveal direction only after the countdown, revalidate the one-minute entry window and fresh quote before issuing, and reject unsafe entries. Never issue a signal from incomplete data. Keep recovery on the initial pair and expiry, and do not open trades automatically. In the journal and summary, exclude intermediate losing attempts from final win/loss totals; count a loss only after the final permitted overlay expires in a loss.

Cap the visible post-analysis countdown at 25 seconds and derive the current entry minute from the synchronized live clock, not the delayed historical-candle timestamp. Continue to recheck the entry window and fresh quote before issuing.

**Why:** delayed candle history made the entry-window check point to an expired minute and could block every otherwise-prepared signal; waiting for that old timestamp also produced countdowns longer than the user's 25-second maximum.

**How to apply:** keep the 10-second minimum copy delay, cap the displayed wait at 25 seconds, then validate against the actual current minute and a fresh quote. Preserve the historical-data quality gate and do not invent candles or issue signals from stale analysis.

**Why:** a server release timestamp can lose its remaining countdown time during request transit, making the client skip the copy wait and reveal direction immediately.

**Why:** AUDNZD OTC quote acquisition timed out at the same 2-second interval used to throttle resubscription, so a retry could be blocked until the wait had already expired.

**How to apply:** keep the quote wait above the resubscribe throttle and inside the overall preparation deadline; do not lower the freshness validation to mask delayed feeds.

**Why:** A history timeout can occur after the feed has loaded its pair catalog; startup logs alone cannot distinguish a delayed provider response from an unrecognized history frame.

**How to apply:** log feed/auth outcome, catalog readiness, history request/response shape, and timeout socket state without logging credentials, raw frames, or quote values. Keep data validation separate from transport waiting.
