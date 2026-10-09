const TELEGRAM_ADMIN_POCKET_IDS: Readonly<Record<string, string>> = {
  "984367891": "984367891",
};

export function isTelegramAdminForPocketId(
  telegramUserId: number | string | null | undefined,
  pocketOptionId: string,
): boolean {
  if (telegramUserId === null || telegramUserId === undefined) return false;
  return TELEGRAM_ADMIN_POCKET_IDS[String(telegramUserId)] === pocketOptionId;
}

export function telegramAdminBypassForExactPair(
  telegramUserId: number | string | null | undefined,
  pocketOptionId: string,
): {
  status: "verified";
  pocketId: string;
  depositAmount: 0;
} | null {
  return isTelegramAdminForPocketId(telegramUserId, pocketOptionId)
    ? { status: "verified", pocketId: pocketOptionId, depositAmount: 0 }
    : null;
}
