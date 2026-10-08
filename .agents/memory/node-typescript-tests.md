---
name: Node native TypeScript tests
description: ESM import resolution when tests use Node's built-in TypeScript type stripping.
---

For tests run with Node's `--experimental-strip-types` in ESM mode, use explicit `.ts` suffixes on relative runtime imports in the test entrypoint and its imported modules. Node's native loader does not resolve extensionless TypeScript imports.

**Why:** Vite and TypeScript bundlers accept extensionless imports, so a module can pass typecheck and app builds but fail under `node:test` with `ERR_MODULE_NOT_FOUND`.

**How to apply:** When adding a Node-native TypeScript test, use `.ts` on local imports and keep the TypeScript configuration compatible with explicit TypeScript extensions.
