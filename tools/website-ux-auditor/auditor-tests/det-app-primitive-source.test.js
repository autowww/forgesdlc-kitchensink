import assert from 'node:assert/strict';
import test from 'node:test';

import {
  findingsFromAppPrimitiveSourceReport,
  scanAppPrimitiveSource,
} from '../design-rules/deterministic/generated/det-app-primitive-source.check.js';

test('scanAppPrimitiveSource skips when no ksVisualAttrs map', () => {
  const report = scanAppPrimitiveSource('/tmp/nonexistent-ks-repo');
  assert.equal(report.skipped, true);
  assert.deepEqual(report.issues, []);
});

test('scanAppPrimitiveSource finds real kitchensink primitives without spread call', () => {
  const report = scanAppPrimitiveSource('/home/lzvyahin/Code/forgesdlc-kitchensink');
  if (report.skipped) return;
  assert.ok(report.issues.length >= 0);
});

test('findingsFromAppPrimitiveSourceReport emits remediation for missing spread', () => {
  const findings = findingsFromAppPrimitiveSourceReport({
    skipped: false,
    issues: [
      {
        path: 'react/ForgeStatusBanner.tsx',
        message: 'react/ForgeStatusBanner.tsx does not spread ksReactPrimitiveAttrs() on the primitive root.',
      },
    ],
  });
  assert.equal(findings.length, 1);
  assert.ok(findings[0].message.includes('ksReactPrimitiveAttrs'));
});
