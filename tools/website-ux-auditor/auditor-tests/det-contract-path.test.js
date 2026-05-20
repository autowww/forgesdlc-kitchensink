import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  findingsFromContractPathReport,
  isActiveRegistryRow,
  requiresContractPath,
  run,
  scanContractPaths,
} from '../design-rules/deterministic/generated/det-contract-path.check.js';

test('requiresContractPath is true only for own and family-covered', () => {
  assert.equal(requiresContractPath({ contract_status: 'own' }), true);
  assert.equal(requiresContractPath({ contract_status: 'family-covered' }), true);
  assert.equal(requiresContractPath({ contract_status: 'not-applicable' }), false);
  assert.equal(requiresContractPath({ contract_status: 'missing' }), false);
});

test('isActiveRegistryRow matches status active only', () => {
  assert.equal(isActiveRegistryRow({ status: 'active' }), true);
  assert.equal(isActiveRegistryRow({ status: 'deprecated' }), false);
});

test('scanContractPaths flags empty path and missing file for active rows', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'det-contract-path-'));
  const catalogDir = path.join(dir, 'docs/design/catalog');
  fs.mkdirSync(catalogDir, { recursive: true });

  const existingContract = path.join(catalogDir, 'pages', 'Okk-fixture.md');
  fs.mkdirSync(path.dirname(existingContract), { recursive: true });
  fs.writeFileSync(existingContract, '# OK\n', 'utf8');

  fs.writeFileSync(
    path.join(catalogDir, 'visual-registry.generated.json'),
    JSON.stringify({
      schemaVersion: 1,
      entries: [
        {
          hash: 'Emp',
          status: 'active',
          contract_status: 'own',
          contract: null,
        },
        {
          hash: 'Mis',
          status: 'active',
          contract_status: 'own',
          contract: 'docs/design/catalog/pages/Mis-missing.md',
        },
        {
          hash: 'Okk',
          status: 'active',
          contract_status: 'own',
          contract: 'docs/design/catalog/pages/Okk-fixture.md',
        },
        {
          hash: 'Nap',
          status: 'active',
          contract_status: 'not-applicable',
          contract: null,
        },
        {
          hash: 'Dep',
          status: 'deprecated',
          contract_status: 'own',
          contract: 'docs/design/catalog/pages/Mis-missing.md',
        },
      ],
    }),
    'utf8',
  );

  const report = scanContractPaths(dir);
  assert.equal(report.skipped, false);
  assert.equal(report.issues.length, 2);
  assert.ok(report.issues.some((i) => i.kind === 'empty-path' && i.hash === 'Emp'));
  assert.ok(report.issues.some((i) => i.kind === 'missing-file' && i.hash === 'Mis'));
});

test('findingsFromContractPathReport maps issues to visual-catalog findings', () => {
  const findings = findingsFromContractPathReport({
    issues: [
      {
        kind: 'missing-file',
        hash: 'Mis',
        contract: 'docs/design/catalog/pages/Mis-missing.md',
        contractStatus: 'own',
        message: 'Active catalog entry Mis lists contract docs/design/catalog/pages/Mis-missing.md but the file is missing on disk.',
      },
    ],
  });
  assert.equal(findings.length, 1);
  assert.equal(findings[0].severity, 'minor');
  assert.equal(findings[0].area, 'visual-catalog');
  assert.ok(findings[0].evidence.includes('hash=Mis'));
  assert.ok(findings[0].remediation.includes('Restore the Markdown contract'));
});

test('findingsFromContractPathReport returns empty when scan skipped', () => {
  assert.deepEqual(findingsFromContractPathReport({ skipped: true, issues: [] }), []);
});

test('run returns empty without repoRoot', async () => {
  const findings = await run({ metrics: {}, ctx: {} });
  assert.deepEqual(findings, []);
});

test('run uses metrics.contractPathReport when provided', async () => {
  const findings = await run({
    repoRoot: '/tmp/unused',
    metrics: {
      contractPathReport: {
        issues: [
          {
            kind: 'empty-path',
            hash: 'Emp',
            contractStatus: 'own',
            message: 'Active catalog entry Emp has contract_status=own but contract path is empty.',
          },
        ],
      },
    },
  });
  assert.equal(findings.length, 1);
  assert.ok(findings[0].remediation.includes('not-applicable'));
});
