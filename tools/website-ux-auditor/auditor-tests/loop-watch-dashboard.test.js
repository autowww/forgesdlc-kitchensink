import assert from 'node:assert/strict';
import test from 'node:test';

import { buildWatchFrameRedrawSequence } from '../lib/loop-watch-redraw.js';

test('buildWatchFrameRedrawSequence: first paint is full', () => {
  const r = buildWatchFrameRedrawSequence([], ['a', 'b'], false);
  assert.equal(r.mode, 'full');
  assert.ok(r.seq.includes('\x1b[H'));
  assert.ok(r.seq.includes('a\nb'));
});

test('buildWatchFrameRedrawSequence: row-count change forces full', () => {
  const r = buildWatchFrameRedrawSequence(['x'], ['a', 'b'], false);
  assert.equal(r.mode, 'full');
});

test('buildWatchFrameRedrawSequence: delta updates only changed rows', () => {
  const prev = ['same', 'old', 'same'];
  const next = ['same', 'new', 'same'];
  const r = buildWatchFrameRedrawSequence(prev, next, false);
  assert.equal(r.mode, 'delta');
  assert.ok(r.seq.includes('\x1b[2;1H'));
  assert.ok(r.seq.includes('new'));
  assert.ok(!r.seq.includes('\x1b[1;1H'));
});

test('buildWatchFrameRedrawSequence: delta pads shorter row to clear leftovers', () => {
  const prev = ['│' + 'x'.repeat(20) + '│'];
  const next = ['│short│'];
  const r = buildWatchFrameRedrawSequence(prev, next, false);
  assert.equal(r.mode, 'delta');
  assert.ok(r.seq.includes('short'));
  assert.ok(r.seq.length > next[0].length);
});

test('buildWatchFrameRedrawSequence: identical rows is none', () => {
  const prev = ['a', 'b'];
  const next = ['a', 'b'];
  const r = buildWatchFrameRedrawSequence(prev, next, false);
  assert.equal(r.mode, 'none');
});

test('buildWatchFrameRedrawSequence: forceFull uses full even when lengths match', () => {
  const r = buildWatchFrameRedrawSequence(['a', 'b'], ['a', 'c'], true);
  assert.equal(r.mode, 'full');
  assert.ok(r.seq.includes('\x1b[J'));
});
