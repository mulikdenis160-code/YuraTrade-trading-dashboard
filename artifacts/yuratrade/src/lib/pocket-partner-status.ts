export type PocketPartnerStatus = {
  registered: boolean;
  hasDeposit: boolean;
  depositAmount: number | null;
};

function recordOf(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function positiveNumber(value: unknown): boolean {
  if (typeof value !== "number" && typeof value !== "string") return false;
  if (typeof value === "string" && value.trim() === "") return false;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0;
}

function nonNegativeAmount(value: unknown): number | null {
  if (typeof value !== "number" && typeof value !== "string") return null;
  if (typeof value === "string" && value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export function parsePocketPartnerStatus(
  payload: unknown,
  pocketOptionId: string,
): PocketPartnerStatus {
  const root = recordOf(payload);
  const user = root
    ? recordOf(root.user) ?? recordOf(root.data) ?? root
    : null;
  if (!user || !("uid" in user) || !("count_deposits" in user)) {
    throw new Error("Partner API response is missing required account status.");
  }

  return {
    registered: String(user.uid) === pocketOptionId,
    hasDeposit: positiveNumber(user.count_deposits),
    // sum_ftd is used only to choose a level; count_deposits remains the
    // separate requirement for granting access.
    depositAmount: nonNegativeAmount(user.sum_ftd),
  };
}
