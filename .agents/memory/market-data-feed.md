---
name: Market data feed
description: User-stated requirement to connect live market data for signal generation.
---

The user chose Pocket Option as the signal dashboard's live quote source.

Pocket Option history requests may return about 150 candles even when a larger offset is requested. Page backward from the oldest returned timestamp, merge by candle time, and stop when a page makes no progress.

Performance claims must come from completed FX signal outcomes in the local journal. Do not claim a fixed hit rate, turn missing close prices into wins or losses, or tune the filter to inflate results. The user wants to test currency-pair selection and history settlement before reconsidering signal quality.

**Why:** a 512-candle request yielded only 126 trainable examples; pagination reached forward validation without relaxing the model's sample thresholds. The user wants to evaluate real observations rather than a promised percentage, and the feed supports decision-making rather than automated trading.

**How to apply:** paginate only read-only history requests; do not lower validation thresholds or synthesize candles to make a model pass. Store authorization only in Replit Secrets, never in source files, and exclude pending or unverified records from hit-rate calculations.