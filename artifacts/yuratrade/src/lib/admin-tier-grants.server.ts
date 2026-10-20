import { getSql } from "./db";
import { requireVerifiedPocketAccess } from "./pocket-gate.server";
import { isAdminId, isValidPocketOptionId } from "./pocket-admin.ts";
import type { TierId } from "./levels.ts";
import type { TierGrant } from "./tier-grants.server";

const TIER_IDS = new Set<TierId>(["iskra", "vector", "apex"]);
const DEFAULT_TIER_GRANTS = new Map<string, TierId>([["142163888", "apex"]]);

async function requireAdmin(initData: string) {
  const identity = await requireVerifiedPocketAccess(initData);
  if (!isAdminId(identity.pocketOptionId)) throw new Error("Administrator access required.");
  return identity;
}

export async function listTierGrantsForAdmin(initData: string): Promise<TierGrant[]> {
  await requireAdmin(initData);
  const sql = await getSql();
  const rows = await sql.query<{ pocket_option_id: string; tier_id: string; updated_at: string }>(
    "SELECT pocket_option_id, tier_id, updated_at FROM pocket_tier_grants ORDER BY updated_at DESC",
  );
  const grants = new Map<string, TierGrant>();
  for (const [pocketOptionId, tierId] of DEFAULT_TIER_GRANTS) {
    grants.set(pocketOptionId, { pocketOptionId, tierId, updatedAt: "default" });
  }
  for (const row of rows) {
    if (row.tier_id === "none") {
      grants.delete(row.pocket_option_id);
    } else if (TIER_IDS.has(row.tier_id as TierId)) {
      grants.set(row.pocket_option_id, {
        pocketOptionId: row.pocket_option_id,
        tierId: row.tier_id as TierId,
        updatedAt: row.updated_at,
      });
    }
  }
  return [...grants.values()].sort((a, b) => a.pocketOptionId.localeCompare(b.pocketOptionId));
}

export async function setTierGrantForAdmin(
  initData: string,
  pocketOptionId: string,
  tierId: string,
) {
  const admin = await requireAdmin(initData);
  if (!isValidPocketOptionId(pocketOptionId) || pocketOptionId.length !== 9) {
    throw new Error("Enter a valid 9-digit Pocket Option ID.");
  }
  if (!TIER_IDS.has(tierId as TierId)) throw new Error("Choose a valid plan.");
  const sql = await getSql();
  await sql.query(
    `INSERT INTO pocket_tier_grants (pocket_option_id, tier_id, granted_by_telegram_id)
     VALUES ($1, $2, $3)
     ON CONFLICT (pocket_option_id) DO UPDATE
       SET tier_id = EXCLUDED.tier_id,
           granted_by_telegram_id = EXCLUDED.granted_by_telegram_id,
           updated_at = now()`,
    [pocketOptionId, tierId, admin.telegramUserId],
  );
  return { pocketOptionId, tierId: tierId as TierId };
}

export async function revokeTierGrantForAdmin(initData: string, pocketOptionId: string) {
  const admin = await requireAdmin(initData);
  if (!isValidPocketOptionId(pocketOptionId) || pocketOptionId.length !== 9) {
    throw new Error("Invalid Pocket Option ID.");
  }
  const sql = await getSql();
  if (DEFAULT_TIER_GRANTS.has(pocketOptionId)) {
    await sql.query(
      `INSERT INTO pocket_tier_grants (pocket_option_id, tier_id, granted_by_telegram_id)
       VALUES ($1, 'none', $2)
       ON CONFLICT (pocket_option_id) DO UPDATE
         SET tier_id = 'none',
             granted_by_telegram_id = EXCLUDED.granted_by_telegram_id,
             updated_at = now()`,
      [pocketOptionId, admin.telegramUserId],
    );
    return;
  }
  await sql.query("DELETE FROM pocket_tier_grants WHERE pocket_option_id = $1", [pocketOptionId]);
}
