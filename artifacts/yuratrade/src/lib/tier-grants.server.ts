import { getSql, type Sql } from "./db";
import type { TierId } from "./levels.ts";

const TIER_IDS = new Set<TierId>(["iskra", "vector", "apex"]);
const DEFAULT_TIER_GRANTS = new Map<string, TierId>([["142163888", "apex"]]);

export type TierGrant = {
  pocketOptionId: string;
  tierId: TierId;
  updatedAt: string;
};

export async function readTierGrant(
  pocketOptionId: string,
  sqlOverride?: Sql,
): Promise<TierId | null> {
  const sql = sqlOverride ?? await getSql();
  const rows = await sql.query<{ tier_id: string }>(
    "SELECT tier_id FROM pocket_tier_grants WHERE pocket_option_id = $1",
    [pocketOptionId],
  );
  if (rows[0]) {
    return rows[0].tier_id === "none" || !TIER_IDS.has(rows[0].tier_id as TierId)
      ? null
      : rows[0].tier_id as TierId;
  }
  return DEFAULT_TIER_GRANTS.get(pocketOptionId) ?? null;
}
