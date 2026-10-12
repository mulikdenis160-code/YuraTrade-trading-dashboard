export type AiFailureCode = "ai_rate_limited" | "ai_quota_exhausted" | "ai_unavailable" | "ai_busy" | "ai_timeout" | "ai_configuration" | "ai_invalid_response";
export type SignalServiceFailure = {
  decision: "pass";
  reason: string;
  retryAcrossPairs: false;
  failureCode: AiFailureCode;
  retryAfterMs: number;
};

export class MarketAiServiceError extends Error {
  code: AiFailureCode;
  retryAfterMs: number;
  status?: number;
  retryDelayProvided: boolean;
  constructor(code: AiFailureCode, message: string, retryAfterMs = 0, status?: number, retryDelayProvided = false) {
    super(message);
    this.code = code;
    this.retryAfterMs = retryAfterMs;
    this.status = status;
    this.retryDelayProvided = retryDelayProvided;
    this.name = "MarketAiServiceError";
  }
  toResult(): SignalServiceFailure {
    return { decision: "pass", reason: this.message, retryAcrossPairs: false,
      failureCode: this.code, retryAfterMs: this.retryAfterMs };
  }
}

const record = (value: unknown): Record<string, unknown> | undefined =>
  value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : undefined;
const failureCodes = new Set<AiFailureCode>(["ai_rate_limited", "ai_quota_exhausted", "ai_unavailable", "ai_busy", "ai_timeout", "ai_configuration", "ai_invalid_response"]);

/** Parse only provider status/retry metadata; never expose raw error bodies. */
export function marketAiFailure(error: unknown): MarketAiServiceError {
  if (error instanceof MarketAiServiceError) return error;
  const source = record(error);
  // A controller retained across server HMR may hold errors from an older module.
  if (source?.name === "MarketAiServiceError" && failureCodes.has(source.code as AiFailureCode) &&
      typeof source.message === "string" && typeof source.retryAfterMs === "number" &&
      Number.isFinite(source.retryAfterMs) && source.retryAfterMs >= 0) {
    return new MarketAiServiceError(source.code as AiFailureCode, source.message, source.retryAfterMs,
      typeof source.status === "number" ? source.status : undefined, source.retryDelayProvided === true);
  }
  let body = source;
  if (typeof source?.message === "string") {
    try { body = record(JSON.parse(source.message)) ?? source; } catch { /* SDK/network text */ }
  }
  const detail = record(body?.error) ?? body;
  const status = Number(source?.status ?? source?.statusCode ?? detail?.code);
  const details = Array.isArray(detail?.details) ? detail.details.map(record).filter(Boolean) : [];
  const retry = details.find(item => String(item?.["@type"]).endsWith("RetryInfo"));
  const parsedDelay = typeof retry?.retryDelay === "string" && /^(\d+(?:\.\d+)?)s$/.test(retry.retryDelay)
    ? Math.ceil(parseFloat(retry.retryDelay) * 1000) : 0;
  const delay = Number.isFinite(parsedDelay) ? parsedDelay : 0;
  const violations = details.flatMap(item => Array.isArray(item?.violations) ? item.violations : []).map(record);
  const exhausted = violations.some(item => item?.quotaValue === "0" || item?.quotaValue === 0 || /PerDay/i.test(String(item?.quotaId)));
  if (status === 429) return new MarketAiServiceError(exhausted ? "ai_quota_exhausted" : "ai_rate_limited",
    exhausted ? "Квота Gemini исчерпана или недоступна. Проверьте лимиты проекта Google AI Studio."
      : "Gemini временно ограничил запросы. Дождитесь окончания паузы и повторите попытку.",
    delay || 60_000, status, delay > 0);
  if ([400, 401, 403, 404].includes(status)) return new MarketAiServiceError("ai_configuration",
    "Gemini отклонил запрос. Проверьте ключ, доступ к модели и настройки подключения.", 0, status);
  const name = error instanceof Error ? error.name : "";
  if ([408, 504].includes(status) || /timeout|abort/i.test(name)) return new MarketAiServiceError("ai_timeout",
    "Не удалось получить ответ от ИИ за отведённое время. Сигнал не выдан.");
  const networkCode = String(record(source?.cause)?.code ?? source?.code ?? "");
  if (status >= 500 || /connection|fetch/i.test(name) || /ECONN|EAI_AGAIN|ETIMEDOUT/.test(networkCode)) {
    return new MarketAiServiceError("ai_unavailable", "Сервис Gemini временно недоступен. Повторите попытку после паузы.", delay || 5_000, Number.isFinite(status) ? status : undefined, delay > 0);
  }
  return new MarketAiServiceError("ai_invalid_response", "Не удалось завершить анализ Gemini. Сигнал не выдан.");
}

