export function createKeyedAsyncQueue() {
  const tails = new Map<string, Promise<void>>();

  return async function run<T>(key: string, operation: () => Promise<T>): Promise<T> {
    const previous = tails.get(key) ?? Promise.resolve();
    let releaseTurn: () => void = () => {};
    const turn = new Promise<void>((resolve) => {
      releaseTurn = resolve;
    });
    const tail = previous.then(() => turn);
    tails.set(key, tail);

    await previous;
    try {
      return await operation();
    } finally {
      releaseTurn();
      if (tails.get(key) === tail) tails.delete(key);
    }
  };
}
