export type SettledSignalRequest<T> =
  | { ok: true; value: T }
  | { ok: false; error: unknown };

export function settleSignalRequest<T>(
  request: Promise<T>,
): Promise<SettledSignalRequest<T>> {
  return request.then(
    (value) => ({ ok: true, value }),
    (error: unknown) => ({ ok: false, error }),
  );
}

export function waitForSignalRequest<T>(
  request: Promise<SettledSignalRequest<T>>,
  timeoutMs: number,
  timeoutMessage: string,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const completed = request.then((outcome) => {
    if (outcome.ok) return outcome.value;
    throw outcome.error;
  });
  const timedOut = new Promise<T>((_, reject) => {
    timer = setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
  });

  return Promise.race([completed, timedOut]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}
