---
name: Managed database publishing
description: Keep development migrations separate from Replit's production schema promotion.
---

For Replit-managed PostgreSQL, apply app migrations against the development database from the development workflow. Let Replit Publish calculate and apply production schema changes. Do not run DDL against production from a package `prebuild` hook or another production build step.

**Why:** A production build ran the app migrator before Replit's own schema promotion. Publish then attempted the same table-creation statements and failed, even though the build itself succeeded. The schemas matched afterward because the build had already created the production tables.

**How to apply:** Keep migration execution on dev-only commands. When Publish reports a database migration failure, inspect the build log and compare dev/prod schemas before changing code; never work around Publish by manually mutating the managed production database.
