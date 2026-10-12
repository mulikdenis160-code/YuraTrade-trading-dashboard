---
name: Dev broker feed isolation
description: The broker feed bootstrap and server-function handler can hold separate in-memory market-data caches in development.
---

Logs proving that one broker-feed runtime is authorized and receiving ticks do not prove that another server-function runtime can read its warmed cache. `globalThis` shares data only within the same process and VM; do not assume it bridges separate deployment processes or Vite SSR module contexts. Merge history by candle-open timestamp so an older provider response cannot overwrite newer cached or tick-reconciled candles.

**Why:** a direct server-function probe could still receive stale history after separate feed logs showed reconciled candles, and delayed broker responses could overwrite newer cache entries. A warmed-context signal test alone does not establish that all runtime contexts share that state.

**How to apply:** test the actual handler in the same runtime/process that serves user requests after a stable warmup. Compare its chosen pair, quote age, candle age, and tick coverage with that runtime's diagnostics. If bootstrap and handler are separate, use an explicit shared service/API instead of `globalThis`.
