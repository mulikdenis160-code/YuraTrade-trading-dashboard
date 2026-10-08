export type PocketPartnerStatus = {
  registered: boolean;
  hasDeposit: boolean;
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
    // Use the explicit confirmed-deposit count; sum_ftd is not part of the
    // documented contract available to this app.
    hasDeposit: positiveNumber(user.count_deposits),
  };
}
