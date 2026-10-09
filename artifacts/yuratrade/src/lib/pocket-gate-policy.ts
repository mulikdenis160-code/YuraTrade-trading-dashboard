import { isAdminId } from "./pocket-admin.ts";
import { isTelegramAdminForPocketId } from "./telegram-admin.ts";
import type { PocketPartnerStatus } from "./pocket-partner-status.ts";

export type PocketGatePolicyResult =
  | { status: "verified"; depositAmount: number }
  | { status: "not_registered" | "deposit_required" | "check_unavailable" };

export function evaluatePocketGateStatus(
  partnerStatus: PocketPartnerStatus,
  pocketOptionId: string,
  telegramUserId: string,
): PocketGatePolicyResult {
  if (!partnerStatus.registered) return { status: "not_registered" };

  const admin = isAdminId(pocketOptionId) ||
    isTelegramAdminForPocketId(telegramUserId, pocketOptionId);
  if (!partnerStatus.hasDeposit && !admin) {
    return { status: "deposit_required" };
  }
  if (partnerStatus.depositAmount === null && !admin) {
    return { status: "check_unavailable" };
  }

  return {
    status: "verified",
    depositAmount: partnerStatus.depositAmount ?? 0,
  };
}
