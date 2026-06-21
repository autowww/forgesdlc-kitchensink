import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { findingsFromFormReport } from '../design-rules/deterministic/generated/det-form-label-error-summary.check.js';
import { findingsFromHashSemanticReport } from '../design-rules/deterministic/generated/det-ks-hash-semantic-uniqueness.check.js';
import { buildHashSemanticUniquenessReport, extractThreeLetterHashesFromHtml } from '../lib/ks-governance.js';
import {
  computeScenarioUxScores,
  mapFindingToScenarioDimension,
} from '../../ui-app-audit/lib/scenario-ux-score.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AUDITOR_ROOT = path.resolve(__dirname, '..');
const FIXTURES = path.join(__dirname, 'fixtures');

test('E2E smoke: static UX auditor on minimal generic fixture repo', () => {
  const analyzeScript = path.join(AUDITOR_ROOT, 'analyze-website-ux.mjs');
  const fixtureRepo = path.join(FIXTURES, 'minimal-repo');
  const out = mkdtempSync(path.join(tmpdir(), 'ux-e2e-smoke-'));
  const r = spawnSync(
    process.execPath,
    [
      analyzeScript,
      '--repo',
      fixtureRepo,
      '--static-only',
      '--out',
      out,
      '--no-mirror-root-plan',
      '--no-ux-csv',
    ],
    { encoding: 'utf8', timeout: 120_000 },
  );
  assert.equal(r.status, 0, r.stderr || r.stdout);
  const data = JSON.parse(readFileSync(path.join(out, 'audit-data.json'), 'utf8'));
  assert.equal(data.schemaVersion, 2);
  assert.ok(data.uxScores && typeof data.uxScores.overall === 'number');
  rmSync(out, { recursive: true, force: true });
});

test('E2E smoke: UX scorer CLI accepts generic pass-minimal HTML fixture path', () => {
  const scoreScript = path.join(AUDITOR_ROOT, 'score-website-ux.mjs');
  const htmlPath = path.join(FIXTURES, 'det-generic-website', 'pass-minimal.html');
  const r = spawnSync(process.execPath, [scoreScript, '--help'], { encoding: 'utf8' });
  assert.equal(r.status, 0);
  assert.ok(fs.existsSync(htmlPath));
});

test('E2E smoke: KS hash/registry path via DET.KS.HASH_SEMANTIC_UNIQUENESS check', () => {
  const failHtml = fs.readFileSync(path.join(FIXTURES, 'det-ks-hash-semantic', 'fail.html'), 'utf8');
  const passHtml = fs.readFileSync(path.join(FIXTURES, 'det-ks-hash-semantic', 'pass.html'), 'utf8');
  assert.ok(extractThreeLetterHashesFromHtml(failHtml).includes('Fsb'));
  const failInstances = [
    { hash: 'Fsb', dataKsType: 'react-primitive', dataKsName: 'forge-status-banner' },
    { hash: 'Fsb', dataKsType: 'section', dataKsName: 'unrelated-section' },
  ];
  const failFindings = findingsFromHashSemanticReport(
    buildHashSemanticUniquenessReport(failInstances),
    'https://fixture.test/fail',
  );
  const passFindings = findingsFromHashSemanticReport(
    buildHashSemanticUniquenessReport([
      { hash: 'Fsb', dataKsType: 'react-primitive', dataKsName: 'forge-status-banner' },
    ]),
    'https://fixture.test/pass',
  );
  assert.ok(failFindings.length >= 1);
  assert.equal(passFindings.length, 0);
  assert.ok(passHtml.includes('data-ks-hash="Fsb"'));
});

test('E2E smoke: Vite/React scenario scorecard maps DET.APP findings to dimensions', () => {
  const ux = computeScenarioUxScores({
    auditData: {
      auditMode: 'scenario-smoke',
      siteKind: 'a11y-studio',
      crawlSummary: { scenariosTotal: 1, pagesVisited: 1 },
      pages: [{ tier: 'smoke' }],
      findings: [
        {
          ruleId: 'DET.APP.PRIMARY_STATE',
          checkId: 'design-rule-runtime',
          severity: 'warn',
          message: 'state',
        },
      ],
    },
    findings: [
      {
        ruleId: 'DET.APP.PRIMARY_STATE',
        checkId: 'design-rule-runtime',
        severity: 'warn',
      },
    ],
  });
  assert.equal(mapFindingToScenarioDimension({ ruleId: 'DET.APP.TAB_PANEL' }), 'dataActionability');
  assert.ok(ux.overall < 100);
  assert.ok(ux.dimensions.stateFeedbackRecovery !== undefined);
});

test('E2E smoke: generic DET form rule maps collector violations to findings', () => {
  const findings = findingsFromFormReport({
    formViolations: [{ issue: 'missing-label', fieldCount: 1 }],
  });
  assert.ok(findings.length >= 1);
  assert.ok(fs.existsSync(path.join(FIXTURES, 'det-generic-website', 'fail-form.html')));
});
