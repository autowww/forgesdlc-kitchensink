import assert from 'node:assert/strict';
import test from 'node:test';

import {
  findingsFromAmbientZIndexReport,
  parseZIndex,
  run,
} from '../design-rules/deterministic/generated/det-ambient-z-index.check.js';

test('parseZIndex treats auto and invalid values as zero', () => {
  assert.equal(parseZIndex('auto'), 0);
  assert.equal(parseZIndex(undefined), 0);
  assert.equal(parseZIndex('2'), 2);
});

test('findingsFromAmbientZIndexReport flags pointer-events and stack inversion', () => {
  const findings = findingsFromAmbientZIndexReport({
    ambientLayerCount: 1,
    violations: [
      { kind: 'pointer-events', className: 'ks-ambient-bg', pe: 'auto', zIndex: 0 },
      { kind: 'stack-inversion', className: 'forge-ambient-bg', ambientZ: 2, contentZ: 2 },
    ],
  });
  assert.equal(findings.length, 2);
  assert.ok(findings.some((f) => f.message.includes('pointer events')));
  assert.ok(findings.some((f) => f.message.includes('not strictly below')));
});

test('run returns empty when no ambient report or page', async () => {
  const findings = await run({ metrics: {}, url: 'https://example.test/' });
  assert.deepEqual(findings, []);
});

test('run uses metrics.ambientZIndexReport when provided', async () => {
  const findings = await run({
    metrics: {
      url: 'https://example.test/',
      ambientZIndexReport: {
        ambientLayerCount: 1,
        violations: [{ kind: 'z-index-high', className: 'ks-ambient-bg', zIndex: 4 }],
      },
    },
    url: 'https://example.test/',
  });
  assert.equal(findings.length, 1);
  assert.ok(findings[0].message.includes('z-index exceeds'));
});
