---
name: Dev broker feed isolation
description: The broker feed bootstrap and server-function handler can hold separate in-memory market-data caches in development.
---

In development, logs proving that the bootstrap WebSocket is authorized and receiving ticks do not prove that the signal server function can read that same warmed cache. Validate the signal handler's own data path after warmup; if it remains cold, move the feed and handler into one shared runtime rather than relying on module-local memory.

**Why:** a direct server-function probe continued to see stale history and only a few local ticks while the background bootstrap had already accumulated a much larger tick buffer.

**How to apply:** test the actual server function after a stable broker warmup and compare its chosen pair, quote age, candle age, and tick coverage with bootstrap diagnostics. Do not claim end-to-end signal success from bootstrap logs alone.
