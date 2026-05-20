import assert from 'node:assert/strict';
import test from 'node:test';

import {
  findingsFromNavFocusOrderReport,
  run,
  violationsFromFocusOrderSequence,
} from '../design-rules/deterministic/generated/det-nav-focus-order.check.js';

test('violationsFromFocusOrderSequence flags positive tabindex and vertical inversion', () => {
  const violations = violationsFromFocusOrderSequence([
    { tabindex: 0, centerX: 100, centerY: 200, tag: 'a', id: 'first', region: 'header' },
    { tabindex: 5, centerX: 120, centerY: 210, tag: 'button', id: 'jump', region: 'header' },
    { tabindex: 0, centerX: 140, centerY: 80, tag: 'a', id: 'up', region: 'main' },
  ]);
  assert.ok(violations.some((v) => v.kind === 'positive-tabindex' && v.tabindex === 5));
  assert.ok(violations.some((v) => v.kind === 'reverse-vertical' && v.step === 2));
});

test('violationsFromFocusOrderSequence flags horizontal inversion on same row (LTR)', () => {
  const violations = violationsFromFocusOrderSequence([
    { tabindex: 0, centerX: 300, centerY: 100, tag: 'a', id: 'right' },
    { tabindex: 0, centerX: 120, centerY: 105, tag: 'a', id: 'left' },
  ]);
  assert.ok(violations.some((v) => v.kind === 'reverse-horizontal'));
});

test('findingsFromNavFocusOrderReport maps violations to findings', () => {
  const findings = findingsFromNavFocusOrderReport({
    tabStopCount: 3,
    violations: [
      { kind: 'positive-tabindex', tabindex: 2, tag: 'button', id: 'cta', region: 'main' },
      {
        kind: 'reverse-horizontal',
        step: 4,
        deltaX: -120,
        fromTag: 'a',
        toTag: 'a',
        fromId: 'a1',
        toId: 'a2',
      },
    ],
  }, 'https://example.test/page');
  assert.equal(findings.length, 2);
  assert.ok(findings.some((f) => f.message.includes('positive tabindex')));
  assert.ok(findings.some((f) => f.message.includes('right-to-left')));
  assert.ok(findings[0].evidence.includes('url=https://example.test/page'));
  assert.equal(findings[0].area, 'accessibility');
});

test('run returns empty when no focus-order report or page', async () => {
  const findings = await run({ metrics: {}, url: 'https://example.test/' });
  assert.deepEqual(findings, []);
});

test('run uses metrics.navFocusOrderReport when provided', async () => {
  const findings = await run({
    metrics: {
      url: 'https://example.test/',
      navFocusOrderReport: {
        tabStopCount: 2,
        violations: [{ kind: 'positive-tabindex', tabindex: 1, tag: 'a', id: 'skip', region: 'nav' }],
      },
    },
    url: 'https://example.test/',
  });
  assert.equal(findings.length, 1);
  assert.ok(findings[0].message.includes('positive tabindex'));
});
