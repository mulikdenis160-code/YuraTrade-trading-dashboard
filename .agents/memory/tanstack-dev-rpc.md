---
name: TanStack dev RPC diagnostics
description: Non-obvious requirements when invoking server functions directly on the Vite development server.
---

Server-function IDs in the Vite development server are generated from the current transformed module and export; production build IDs may be rejected. Direct calls also need an `Origin` matching the request URL or CSRF middleware rejects them.

**Why:** A read-only live feed check returned 403 without a same-origin header and failed ID validation when using the production bundle's ID; the current Vite ID plus matching origin succeeded.

**How to apply:** For future dev-only RPC diagnostics, obtain the ID from the current transformed module, use a matching `Origin`, and sanitize returned data before logging.
