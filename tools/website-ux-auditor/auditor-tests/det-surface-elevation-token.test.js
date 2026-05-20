import assert from 'node:assert/strict';
import test from 'node:test';

import {
  findingsFromSurfaceElevationReport,
  isSanctionedBoxShadowLayer,
  isSanctionedBoxShadowValue,
  isSurfaceSelector,
  run,
  scanCssTextForElevationViolations,
  splitBoxShadowLayers,
} from '../design-rules/deterministic/generated/det-surface-elevation-token.check.js';

test('splitBoxShadowLayers respects parentheses in rgba()', () => {
  const layers = splitBoxShadowLayers('0 0 0 1px rgba(6, 182, 212, 0.12), var(--forge-glow-cyan)');
  assert.equal(layers.length, 2);
  assert.ok(layers[1].includes('var(--forge-glow-cyan)'));
});

test('isSanctionedBoxShadowValue accepts tokens, inset rings, and none', () => {
  assert.equal(isSanctionedBoxShadowValue('none'), true);
  assert.equal(isSanctionedBoxShadowValue('var(--forge-glow-cyan)'), true);
  assert.equal(isSanctionedBoxShadowValue('inset 0 0 0 1px rgba(6, 182, 212, 0.12)'), true);
  assert.equal(isSanctionedBoxShadowValue('0 0 0 1px rgba(6, 182, 212, 0.12)'), true);
  assert.equal(
    isSanctionedBoxShadowValue('0 0 0 1px rgba(6, 182, 212, 0.12), var(--forge-glow-cyan)'),
    true,
  );
  assert.equal(isSanctionedBoxShadowValue('0 8px 28px rgba(0, 0, 0, 0.45)'), false);
});

test('isSanctionedBoxShadowLayer rejects unsanctioned var names', () => {
  assert.equal(isSanctionedBoxShadowLayer('var(--custom-shadow)'), false);
});

test('isSurfaceSelector matches elevated surfaces but not card chrome', () => {
  assert.equal(isSurfaceSelector('.forge-card:hover'), true);
  assert.equal(isSurfaceSelector('.ks-nrm-dialog'), true);
  assert.equal(isSurfaceSelector('.card-title'), false);
});

test('scanCssTextForElevationViolations flags raw shadows on surface selectors', () => {
  const css = `
    .ks-nrm-dialog {
      box-shadow: 0 8px 28px rgba(0, 0, 0, 0.45);
    }
    .card-title {
      box-shadow: 0 8px 28px rgba(0, 0, 0, 0.45);
    }
    .forge-card {
      box-shadow: var(--forge-glow-cyan);
    }
  `;
  const violations = scanCssTextForElevationViolations(css, 'css/feature.css');
  assert.equal(violations.length, 1);
  assert.equal(violations[0].selector, '.ks-nrm-dialog');
});

test('scanCssTextForElevationViolations skips @keyframes', () => {
  const css = `
    @keyframes pulse-glow {
      50% { box-shadow: 0 0 14px rgba(6, 182, 212, 0.4); }
    }
    .forge-card { box-shadow: var(--forge-glow-cyan); }
  `;
  const violations = scanCssTextForElevationViolations(css, 'css/feature.css');
  assert.equal(violations.length, 0);
});

test('findingsFromSurfaceElevationReport maps violations to findings', () => {
  const findings = findingsFromSurfaceElevationReport({
    violations: [
      {
        kind: 'raw-box-shadow',
        path: 'css/nested-roadmap.css',
        selector: '.ks-nrm-dialog',
        value: '0 8px 28px rgba(0, 0, 0, 0.45)',
      },
    ],
  }, 'https://example.test/nested-roadmap');
  assert.equal(findings.length, 1);
  assert.equal(findings[0].severity, 'warn');
  assert.ok(findings[0].message.includes('elevation token'));
  assert.ok(findings[0].evidence.includes('raw_surface_box_shadow'));
  assert.ok(findings[0].evidence.includes('url=https://example.test/nested-roadmap'));
});

test('run returns empty without report, page, or repo css', async () => {
  assert.deepEqual(await run({ metrics: {}, url: 'https://example.test/' }), []);
  assert.deepEqual(await run({ metrics: {}, repoRoot: '/tmp' }), []);
});

test('run uses metrics.surfaceElevationReport when provided', async () => {
  const findings = await run({
    metrics: {
      url: 'https://example.test/cards',
      surfaceElevationReport: {
        violations: [
          {
            kind: 'inline-raw-box-shadow',
            selectorHint: 'motion-card',
            value: '0 4px 12px rgba(0,0,0,0.35)',
          },
        ],
      },
    },
    url: 'https://example.test/cards',
  });
  assert.equal(findings.length, 1);
  assert.ok(findings[0].remediation.includes('var('));
});
