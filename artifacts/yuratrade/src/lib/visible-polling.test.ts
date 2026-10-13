import assert from "node:assert/strict";
import test from "node:test";
import { startVisiblePolling } from "./visible-polling.ts";

test("visible polling pauses in the background and resumes when visible", () => {
  const previousDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const listeners = new Set<() => void>();
  const intervals = new Map<number, () => void>();
  let visibility: DocumentVisibilityState = "hidden";
  let nextIntervalId = 0;
  let calls = 0;

  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      get visibilityState() { return visibility; },
      addEventListener: (_type: string, listener: () => void) => listeners.add(listener),
      removeEventListener: (_type: string, listener: () => void) => listeners.delete(listener),
    },
  });
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      setInterval: (callback: () => void) => {
        const id = ++nextIntervalId;
        intervals.set(id, callback);
        return id;
      },
      clearInterval: (id: number) => intervals.delete(id),
    },
  });

  try {
    const stop = startVisiblePolling(() => { calls += 1; }, 8_000);
    assert.equal(calls, 0);
    intervals.get(1)?.();
    assert.equal(calls, 0);

    visibility = "visible";
    for (const listener of listeners) listener();
    assert.equal(calls, 1);
    intervals.get(1)?.();
    assert.equal(calls, 2);

    stop();
    assert.equal(listeners.size, 0);
    assert.equal(intervals.size, 0);
  } finally {
    if (previousDocument) Object.defineProperty(globalThis, "document", previousDocument);
    else Reflect.deleteProperty(globalThis, "document");
    if (previousWindow) Object.defineProperty(globalThis, "window", previousWindow);
    else Reflect.deleteProperty(globalThis, "window");
  }
});
