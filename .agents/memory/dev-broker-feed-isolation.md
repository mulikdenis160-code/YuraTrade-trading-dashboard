---
name: Dev broker feed isolation
description: The broker feed bootstrap and server-function handler can hold separate in-memory market-data caches in development.
---

In development, logs proving that the bootstrap WebSocket is authorized and receiving ticks do not prove that the signal server function can read that same warmed cache. Keep the tick/history map and broker-clock offset on a process-wide `globalThis` runtime shared by the Vite bootstrap and server-function module; rank pairs with fresh quote and fresh history ahead of merely eligible pairs. Validate the signal handler after warmup.

**Why:** module-local state left a direct server-function probe cold while the background bootstrap was warm. Sharing the process state and preferring history-ready pairs allowed a real server-function test to return a signal.

**How to apply:** test the actual server function after a stable broker warmup and compare its chosen pair, quote age, candle age, and tick coverage with bootstrap diagnostics. Do not claim end-to-end signal success from bootstrap logs alone; if the server function runs in a separate process, use an explicit shared service/API instead of `globalThis`.
