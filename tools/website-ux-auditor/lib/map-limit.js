/**
 * Run async mapper over items with bounded concurrency.
 * @template T, R
 * @param {T[]} items
 * @param {number} limit
 * @param {(item: T, index: number) => Promise<R>} fn
 * @returns {Promise<R[]>} results in original item order
 */
export async function mapLimit(items, limit, fn) {
  const list = Array.isArray(items) ? items : [];
  const cap = Math.max(1, Math.floor(Number(limit) || 1));
  if (!list.length) return [];
  /** @type {R[]} */
  const results = new Array(list.length);
  let nextIndex = 0;

  async function worker() {
    while (true) {
      const i = nextIndex;
      nextIndex += 1;
      if (i >= list.length) break;
      results[i] = await fn(list[i], i);
    }
  }

  const workers = Array.from({ length: Math.min(cap, list.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

export function clampInt(n, min, max, fallback) {
  const x = Number(n);
  if (!Number.isFinite(x)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(x)));
}
