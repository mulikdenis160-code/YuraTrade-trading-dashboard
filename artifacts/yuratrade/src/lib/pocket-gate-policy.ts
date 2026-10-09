import { isAdminId } from "./pocket-admin.ts";
import type { PocketPartnerStatus } from "./pocket-partner-status.ts";

export type PocketGatePolicyResult =
  | { status: "verified"; depositAmount: number }
  | { status: "not_registered" }
  | { status: "deposit_required" }
  | { status: "check_unavailable" };

export function evaluatePocketGateStatus(
  partnerStatus: PocketPartnerStatus,
  pocketOptionId: string,
  telegramUserId: string,
): PocketGatePolicyResult {
  if (isAdminId(pocketOptionId)) {
    return { status: "verified", depositAmount: 0 };
  }
  if (!partnerStatus.registered) return { status: "not_registered" };

  if (!partnerStatus.hasDeposit) {
    return { status: "deposit_required" };
  }
  if (partnerStatus.depositAmount === null) {
    return { status: "check_unavailable" };
  }

  return {
    status: "verified",
    depositAmount: partnerStatus.depositAmount ?? 0,
  };
}
