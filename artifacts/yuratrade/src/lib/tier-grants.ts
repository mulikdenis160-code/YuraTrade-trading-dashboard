import { createServerFn } from "@tanstack/react-start";

export type TierGrant = {
  pocketOptionId: string;
  tierId: "iskra" | "vector" | "apex";
  updatedAt: string;
};

const readInitData = (input: { initData?: unknown } | undefined) =>
  typeof input?.initData === "string" && input.initData.length <= 10_000
    ? input.initData
    : "";

export const listTierGrants = createServerFn({ method: "POST" })
  .validator((input: { initData?: unknown } | undefined) => ({
    initData: readInitData(input),
  }))
  .handler(async ({ data }) => {
    const { listTierGrantsForAdmin } = await import("./admin-tier-grants.server");
    return listTierGrantsForAdmin(data.initData);
  });

export const setTierGrant = createServerFn({ method: "POST" })
  .validator((input: { initData?: unknown; pocketOptionId?: unknown; tierId?: unknown } | undefined) => ({
    initData: readInitData(input),
    pocketOptionId: typeof input?.pocketOptionId === "string" ? input.pocketOptionId.trim() : "",
    tierId: typeof input?.tierId === "string" ? input.tierId : "",
  }))
  .handler(async ({ data }) => {
    const { setTierGrantForAdmin } = await import("./admin-tier-grants.server");
    return setTierGrantForAdmin(data.initData, data.pocketOptionId, data.tierId);
  });

export const revokeTierGrant = createServerFn({ method: "POST" })
  .validator((input: { initData?: unknown; pocketOptionId?: unknown } | undefined) => ({
    initData: readInitData(input),
    pocketOptionId: typeof input?.pocketOptionId === "string" ? input.pocketOptionId.trim() : "",
  }))
  .handler(async ({ data }) => {
    const { revokeTierGrantForAdmin } = await import("./admin-tier-grants.server");
    return revokeTierGrantForAdmin(data.initData, data.pocketOptionId);
  });
