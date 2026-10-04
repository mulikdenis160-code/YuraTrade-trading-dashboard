import { createServerFn } from "@tanstack/react-start";
import { isValidExpirySeconds } from "./expiry";

export const loadFeed = createServerFn({ method: "GET" }).handler(async () => {
  const { feedSnapshot } = await import("./pocket-live.server");
  return feedSnapshot();
});

export const readClose = createServerFn({ method: "POST" })
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
  .validator((input: { symbol: string; expirySeconds: number }) => {
    const symbol = typeof input?.symbol === "string" ? input.symbol.trim() : "";
    const expirySeconds = Number(input?.expirySeconds);
    if (!/^[#A-Za-z0-9._-]{2,32}$/.test(symbol) || !isValidExpirySeconds(expirySeconds)) {
      throw new Error("Выберите пару и срок экспирации от 1 минуты до 4 часов.");
    }
    return { symbol, expirySeconds };
  })
  .handler(async ({ data }) => {
    const { feedSignal } = await import("./pocket-live.server");
    return feedSignal(data.symbol, data.expirySeconds);
  });

export const takeBest = createServerFn({ method: "POST" })
  .validator((input: { expirySeconds: number }) => {
    const expirySeconds = Number(input?.expirySeconds);
    if (!isValidExpirySeconds(expirySeconds)) {
      throw new Error("Выберите срок экспирации от 1 минуты до 4 часов.");
    }
    return { expirySeconds };
  })
  .handler(async ({ data }) => {
    const { feedBest } = await import("./pocket-live.server");
    return feedBest(data.expirySeconds);
  });
