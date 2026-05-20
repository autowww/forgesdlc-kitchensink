import assert from 'node:assert/strict';
import test from 'node:test';

import { clampInt, mapLimit } from '../lib/map-limit.js';

test('mapLimit preserves order with concurrency', async () => {
  const order = [];
  const out = await mapLimit([1, 2, 3, 4, 5], 3, async (n) => {
    order.push(`start-${n}`);
    await new Promise((r) => setTimeout(r, 5 - n));
    order.push(`end-${n}`);
    return n * 10;
  });
  assert.deepEqual(out, [10, 20, 30, 40, 50]);
  assert.equal(order.filter((x) => x.startsWith('end')).length, 5);
});

test('clampInt bounds values', () => {
  assert.equal(clampInt(9, 1, 5, 3), 5);
  assert.equal(clampInt('2', 1, 5, 3), 2);
  assert.equal(clampInt('x', 1, 5, 3), 3);
});
