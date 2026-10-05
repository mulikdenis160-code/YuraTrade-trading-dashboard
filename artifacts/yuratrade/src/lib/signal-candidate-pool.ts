export function createRotatingCandidateSelector<T>(batchSize: number) {
  if (!Number.isInteger(batchSize) || batchSize < 1) {
    throw new Error("Candidate batch size must be a positive integer.");
  }

  let offset = 0;

  return (items: T[]) => {
    if (items.length === 0) return [];
    const size = Math.min(batchSize, items.length);
    const start = offset % items.length;
    offset = (start + size) % items.length;
    return Array.from({ length: size }, (_, index) => items[(start + index) % items.length]);
  };
}
