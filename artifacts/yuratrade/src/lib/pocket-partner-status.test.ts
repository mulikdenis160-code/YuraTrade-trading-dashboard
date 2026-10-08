import assert from "node:assert/strict";
import test from "node:test";
import { parsePocketPartnerStatus } from "./pocket-partner-status.ts";

test("recognizes a matching account with one or more confirmed deposits", () => {
  assert.deepEqual(
    parsePocketPartnerStatus(
      { uid: 123456789, count_deposits: "1", sum_ftd: "25.00" },
      "123456789",
    ),
    { registered: true, hasDeposit: true },
  );
});

test("does not grant access when the partner reports zero deposits", () => {
  assert.deepEqual(
    parsePocketPartnerStatus(
      { uid: "123456789", count_deposits: 0, sum_ftd: "0" },
      "123456789",
    ),
    { registered: true, hasDeposit: false },
  );
});

test("does not treat another account's data as the requested ID", () => {
  assert.deepEqual(
    parsePocketPartnerStatus(
      { uid: "987654321", count_deposits: 4 },
      "123456789",
    ),
    { registered: false, hasDeposit: true },
  );
});

test("fails closed if the explicit deposit count is missing", () => {
  assert.throws(
    () => parsePocketPartnerStatus({ uid: "123456789", sum_ftd: 100 }, "123456789"),
    /required account status/,
  );
});
