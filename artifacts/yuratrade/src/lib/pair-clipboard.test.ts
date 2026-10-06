import assert from "node:assert/strict";
import test from "node:test";
import { pairNameForClipboard } from "./pair-clipboard.ts";

test("clipboard labels omit only the trailing OTC marker", () => {
  assert.equal(pairNameForClipboard("EUR/USD OTC"), "EUR/USD");
  assert.equal(pairNameForClipboard("GBP/JPY"), "GBP/JPY");
});
