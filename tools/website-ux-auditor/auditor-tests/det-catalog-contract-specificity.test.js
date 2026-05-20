import assert from 'node:assert/strict';
import test from 'node:test';

import {
  analyzeRequiredContractSections,
  findingsFromContractSpecificityReport,
  run,
} from '../design-rules/deterministic/generated/det-catalog-contract-specificity.check.js';

test('analyzeRequiredContractSections flags missing Anatomy, Forbidden patterns, and Deterministic checks', () => {
  const md = `## Expected look\n\nSpecific spacing and typography for this hash only.\n`;
  const errors = analyzeRequiredContractSections(md, 'docs/design/catalog/pages/Xyz-fixture.md');
  assert.ok(errors.some((e) => e.includes('## Anatomy')));
  assert.ok(errors.some((e) => e.includes('Forbidden patterns')));
  assert.ok(errors.some((e) => e.includes('Deterministic checks')));
});

test('findingsFromContractSpecificityReport maps issues to visual-catalog findings', () => {
  const findings = findingsFromContractSpecificityReport({
    issues: [
      {
        severity: 'warn',
        hash: 'Xyz',
        contract: 'docs/design/catalog/pages/Xyz-fixture.md',
        message: 'docs/design/catalog/pages/Xyz-fixture.md: Expected look is thin (8 words) and relies on generic phrasing — make it element-specific per hash.',
      },
    ],
  });
  assert.equal(findings.length, 1);
  assert.equal(findings[0].severity, 'warn');
  assert.equal(findings[0].area, 'visual-catalog');
  assert.ok(findings[0].evidence.includes('hash=Xyz'));
  assert.ok(findings[0].remediation.includes('Deterministic checks'));
});

test('findingsFromContractSpecificityReport returns empty when scan skipped', () => {
  assert.deepEqual(findingsFromContractSpecificityReport({ skipped: true, issues: [] }), []);
});

test('run returns empty without repoRoot', async () => {
  const findings = await run({ metrics: {}, ctx: {} });
  assert.deepEqual(findings, []);
});

test('run uses metrics.contractSpecificityReport when provided', async () => {
  const findings = await run({
    repoRoot: '/tmp/unused',
    metrics: {
      contractSpecificityReport: {
        issues: [
          {
            severity: 'minor',
            contract: 'docs/design/catalog/layouts/Aaa-fixture.md',
            message: 'docs/design/catalog/layouts/Aaa-fixture.md: missing ## States section for a stateful catalog type (layout).',
          },
        ],
      },
    },
  });
  assert.equal(findings.length, 1);
  assert.equal(findings[0].severity, 'minor');
});
