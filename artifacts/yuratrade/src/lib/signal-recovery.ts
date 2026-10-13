import { RECOVERY_PREPARATION_TIMEOUT_MS, RECOVERY_SEARCH_TIMEOUT_MS } from "./signal-config.ts";
import { settleSignalRequest, waitForSignalRequest } from "./signal-request.ts";

type Pass = { decision: "pass"; reason: string; failureCode?: string; retryAcrossPairs?: boolean; retryAfterMs?: number };

export async function prepareRecovery<S extends { decision: "signal" }>(options: {
  prepare: (timeoutMs: number) => Promise<S | Pass>;
  timeoutMessage: string;
  cancelled?: () => boolean;
  now?: () => number;
  delay?: (ms: number) => Promise<void>;
}): Promise<S | Pass> {
  const now = options.now ?? Date.now;
  const deadline = now() + RECOVERY_SEARCH_TIMEOUT_MS;
  const delay = options.delay ?? (ms => new Promise(resolve => setTimeout(resolve, ms)));
  function remaining() {
    if (options.cancelled?.()) throw new DOMException("Recovery cancelled", "AbortError");
    const ms = deadline - now();
    if (ms <= 0) throw new Error(options.timeoutMessage);
    return ms;
  }
  for (let attempt = 0; ; attempt++) {
    // Allow the server's bounded result to cross the network before the
    // browser's timer expires, while retaining the overall search deadline.
    const budget = Math.min(RECOVERY_PREPARATION_TIMEOUT_MS, remaining() - 1_000);
    if (budget < 1_000) throw new Error(options.timeoutMessage);
    const result = await waitForSignalRequest(settleSignalRequest(options.prepare(budget)), budget + 1_000, options.timeoutMessage);
    remaining();
    if (result.decision === "signal" || attempt === 1) return result;
    const transient = ["ai_timeout", "ai_unavailable", "ai_busy"].includes(result.failureCode ?? "");
    if (!transient && result.retryAcrossPairs !== true) return result;
    const pause = Math.max(1_000, result.retryAfterMs ?? 1_000);
    if (!Number.isFinite(pause) || pause > 5_000 || remaining() - pause < 2_000) return result;
    await delay(pause);
    remaining();
  }
}
