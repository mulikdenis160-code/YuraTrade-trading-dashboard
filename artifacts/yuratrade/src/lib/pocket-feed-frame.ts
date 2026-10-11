export type SocketIoEvent = { name: string; payload: unknown };

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
