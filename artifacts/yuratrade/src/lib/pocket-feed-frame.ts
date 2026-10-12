import { parsePocketFastCandles, type ParsedHistoryPage } from "./pocket-option-history.ts";

export type SocketIoEvent = { name: string; payload: unknown };
export type PocketHistoryResponse = {
  asset: string;
  data: unknown[];
  index?: number;
  periodSeconds?: number;
};

/** Socket.IO may send an event header followed by separate JSON attachments. */
export function createPocketEventDecoder() {
  let pending: { packet: unknown[]; count: number; attachments: unknown[] } | null = null;
  function replace(value: unknown, attachments: unknown[]): unknown {
    if (Array.isArray(value)) return value.map((child) => replace(child, attachments));
    if (value && typeof value === "object") {
      const record = value as Record<string, unknown>;
      if (record._placeholder === true && Number.isInteger(record.num)) {
        return attachments[record.num as number];
      }
      return Object.fromEntries(Object.entries(record).map(([key, child]) => [key, replace(child, attachments)]));
    }
    return value;
  }
  return (message: string): SocketIoEvent | null => {
    const header = /^45([1-9]\d*)-(\[.*)$/s.exec(message);
    if (header) {
      pending = null;
      try {
        const packet: unknown = JSON.parse(header[2]);
        const count = Number(header[1]);
        if (Array.isArray(packet) && typeof packet[0] === "string" && count <= 16) {
          pending = { packet, count, attachments: [] };
        }
      } catch { /* malformed header */ }
      return null;
    }
    if (message.startsWith("42")) {
      const event = parsePocketSocketIoEvent(message);
      // Inline quotes/control messages may arrive between a binary history
      // header and its JSON attachment. They must not discard that history.
      if (event?.name === "successauth" || event?.name === "NotAuthorized") pending = null;
      return event;
    }
    if (!pending || (!message.startsWith("[") && !message.startsWith("{"))) return null;
    try {
      pending.attachments.push(JSON.parse(message));
      if (pending.attachments.length < pending.count) return null;
      const packet = replace(pending.packet, pending.attachments) as unknown[];
      pending = null;
      return { name: packet[0] as string, payload: packet[1] };
    } catch {
      pending = null;
      return null;
    }
  };
}
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

export function buildPocketQuoteSubscriptionFrames(symbol: string): string[] {
  return [
    `42${JSON.stringify(["subscribeSymbol", symbol])}`,
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

export function parsePocketHistoryResponse(
  message: string,
): PocketHistoryResponse | null {
  let payload: unknown;
  if (message.startsWith("42")) {
    payload = parsePocketSocketIoEvent(message)?.payload;
  } else if (message.startsWith("{")) {
    try {
      payload = JSON.parse(message);
    } catch {
      return null;
    }
  } else {
    return null;
  }
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;
  const response = payload as Record<string, unknown>;
  if (typeof response.asset !== "string" || !response.asset || !Array.isArray(response.data)) {
    return null;
  }
  return {
    asset: response.asset,
    data: response.data,
    ...(typeof response.index === "number" && Number.isFinite(response.index) ? { index: response.index } : {}),
    ...(typeof response.period === "number" && Number.isFinite(response.period) ? { periodSeconds: response.period } : {}),
  };
}

export function pocketHistoryMatchesRequest(
  response: PocketHistoryResponse,
  request: { asset: string; index: number; periodSeconds: number },
): boolean {
  return response.asset === request.asset &&
    (response.index === undefined || response.index === request.index) &&
    (response.periodSeconds === undefined || response.periodSeconds === request.periodSeconds);
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

export function parsePocketFastCandleHistory(payload: unknown): {
  asset: string;
  periodSeconds: number;
  history: ParsedHistoryPage;
} | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;
  const record = payload as Record<string, unknown>;
  const periodSeconds = Number(record.period);
  if (typeof record.asset !== "string" || !record.asset ||
      !Number.isInteger(periodSeconds) || periodSeconds <= 0 || !Array.isArray(record.candles)) return null;
  const history = parsePocketFastCandles(record.candles);
  return history.candles.length > 0 ? { asset: record.asset, periodSeconds, history } : null;
}
