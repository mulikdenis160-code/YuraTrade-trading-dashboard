---
name: Market data feed
description: User-stated requirement to connect live market data for signal generation.
---

The user chose Pocket Option as the signal dashboard's live quote source.

Pocket Option history requests may return about 150 candles even when a larger offset is requested. Page backward from the oldest returned timestamp, merge by candle time, and stop when a page makes no progress.

History responses identify the asset but not a unique request ID. Requests can run concurrently across different assets when matched by asset; serialize requests for the same asset so responses with different candle periods cannot be confused.

Performance claims must come from completed FX signal outcomes in the local journal. Do not claim a fixed hit rate, turn missing close prices into wins or losses, or tune the filter to inflate results.

**Why:** historical replay produced only one qualified outcome, a loss; the user now prioritizes stricter win-rate selection and direct candle analysis, but this is not enough evidence to claim effectiveness. The feed protocol has no request correlation ID for history responses, so same-asset requests must not overlap.

**How to apply:** paginate only read-only history requests; do not lower validation thresholds or synthesize candles to make a model pass. Store authorization only in Replit Secrets, never in source files, and exclude pending or unverified records from hit-rate calculations.