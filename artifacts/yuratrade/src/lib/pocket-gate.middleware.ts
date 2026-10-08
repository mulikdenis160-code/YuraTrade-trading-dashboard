import { createMiddleware } from "@tanstack/react-start";
import { getTelegramInitData } from "./telegram-webapp";

export const pocketGateMiddleware = createMiddleware({ type: "function" })
  .client(async ({ next }) => {
    return next({
      sendContext: { pocketGateInitData: getTelegramInitData() },
    });
  })
  .server(async ({ next, context }) => {
    const { requireVerifiedPocketAccess } = await import("./pocket-gate.server");
    const identity = await requireVerifiedPocketAccess(context.pocketGateInitData);
    return next({ context: { pocketGateIdentity: identity } });
  });
