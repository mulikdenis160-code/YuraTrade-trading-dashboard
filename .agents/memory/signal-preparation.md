---
name: Signal preparation flow
description: User-requested timing and clipboard behavior before issuing PRIME BOT signals.
---

Before a signal is issued, show the selected currency pair without direction and run a 10-second countdown so the trader can select that pair at the broker. Recheck the same pair after the countdown before showing the direction. Copy the pair name without its trailing OTC label. Preserve the post-loss same-pair recovery flow with its 10-second preparation and up to three recovery attempts; do not remove it unless the user explicitly asks.

**Why:** the user wants time to choose the matching broker pair and enter promptly when the signal appears; the OTC label should not be included in the copied pair name. The user explicitly said to keep the recovery system.

**How to apply:** keep direction and the entry timer hidden until the countdown ends, use a fresh result for the same pair, and do not record a signal before it is actually issued. After a loss, retain the automatic same-pair reanalysis and bounded recovery sequence.
