import { isAdminId } from "./pocket-admin.ts";

export function telegramAdminBypassForPocketId(
  pocketOptionId: string,
): {
  status: "verified";
  pocketId: string;
  depositAmount: 0;
} | null {
  return isAdminId(pocketOptionId)
    ? { status: "verified", pocketId: pocketOptionId, depositAmount: 0 }
    : null;
}
