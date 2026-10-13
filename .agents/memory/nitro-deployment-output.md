---
name: Nitro deployment output
description: Deployment packaging requirement for the app's Vite/Nitro preview build.
---

Do not exclude `.vercel/output` from the Replit deployment context. The production build generates this directory, and `vite preview` needs its `nitro.json` metadata and server bundles at startup.

**Why:** a publish attempt completed compilation but crash-looped in the serve phase with “Cannot load nitro build info” when this directory was excluded from the deployment context.

**How to apply:** if publication fails after a successful Vite/Nitro build, verify `.replitignore` does not exclude `.vercel/output`; then confirm `vite preview` can serve the newly built artifact.
