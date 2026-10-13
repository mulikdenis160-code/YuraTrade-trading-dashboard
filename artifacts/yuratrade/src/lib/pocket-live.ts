import { createServerFn } from "@tanstack/react-start";
import { isValidExpirySeconds } from "./expiry";
import { pocketGateMiddleware } from "./pocket-gate.middleware";
import { RECOVERY_PREPARATION_TIMEOUT_MS } from "./signal-config";

export const loadFeed = createServerFn({ method: "GET" })
  .middleware([pocketGateMiddleware])
  .handler(async () => {
    const { feedSnapshot } = await import("./pocket-live.server");
    return feedSnapshot();
  });

export const readClose = createServerFn({ method: "POST" })
  .middleware([pocketGateMiddleware])
  .validator((input: { symbol: string }) => {
    const symbol = typeof input?.symbol === "string" ? input.symbol.trim() : "";
    if (!/^[#A-Za-z0-9._-]{2,32}$/.test(symbol)) throw new Error("Пара недоступна.");
    return { symbol };
  })
  .handler(async ({ data }) => {
    const { feedClose } = await import("./pocket-live.server");
    return { close: await feedClose(data.symbol) };
  });

export const takeSignal = createServerFn({ method: "POST" })
  .middleware([pocketGateMiddleware])
  .validator((input: {
    symbol: string;
    expirySeconds: number;
    recovery?: boolean;
    timeoutMs?: number;
  }) => {
    const symbol = typeof input?.symbol === "string" ? input.symbol.trim() : "";
    const expirySeconds = Number(input?.expirySeconds);
    const recovery = input?.recovery === true;
    const timeoutMs = input?.timeoutMs;
    if (timeoutMs !== undefined && (!Number.isFinite(timeoutMs) || timeoutMs < 1_000 || timeoutMs > RECOVERY_PREPARATION_TIMEOUT_MS)) {
      throw new Error("Недопустимый срок подготовки сигнала.");
    }
    if (!/^[#A-Za-z0-9._-]{2,32}$/.test(symbol) || !isValidExpirySeconds(expirySeconds)) {
      throw new Error("Выберите пару и срок экспирации от 30 секунд до 4 часов.");
    }
    return {
      symbol,
      expirySeconds,
      recovery,
      timeoutMs,
    };
  })
  .handler(async ({ data }) => {
    const { feedSignal } = await import("./pocket-live.server");
    return feedSignal(data.symbol, data.expirySeconds, { recovery: data.recovery, timeoutMs: data.timeoutMs });
  });

export const confirmSignalEntry = createServerFn({ method: "POST" })
  .middleware([pocketGateMiddleware])
  .validator((input: { symbol: string; expiresAtMs?: number }) => {
    const symbol = typeof input?.symbol === "string" ? input.symbol.trim() : "";
    if (!/^[#A-Za-z0-9._-]{2,32}$/.test(symbol)) throw new Error("Пара недоступна.");
    const expiresAtMs = input.expiresAtMs;
    if (expiresAtMs !== undefined && !Number.isFinite(expiresAtMs)) throw new Error("Окно входа недоступно.");
    return { symbol, expiresAtMs };
  })
  .handler(async ({ data }) => {
    const { feedConfirmSignalEntry } = await import("./pocket-live.server");
    return feedConfirmSignalEntry(data.symbol, data.expiresAtMs);
  });

export const chooseSignalPair = createServerFn({ method: "POST" })
  .middleware([pocketGateMiddleware])
  .validator((input: { excludedSymbols?: unknown }) => {
    const excludedSymbols = Array.isArray(input?.excludedSymbols)
      ? [...new Set(
          input.excludedSymbols
            .filter(
              (symbol): symbol is string =>
                typeof symbol === "string" && /^[#A-Za-z0-9._-]{2,32}$/.test(symbol.trim()),
            )
            .map((symbol) => symbol.trim()),
        )].slice(0, 24)
      : [];
    return { excludedSymbols };
  })
  .handler(async ({ data }) => {
    const { feedNextPair } = await import("./pocket-live.server");
    return feedNextPair(data.excludedSymbols);
  });

export const takeBest = createServerFn({ method: "POST" })
  .middleware([pocketGateMiddleware])
  .validator((input: { expirySeconds: number; excludedSymbols?: unknown }) => {
    const expirySeconds = Number(input?.expirySeconds);
    if (!isValidExpirySeconds(expirySeconds)) {
      throw new Error("Выберите срок экспирации от 30 секунд до 4 часов.");
    }
    const excludedSymbols = Array.isArray(input?.excludedSymbols)
      ? [...new Set(
          input.excludedSymbols
            .filter(
              (symbol): symbol is string =>
                typeof symbol === "string" && /^[#A-Za-z0-9._-]{2,32}$/.test(symbol.trim()),
            )
            .map((symbol) => symbol.trim()),
        )].slice(0, 24)
      : [];
    return { expirySeconds, excludedSymbols };
  })
  .handler(async ({ data }) => {
    const { feedBest } = await import("./pocket-live.server");
    return feedBest(data.expirySeconds, data.excludedSymbols);
  });
