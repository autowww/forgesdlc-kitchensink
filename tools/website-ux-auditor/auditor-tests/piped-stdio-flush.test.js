import assert from 'node:assert/strict';
import { ensureBlockingStdio } from '../lib/piped-stdio-flush.js';
import test from 'node:test';

test('ensureBlockingStdio is safe to call repeatedly', () => {
  assert.doesNotThrow(() => {
    ensureBlockingStdio();
    ensureBlockingStdio();
  });
});
