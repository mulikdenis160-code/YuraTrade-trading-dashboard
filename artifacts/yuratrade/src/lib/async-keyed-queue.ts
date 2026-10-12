export function createKeyedAsyncQueue() {
  type Turn = { priority: number; start: () => void };
  const queues = new Map<string, Turn[]>();
  return function run<T>(key: string, operation: () => Promise<T>, priority = 0): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const turn: Turn = { priority, start: () => {
        Promise.resolve().then(operation).then(resolve, reject).finally(() => {
          const waiting = queues.get(key)!;
          if (waiting.length === 0) { queues.delete(key); return; }
          // Highest priority first; equal-priority commands retain FIFO ordering.
          let next = 0;
          for (let i = 1; i < waiting.length; i++) {
            if (waiting[i].priority > waiting[next].priority) next = i;
          }
          waiting.splice(next, 1)[0].start();
        });
      } };
      const waiting = queues.get(key);
      if (waiting) waiting.push(turn);
      else { queues.set(key, []); turn.start(); }
    });
  };
}
