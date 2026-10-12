// Recovery stays inside the original request deadline. The caller keeps the
// same request ID and chart lock so a late first response is still usable.
export function scheduleHistoryRecovery(options: {
  timeoutMs: number;
  retry: (() => void) | null;
  expire: () => void;
  fail: (error: unknown) => void;
}) {
  let stopped = false;
  let retryTimer: ReturnType<typeof setTimeout> | undefined;
  const deadlineTimer = setTimeout(() => {
    if (stopped) return;
    stop();
    options.expire();
  }, options.timeoutMs);
  function stop() {
    stopped = true;
    clearTimeout(deadlineTimer);
    clearTimeout(retryTimer);
  }
  if (options.retry) retryTimer = setTimeout(() => {
    if (stopped) return;
    try { options.retry?.(); }
    catch (error) { stop(); options.fail(error); }
  }, Math.min(2_500, options.timeoutMs / 2));
  return { timer: deadlineTimer, stop };
}
