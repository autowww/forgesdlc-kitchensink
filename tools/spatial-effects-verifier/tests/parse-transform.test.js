import assert from 'node:assert/strict';
import test from 'node:test';

import {
  normalizeAngleDeg,
  parseMatrix3d,
  parseTransform,
  parseTransformString,
} from '../lib/parse-transform.mjs';

test('parseTransformString reads rotate and translateZ', () => {
  const parsed = parseTransformString('rotateX(12deg) rotateY(-18deg) translateZ(24px)');
  assert.equal(parsed.rotateX_deg, 12);
  assert.equal(parsed.rotateY_deg, -18);
  assert.equal(parsed.translateZ_px, 24);
});

test('parseTransformString handles none', () => {
  const parsed = parseTransformString('none');
  assert.equal(parsed.rotateX_deg, null);
  assert.equal(parsed.rotateY_deg, null);
  assert.equal(parsed.translateZ_px, null);
});

test('parseTransform reads matrix3d translateZ', () => {
  const values = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 30, 1,
  ];
  const parsed = parseMatrix3d(values);
  assert.equal(parsed.translateZ_px, 30);
});

test('parseTransform auto-detects matrix3d string', () => {
  const parsed = parseTransform(
    'matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 42, 1)',
  );
  assert.equal(parsed.translateZ_px, 42);
});

test('normalizeAngleDeg wraps large angles', () => {
  assert.equal(normalizeAngleDeg(190), -170);
  assert.equal(normalizeAngleDeg(-190), 170);
});

test('parseTransformString reads rotate() as rotateZ', () => {
  const parsed = parseTransformString('rotate(45deg)');
  assert.equal(parsed.rotateZ_deg, 45);
});
