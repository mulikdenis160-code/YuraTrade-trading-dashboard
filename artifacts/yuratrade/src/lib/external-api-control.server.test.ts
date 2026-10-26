import assert from "node:assert/strict";
import test from "node:test";
import { externalApisDisabled } from "./external-api-control.server.ts";

test("external API kill switch is off unless explicitly enabled", () => {
  assert.equal(externalApisDisabled({}), false);
  assert.equal(externalApisDisabled({ PRIME_EXTERNAL_APIS_DISABLED: "false" }), false);
  assert.equal(externalApisDisabled({ PRIME_EXTERNAL_APIS_DISABLED: " TRUE " }), true);
});
