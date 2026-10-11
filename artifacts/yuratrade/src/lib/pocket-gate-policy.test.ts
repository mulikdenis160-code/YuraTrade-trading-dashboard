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

test("configured Pocket Option admins do not need a partner record or deposit", () => {
  assert.deepEqual(
    evaluatePocketGateStatus(
      { ...noDeposit, registered: false },
      "984367891",
      "123456789",
    ),
    { status: "verified", depositAmount: 0 },
  );
});

test("every configured Pocket Option admin ID bypasses partner and deposit checks", () => {
  assert.deepEqual(
    evaluatePocketGateStatus(
      { ...noDeposit, registered: false },
      "113510708",
      "123456789",
    ),
    { status: "verified", depositAmount: 0 },
  );
  assert.deepEqual(
    evaluatePocketGateStatus(noDeposit, "92535291", "123456789"),
    { status: "verified", depositAmount: 0 },
  );
  assert.deepEqual(
    evaluatePocketGateStatus(noDeposit, "987651256", "123456789"),
    { status: "verified", depositAmount: 0 },
  );
  assert.deepEqual(
    evaluatePocketGateStatus(noDeposit, "123456789", "984367891"),
    { status: "deposit_required" },
  );
});

test("the standard partner gate policy denies absent non-admin IDs", () => {
  assert.deepEqual(
    evaluatePocketGateStatus(
      { ...noDeposit, registered: false },
      "123456789",
      "123456789",
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
