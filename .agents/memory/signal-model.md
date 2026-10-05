---
name: Signal model
description: Scope and safeguards for PRIME BOT's experimental machine-learning estimate.
---

The model learns from this browser's settled FX journal only. It must ignore pending, unverified, draw, and non-FX records; require a balanced minimum sample; use a chronological holdout; and show an estimate only when it beats the baseline on that later holdout. It is advisory only and must not change the heuristic signal direction or place trades.

**Why:** the app has no shared labeled dataset, and unsupported probability claims or model-driven entries could mislead users.

**How to apply:** preserve local-only training, report sample count and forward-test quality, and keep the signal generator unchanged unless separately requested and validated.
