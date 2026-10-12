export type SocketIoEvent = { name: string; payload: unknown };
export type PocketFastHistory = {
  asset: string;
  periodSeconds: number | null;
  ticks: Array<{ time: number; price: number }>;
};

export function buildPocketAuthFrame(auth: string): string | null {
  const frame = auth.trim();
  if (!frame.startsWith("42")) return null;

  try {
    const packet: unknown = JSON.parse(frame.slice(2));
    if (
      !Array.isArray(packet) ||
      packet[0] !== "auth" ||
      !packet[1] ||
      typeof packet[1] !== "object" ||
      Array.isArray(packet[1])
    ) {
      return null;
    }
    return `42${JSON.stringify([
      "auth",
      {
        ...(packet[1] as Record<string, unknown>),
        platform: 2,
        isFastHistory: true,
        isOptimized: true,
      },
    ])}`;
  } catch {
    return null;
  }
}

export function pocketFeedUrlForAuth(auth: string): string | null {
  const frame = auth.trim();
  if (!frame.startsWith("42")) return null;

  try {
    const packet: unknown = JSON.parse(frame.slice(2));
    if (!Array.isArray(packet) || packet[0] !== "auth" || !packet[1] || typeof packet[1] !== "object") {
      return null;
    }
    const isDemo = (packet[1] as Record<string, unknown>).isDemo;
    if (isDemo === true || isDemo === 1 || isDemo === "1") {
      return "wss://demo-api-eu.po.market/socket.io/?EIO=4&transport=websocket";
    }
    if (isDemo === false || isDemo === 0 || isDemo === "0") {
      return "wss://api-eu.po.market/socket.io/?EIO=4&transport=websocket";
    }
  } catch {
    return null;
  }
  return null;
}

export function buildPocketSubscriptionFrames(
  symbol: string,
  periodSeconds: number,
): [string, string, string] {
  return [
    `42${JSON.stringify(["subscribeSymbol", symbol])}`,
    `42${JSON.stringify(["changeSymbol", { asset: symbol, period: periodSeconds }])}`,
    `42${JSON.stringify(["subfor", symbol])}`,
  ];
}

export function parsePocketSocketIoEvent(message: string): SocketIoEvent | null {
  if (!message.startsWith("42")) return null;
  try {
    const packet: unknown = JSON.parse(message.slice(2));
    if (!Array.isArray(packet) || typeof packet[0] !== "string") return null;
    return { name: packet[0], payload: packet[1] };
  } catch {
    return null;
  }
}

export function findPocketRows(
  value: unknown,
  isRow: (row: unknown[]) => boolean,
  depth = 0,
): unknown[][] | null {
  if (depth > 6) return null;
  if (Array.isArray(value)) {
    if (isRow(value)) return [value];
    const rows = value.filter(Array.isArray) as unknown[][];
    if (rows.some(isRow)) return rows;
    for (const child of value) {
      const found = findPocketRows(child, isRow, depth + 1);
      if (found) return found;
    }
  } else if (value && typeof value === "object") {
    for (const child of Object.values(value)) {
      const found = findPocketRows(child, isRow, depth + 1);
      if (found) return found;
    }
  }
  return null;
}

export function buildPocketHistoryRequest(
  asset: string,
  periodSeconds: number,
  requestTime: number,
  index: number,
  historyWindow: number,
) {
  return {
    asset,
    index,
    offset: historyWindow,
    period: periodSeconds,
    time: requestTime,
  };
}

export function parsePocketFastHistory(payload: unknown): PocketFastHistory | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;
  const record = payload as Record<string, unknown>;
  if (typeof record.asset !== "string" || !record.asset) return null;
  const period = Number(record.period);
  const rows = findPocketRows(
    record.history,
    (row) => row.length >= 2 && Number.isFinite(Number(row[0])) && Number.isFinite(Number(row[1])),
  );
  if (!rows) return null;
  const ticks = rows.flatMap((row) => {
    const time = Number(row[0]);
    const price = Number(row[1]);
    return Number.isFinite(time) && time > 0 && price > 0 ? [{ time, price }] : [];
  });
  if (ticks.length === 0) return null;
  return {
    asset: record.asset,
    periodSeconds: Number.isInteger(period) && period > 0 ? period : null,
    ticks,
  };
}
