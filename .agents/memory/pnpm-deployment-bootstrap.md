---
name: pnpm deployment bootstrap
description: Diagnose deployment failures where Replit's pnpm provisioning command fails before project dependencies install.
---

When deployment logs fail while provisioning the pinned pnpm version, verify the project separately with `corepack pnpm install --frozen-lockfile` and the artifact-specific production build before changing application code.

**Why:** In this workspace, the Replit-provided `pnpm` shim aborted during package-manager provisioning with a CA-certificate thread resource error, while Corepack pnpm installed the locked workspace and the target artifact built successfully.

**How to apply:** If logs fail at `pnpm add pnpm@<version>` before the artifact build, treat it as package-manager bootstrap until proven otherwise; distinguish it from app build errors and avoid changing dependencies to mask it.
