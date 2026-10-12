import { settleSignalRequest, waitForSignalRequest } from "./signal-request.ts";

type Pass = { decision: "pass"; reason: string; retryAcrossPairs?: boolean; retryAfterMs?: number };

/** Keep pair fallback within one budget; a provider failure stops the search. */
export async function searchSignalPairs<P extends { symbol: string }, S extends { decision: "signal" }>(options: {
  choose: (excluded: string[]) => Promise<P>;
  prepare: (pair: P) => Promise<S | Pass>;
  excluded: string[];
  maxPairs: number;
  deadlineAtMs: number;
  timeoutMessage: string;
  cancelled?: () => boolean;
  now?: () => number;
  onSkip?: (symbol: string, reason: string) => void;
}): Promise<{ decision: "signal"; pair: P; prepared: S } | Pass> {
  const now = options.now ?? Date.now;
  const checked = new Set<string>();
  let last: Pass = { decision: "pass", reason: "Сигнал не найден." };
  function budget() {
    if (options.cancelled?.()) throw new DOMException("Signal search cancelled", "AbortError");
    const remaining = options.deadlineAtMs - now();
    if (remaining <= 0) throw new Error(options.timeoutMessage);
    return remaining;
  }
  for (let index = 0; index < options.maxPairs; index += 1) {
    const chooseBudget = budget();
    const pair = await waitForSignalRequest(settleSignalRequest(options.choose([...options.excluded, ...checked])), chooseBudget, options.timeoutMessage);
    budget();
    if (checked.has(pair.symbol)) break;
    checked.add(pair.symbol);
    let result: S | Pass;
    try {
      const prepareBudget = budget();
      result = await waitForSignalRequest(settleSignalRequest(options.prepare(pair)), prepareBudget, options.timeoutMessage);
    } catch (error) {
      budget();
      // Expected pair failures arrive as data. RPC/unknown failures stop here.
      throw error;
    }
    budget();
    if (result.decision === "signal") return { decision: "signal", pair, prepared: result };
    last = result;
    if (result.retryAcrossPairs === false) return result;
    options.onSkip?.(pair.symbol, result.reason);
  }
  return last;
}
