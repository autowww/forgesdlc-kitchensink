import assert from 'node:assert/strict';
import test from 'node:test';

import {
  estimatedFlashesPerSecond,
  findingsFromMotionNoAutoPlayFlashReport,
  isRiskyAnimationName,
  parseCssTimeSeconds,
  run,
} from '../design-rules/deterministic/generated/det-motion-no-auto-play-flash.check.js';

test('parseCssTimeSeconds parses s and ms units', () => {
  assert.equal(parseCssTimeSeconds('200ms'), 0.2);
  assert.equal(parseCssTimeSeconds('1.5s'), 1.5);
  assert.equal(parseCssTimeSeconds('0'), 0);
});

test('estimatedFlashesPerSecond flags fast infinite loops', () => {
  assert.ok(estimatedFlashesPerSecond(0.2, 'infinite') > 3);
  assert.ok(estimatedFlashesPerSecond(0.7, 'infinite') <= 3);
});

test('isRiskyAnimationName matches strobing keywords', () => {
  assert.equal(isRiskyAnimationName('ks-blink-border'), true);
  assert.equal(isRiskyAnimationName('breathe-cyan'), false);
});

test('findingsFromMotionNoAutoPlayFlashReport maps violation kinds', () => {
  const findings = findingsFromMotionNoAutoPlayFlashReport({
    violations: [
      {
        kind: 'fast-infinite-animation',
        animationName: 'pulse',
        durationSec: 0.15,
        estimatedFlashesPerSecond: 13.3,
        selectorHint: 'div.hero',
      },
      { kind: 'risky-keyframes-name', name: 'flash-strobe' },
    ],
  });
  assert.equal(findings.length, 2);
  assert.ok(findings.some((f) => f.message.includes('WCAG general flash threshold')));
  assert.ok(findings.some((f) => f.message.includes('blink/flash/strobe')));
});

test('run returns empty without metrics report or page', async () => {
  const findings = await run({ metrics: {}, url: 'https://example.test/' });
  assert.deepEqual(findings, []);
});

test('run uses metrics.motionNoAutoPlayFlashReport when provided', async () => {
  const findings = await run({
    metrics: {
      url: 'https://example.test/',
      motionNoAutoPlayFlashReport: {
        violations: [{ kind: 'autoplay-video', selectorHint: 'video#bg', muted: false }],
      },
    },
    url: 'https://example.test/',
  });
  assert.equal(findings.length, 1);
  assert.ok(findings[0].message.includes('Autoplaying video'));
});
