import { createServerFn } from "@tanstack/react-start";

export type PocketGateVerification =
  | "verified"
  | "invalid_id"
  | "not_registered"
  | "deposit_required"
  | "already_linked"
  | "telegram_required"
  | "rate_limited"
  | "check_unavailable";

export type PocketGateState =
  | { status: "verified"; pocketId: string }
  | { status: "unverified" | "telegram_required" | "check_unavailable" };

const readInitData = (input: { initData?: unknown } | undefined) =>
  typeof input?.initData === "string" && input.initData.length <= 10_000
    ? input.initData
    : "";

export const getPocketGateState = createServerFn({ method: "POST" })
  .validator((input: { initData?: unknown } | undefined) => ({
    initData: readInitData(input),
  }))
  .handler(async ({ data }): Promise<PocketGateState> => {
    const { getPocketGateStateForTelegram } = await import("./pocket-gate.server");
    return getPocketGateStateForTelegram(data.initData);
  });

export const verifyPocketAccount = createServerFn({ method: "POST" })
  .validator((input: { pocketId?: unknown; initData?: unknown } | undefined) => ({
    pocketId: typeof input?.pocketId === "string" ? input.pocketId.trim() : "",
    initData: readInitData(input),
  }))
  .handler(async ({ data }): Promise<PocketGateVerification> => {
    const { verifyPocketAccountForTelegram } = await import("./pocket-gate.server");
    return verifyPocketAccountForTelegram(data.pocketId, data.initData);
  });
