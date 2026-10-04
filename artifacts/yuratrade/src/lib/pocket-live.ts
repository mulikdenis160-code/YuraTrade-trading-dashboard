import { createServerFn } from "@tanstack/react-start";

const periods = [60, 120, 180, 300, 900];

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
  .validator((input: { symbol: string; seconds: number }) => {
    const symbol = typeof input?.symbol === "string" ? input.symbol.trim() : "";
    const seconds = periods.includes(input?.seconds) ? input.seconds : 0;
    if (!/^[#A-Za-z0-9._-]{2,32}$/.test(symbol) || !seconds) throw new Error("Выберите пару и срок.");
    return { symbol, seconds };
  })
  .handler(async ({ data }) => {
    const { feedSignal } = await import("./pocket-live.server");
    return feedSignal(data.symbol, data.seconds);
  });

export const takeBest = createServerFn({ method: "POST" }).handler(async () => {
  const { feedBest } = await import("./pocket-live.server");
  return feedBest();
});
