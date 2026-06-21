import assert from 'node:assert/strict';
import test from 'node:test';

import {
  findingsFromAppPrimitiveStylesReport,
  run,
} from '../design-rules/deterministic/generated/det-app-primitive-styles.check.js';

test('findingsFromAppPrimitiveStylesReport flags missing stylesheet and ks-fe class', () => {
  const findings = findingsFromAppPrimitiveStylesReport({
    skipped: false,
    violations: [
      { kind: 'missing-stylesheet', hash: '?', ksName: '' },
      { kind: 'missing-ks-fe-class', hash: 'Fsb', ksName: 'forge-status-banner' },
    ],
  });
  assert.equal(findings.length, 2);
  assert.ok(findings.some((f) => f.message.includes('forge-react-primitives')));
  assert.ok(findings.some((f) => f.message.includes('ks-fe')));
});

test('run returns empty when report skipped', async () => {
  const findings = await run({
    metrics: { appPrimitiveStylesReport: { skipped: true, violations: [] } },
    url: 'https://example.test/',
  });
  assert.deepEqual(findings, []);
});