export function retryAfterMilliseconds(value: string | null, nowMs = Date.now()): number | null {
  if (!value) return null;
  if (/^\d+(?:\.\d+)?$/.test(value.trim())) {
    const delay = Math.ceil(Number(value) * 1000);
    return Number.isFinite(delay) ? delay : null;
  }
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? Math.max(0, timestamp - nowMs) : null;
}

function pause(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    signal?.throwIfAborted();
    const finish = () => { signal?.removeEventListener("abort", abort); resolve(); };
    const timer = setTimeout(finish, ms);
    const abort = () => { clearTimeout(timer); signal?.removeEventListener("abort", abort); reject(signal?.reason); };
    signal?.addEventListener("abort", abort, { once: true });
  });
}

export function createMarketAiController(options: {
  now?: () => number;
  sleep?: (ms: number, signal?: AbortSignal) => Promise<void>;
} = {}) {
  const now = options.now ?? Date.now;
  const sleep = options.sleep ?? pause;
  let active = false;
  let until = 0;
  let previous: MarketAiServiceError | undefined;
  const requests = new Map<string, Promise<unknown>>();
  function unavailable(): MarketAiServiceError | undefined {
    if (previous && now() < until) return new MarketAiServiceError(previous.code, previous.message, until - now(), previous.status, true);
    if (active) return new MarketAiServiceError("ai_busy", "Анализ уже выполняется. Повторите запрос через несколько секунд.", 1_000);
    return undefined;
  }
  async function run<T>(key: string, operation: (remainingMs: number) => Promise<T>, deadlineAtMs: number, signal?: AbortSignal): Promise<T> {
    const same = requests.get(key);
    if (same) return same as Promise<T>;
    const blocked = unavailable();
    if (blocked) throw blocked;
    active = true;
    const task = (async () => {
      // Defer execution until the in-flight map is populated, including sync failures.
      await Promise.resolve();
      try {
        for (let attempt = 0; ; attempt += 1) {
          signal?.throwIfAborted();
          if (now() >= deadlineAtMs) throw new MarketAiServiceError("ai_timeout", "Не удалось получить ответ от ИИ за отведённое время. Сигнал не выдан.");
          try { return await operation(Math.max(1, deadlineAtMs - now())); }
          catch (error) {
            const failure = marketAiFailure(error);
            // One short transient retry, within the original budget. Never retry quota/auth errors.
            const retryDelay = failure.retryDelayProvided ? failure.retryAfterMs : 1_000;
            if (attempt === 0 && failure.code === "ai_unavailable" && retryDelay <= 2_000 &&
                now() + retryDelay + 3_000 < deadlineAtMs && !signal?.aborted) {
              await sleep(retryDelay, signal);
              continue;
            }
            if (failure.code === "ai_rate_limited" || failure.code === "ai_quota_exhausted" || failure.code === "ai_unavailable") {
              previous = failure;
              until = now() + failure.retryAfterMs;
            }
            throw failure;
          }
        }
      } finally { active = false; requests.delete(key); }
    })();
    requests.set(key, task);
    return task;
  }
  return { run, unavailable };
}
