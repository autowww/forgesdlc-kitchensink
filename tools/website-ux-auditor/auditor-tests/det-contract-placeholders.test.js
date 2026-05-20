import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  findingsFromContractPlaceholderReport,
  placeholderIssueKind,
  run,
  scanContractPlaceholders,
} from '../design-rules/deterministic/generated/det-contract-placeholders.check.js';

test('placeholderIssueKind distinguishes stub bullets from other markers', () => {
  assert.equal(
    placeholderIssueKind('docs/design/catalog/pages/X.md: contract still uses stub bullets (TBD)'),
    'stub-bullet',
  );
  assert.equal(
    placeholderIssueKind('docs/design/catalog/pages/X.md: placeholder language (lorem ipsum)'),
    'placeholder-marker',
  );
});

test('scanContractPlaceholders flags lorem ipsum and stub bullets in strict mode', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'det-contract-ph-'));
  const catalogDir = path.join(dir, 'docs/design/catalog/pages');
  fs.mkdirSync(catalogDir, { recursive: true });

  const stubContract = path.join(catalogDir, 'Stb-fixture.md');
  fs.writeFileSync(
    stubContract,
    '# Stub\n\n- TBD\n',
    'utf8',
  );

  const loremContract = path.join(catalogDir, 'Lor-fixture.md');
  fs.writeFileSync(
    loremContract,
    '# Lorem\n\nBody with lorem ipsum filler.\n',
    'utf8',
  );

  fs.writeFileSync(
    path.join(dir, 'docs/design/catalog/visual-registry.generated.json'),
    JSON.stringify({
      schemaVersion: 1,
      entries: [
        {
          hash: 'Stb',
          contract_status: 'own',
          contract: 'docs/design/catalog/pages/Stb-fixture.md',
        },
        {
          hash: 'Lor',
          contract_status: 'own',
          contract: 'docs/design/catalog/pages/Lor-fixture.md',
        },
      ],
    }),
    'utf8',
  );

  const nonStrict = scanContractPlaceholders(dir, { strict: false });
  assert.equal(nonStrict.skipped, false);
  assert.ok(nonStrict.issues.some((i) => i.kind === 'placeholder-marker' && i.severity === 'minor'));
  assert.ok(!nonStrict.issues.some((i) => i.kind === 'stub-bullet'));

  const strict = scanContractPlaceholders(dir, { strict: true });
  assert.ok(strict.issues.some((i) => i.kind === 'stub-bullet' && i.severity === 'minor'));
  assert.ok(strict.issues.some((i) => i.kind === 'placeholder-marker' && i.severity === 'minor'));
});

test('findingsFromContractPlaceholderReport maps issues to visual-catalog findings', () => {
  const findings = findingsFromContractPlaceholderReport({
    issues: [
      {
        severity: 'minor',
        hash: 'Lor',
        contract: 'docs/design/catalog/pages/Lor-fixture.md',
        kind: 'placeholder-marker',
        message: 'docs/design/catalog/pages/Lor-fixture.md: placeholder language (lorem ipsum)',
      },
    ],
  });
  assert.equal(findings.length, 1);
  assert.equal(findings[0].severity, 'minor');
  assert.equal(findings[0].area, 'visual-catalog');
  assert.ok(findings[0].evidence.includes('hash=Lor'));
  assert.ok(findings[0].remediation.includes('lorem ipsum'));
});

test('findingsFromContractPlaceholderReport returns empty when scan skipped', () => {
  assert.deepEqual(findingsFromContractPlaceholderReport({ skipped: true, issues: [] }), []);
});

test('run returns empty without repoRoot', async () => {
  const findings = await run({ metrics: {}, ctx: {} });
  assert.deepEqual(findings, []);
});

test('run uses metrics.contractPlaceholderReport when provided', async () => {
  const findings = await run({
    repoRoot: '/tmp/unused',
    metrics: {
      contractPlaceholderReport: {
        issues: [
          {
            severity: 'warn',
            hash: 'Stb',
            contract: 'docs/design/catalog/pages/Stb-fixture.md',
            kind: 'stub-bullet',
            message: 'docs/design/catalog/pages/Stb-fixture.md: contract still uses stub bullets (TBD)',
          },
        ],
      },
    },
  });
  assert.equal(findings.length, 1);
  assert.equal(findings[0].severity, 'warn');
  assert.ok(findings[0].message.includes('stub bullets'));
});
