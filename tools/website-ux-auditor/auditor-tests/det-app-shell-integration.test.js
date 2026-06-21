import assert from 'node:assert/strict';
import test from 'node:test';

import {
  findingsFromAppShellIntegrationReport,
  run,
} from '../design-rules/deterministic/generated/det-app-shell-integration.check.js';

test('findingsFromAppShellIntegrationReport flags bootstrap alert near primitive', () => {
  const findings = findingsFromAppShellIntegrationReport({
    skipped: false,
    violations: [
      {
        kind: 'bootstrap-alert-near-primitive',
        tag: 'div',
        className: 'alert alert-danger',
      },
    ],
  });
  assert.equal(findings.length, 1);
  assert.ok(findings[0].message.includes('Bootstrap alert'));
  assert.ok(findings[0].remediation.includes('ForgeStatusBanner'));
});

test('run returns empty when report skipped', async () => {
  const findings = await run({
    metrics: { appShellIntegrationReport: { skipped: true, violations: [] } },
    url: 'https://example.test/',
  });
  assert.deepEqual(findings, []);
});
