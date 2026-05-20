import assert from 'node:assert/strict';
import test from 'node:test';

import {
  findingsFromMotionPrefersReducedReport,
  isEssentialMotion,
  isNearZeroMotionDuration,
  parseCssTimeSeconds,
  run,
} from '../design-rules/deterministic/generated/det-motion-prefers-reduced.check.js';

test('parseCssTimeSeconds and isNearZeroMotionDuration', () => {
  assert.equal(parseCssTimeSeconds('150ms'), 0.15);
  assert.equal(isNearZeroMotionDuration('10ms'), true);
  assert.equal(isNearZeroMotionDuration('0.15s'), false);
});

test('isEssentialMotion skips loading and progress indicators', () => {
  assert.equal(isEssentialMotion('btn btn-spinner', 'fade', '', null), true);
  assert.equal(isEssentialMotion('hero-card', 'breathe-cyan', '', null), false);
  assert.equal(isEssentialMotion('', 'ks-loading-spin', 'status', null), true);
});

test('findingsFromMotionPrefersReducedReport maps violation kinds', () => {
  const findings = findingsFromMotionPrefersReducedReport({
    violations: [
      {
        kind: 'active-animation',
        animationName: 'ks-float',
        durationSec: 3,
        selectorHint: 'div.hero',
      },
      { kind: 'smil-animation', tagName: 'animate', selectorHint: 'svg.diagram' },
    ],
  });
  assert.equal(findings.length, 2);
  assert.ok(findings.some((f) => f.message.includes('CSS animation remains active')));
  assert.ok(findings.some((f) => f.message.includes('SMIL animation')));
});

test('run returns empty without metrics report or page', async () => {
  const findings = await run({ metrics: {}, url: 'https://example.test/' });
  assert.deepEqual(findings, []);
});

test('run uses metrics.motionPrefersReducedReport when provided', async () => {
  const findings = await run({
    metrics: {
      url: 'https://example.test/',
      motionPrefersReducedReport: {
        nonEssentialMotionCount: 1,
        reducedMotionCssRuleCount: 2,
        violations: [{ kind: 'active-transition', transitionSec: 0.45, selectorHint: 'a.nav-link' }],
      },
    },
    url: 'https://example.test/',
  });
  assert.equal(findings.length, 1);
  assert.ok(findings[0].message.includes('CSS transition remains active'));
});
