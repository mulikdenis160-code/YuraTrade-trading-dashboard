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

A live OHLC-shape and candle-cadence check confirms only row structure and interval; it does not prove price-for-price parity with the Pocket Option chart or indicator equivalence.

**Why:** a feed can return complete, regularly spaced candles while the user still observes different chart values or indicator readings.

**How to apply:** when investigating a reported chart or indicator mismatch, ask for an exact pair, timeframe, candle timestamp, and values from both the bot and the chart after checking feed structure and cadence.

Pocket Option Socket.IO events can carry `updateStream` and its data in one `42` frame; parsing only a following standalone array drops live ticks. Handle inline event payloads as well as split frames.

**Why:** production logs showed an open socket and populated asset catalog, but no stream clock sample. The prior handler returned as soon as it saw `updateStream`, assuming the payload would arrive as another WebSocket frame.

**How to apply:** parse Socket.IO event envelopes and inspect their inline payload before using the legacy split-frame path. Then use a valid stream timestamp to align history requests to the candle period; never log authorization data or raw market frames.

The live subscription sequence is `subscribeSymbol(asset)`, `changeSymbol({asset, period})`, then `subfor(asset)`. An open socket and `updateAssets` only prove transport/catalog delivery; wait for `successauth` before treating the feed as authorized, then verify `updateStream` and a history response. The WebSocket HTTP `Date` header can seed clock synchronization, with stream timestamps refining it.

**Why:** a production test received the asset catalog but no auth success, ticks, or candle history. Sending only `changeSymbol`/`subfor` was insufficient, and the provider later explicitly rejected the configured session.

**How to apply:** distinguish transport, authentication, subscription, and history failures in diagnostics. Never bypass Pocket Option authentication or log the session payload; if `NotAuthorized` arrives, request a fresh full auth frame through Replit Secrets.

Choose the Pocket Option WebSocket endpoint from the auth frame's `isDemo` value: demo sessions use the demo EU endpoint, and real sessions use the live EU endpoint. Convert history candle timestamps from server time to local epoch using the same stream clock offset before entry-window checks.

**Why:** a demo session sent to the fixed Moscow endpoint was rejected, and unconverted server timestamps made valid candles appear two hours in the future.

**How to apply:** keep request cursors in local epoch, add the stream offset when requesting provider history, and subtract it from returned candle times before comparing against local time.

Treat fresh ticks and fresh candle history as separate requirements. The user approved using Pocket Option's `updateHistoryNewFast` ticks to reconstruct missing closed bars only when each minute has at least four samples spanning 70% of the interval; otherwise keep rejecting stale history. Preserve the user's minimum payout filter unless they explicitly change it.

**Why:** Pocket Option's regular history lagged by several minutes, while the user asked for signals when requested and authorized the provider's fast-history path with a coverage safeguard.

**How to apply:** reconcile regular OHLC history with fast-history ticks only for fully covered closed minutes. Never fabricate uncovered bars, and keep the fresh-quote check independent.