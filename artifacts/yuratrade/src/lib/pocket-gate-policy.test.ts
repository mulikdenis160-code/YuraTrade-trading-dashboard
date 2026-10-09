import assert from "node:assert/strict";
import test from "node:test";
import { evaluatePocketGateStatus } from "./pocket-gate-policy.ts";

const noDeposit = {
  registered: true,
  hasDeposit: false,
  depositAmount: 0,
};

test("an ordinary account without a confirmed deposit is denied", () => {
  assert.deepEqual(
    evaluatePocketGateStatus(noDeposit, "123456789", "123456789"),
    { status: "deposit_required" },
  );
});

test("the configured website Pocket Option admin needs a partner record but not a deposit", () => {
  assert.deepEqual(
    evaluatePocketGateStatus(noDeposit, "984367891", "123456789"),
    { status: "verified", depositAmount: 0 },
  );
});

test("the configured Telegram admin needs the matching registered Pocket Option ID", () => {
  assert.deepEqual(
    evaluatePocketGateStatus(noDeposit, "984367891", "984367891"),
    { status: "verified", depositAmount: 0 },
  );
  assert.deepEqual(
    evaluatePocketGateStatus(noDeposit, "123456789", "984367891"),
    { status: "deposit_required" },
  );
});

test("the standard partner gate policy denies absent IDs; the exact Telegram admin pair is handled separately", () => {
  assert.deepEqual(
    evaluatePocketGateStatus(
      { ...noDeposit, registered: false },
      "984367891",
      "984367891",
    ),
    { status: "not_registered" },
  );
});

test("regular verified accounts keep their partner-reported deposit amount", () => {
  assert.deepEqual(
    evaluatePocketGateStatus(
      { registered: true, hasDeposit: true, depositAmount: 200 },
      "123456789",
      "123456789",
    ),
    { status: "verified", depositAmount: 200 },
  );
});
