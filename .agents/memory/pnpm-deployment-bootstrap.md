---
name: pnpm deployment bootstrap
description: Diagnose deployment failures where Replit's pnpm provisioning command fails before project dependencies install.
---

When deployment logs fail while provisioning the pinned pnpm version, compare the root `packageManager` version with the pnpm version installed by Replit. Aligning the pin to the installed version can avoid a broken self-bootstrap.

**Why:** This project requested pnpm 10.30.0 while Replit provided 10.26.1; the shim attempted to install the pinned version and aborted. Matching the pin restored direct pnpm commands.

**How to apply:** If logs fail at `pnpm add pnpm@<version>` before the artifact build, check the runtime's installed pnpm version first; verify a frozen-lockfile install and target artifact build before publishing.
