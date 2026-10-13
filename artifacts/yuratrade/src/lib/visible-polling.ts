export function startVisiblePolling(
  callback: () => void,
  intervalMs: number,
): () => void {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return () => {};
  }

  let stopped = false;
  const runIfVisible = () => {
    if (!stopped && document.visibilityState === "visible") callback();
  };

  runIfVisible();
  const timer = window.setInterval(runIfVisible, intervalMs);
  document.addEventListener("visibilitychange", runIfVisible);

  return () => {
    stopped = true;
    window.clearInterval(timer);
    document.removeEventListener("visibilitychange", runIfVisible);
  };
}
