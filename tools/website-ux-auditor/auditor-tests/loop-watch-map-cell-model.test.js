import assert from 'node:assert/strict';
import test from 'node:test';

import {
  renderMapCell,
  toMapCellBaseStatus,
  buildOverlayMatrix,
} from '../lib/loop-watch-map-cell-model.js';

test('toMapCellBaseStatus maps legacy clean and in-flight to scored', () => {
  assert.equal(toMapCellBaseStatus('clean'), 'scored');
  assert.equal(toMapCellBaseStatus('scoring'), 'scored');
  assert.equal(toMapCellBaseStatus('auditing'), 'scored');
});

test('renderMapCell keeps scored background with scoring overlay', () => {
  const plain = renderMapCell('scored', 'scoring', 0, { useColor: false });
  assert.match(plain, /[─╲│╱]/);
  const baseOnly = renderMapCell('scored', null, 0, { useColor: false });
  assert.equal(baseOnly, '▒');
});

test('buildOverlayMatrix sets single cell', () => {
  const base = [
    ['unseen', 'scored'],
    ['scored', 'unseen'],
  ];
  const ov = buildOverlayMatrix(base, { row: 0, col: 1, overlay: 'auditing' });
  assert.equal(ov[0][1], 'auditing');
  assert.equal(ov[1][0], null);
});
