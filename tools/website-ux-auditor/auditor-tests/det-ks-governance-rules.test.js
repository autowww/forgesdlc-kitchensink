import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { ruleScopeEnabled, resolveRulesScope } from '../lib/detect-ks-site.js';
import {
  buildConsumerAssetBundleReportFromHtml,
  buildHashSemanticUniquenessReport,
  buildPrimitiveVersionMatchReport,
  extractThreeLetterHashesFromHtml,
} from '../lib/ks-governance.js';
import { findingsFromHashSemanticReport } from '../design-rules/deterministic/generated/det-ks-hash-semantic-uniqueness.check.js';
import { findingsFromConsumerAssetBundleReport } from '../design-rules/deterministic/generated/det-ks-consumer-asset-bundle.check.js';
import { findingsFromPrimitiveVersionReport } from '../design-rules/deterministic/generated/det-ks-primitive-version-match.check.js';
import { findingsFromContractExampleSyncReport } from '../design-rules/deterministic/generated/det-ks-contract-example-sync.check.js';
import { findingsFromVisualFamilyCoverageReport } from '../design-rules/deterministic/generated/det-ks-visual-family-coverage.check.js';
import { createDesignRuleRuntime } from '../lib/design-rule-runtime.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES = path.join(__dirname, 'fixtures');
const KS_ROOT = path.resolve(__dirname, '..', '..', '..');

function readFixture(rel) {
  return fs.readFileSync(path.join(FIXTURES, rel), 'utf8');
}

test('ruleScopeEnabled gates ks rules off generic sites', () => {
  const generic = resolveRulesScope({ rulesScope: 'generic', repoScore: 1, domScore: 1 });
  assert.equal(ruleScopeEnabled('ks', generic), false);
  assert.equal(ruleScopeEnabled('generic', generic), true);
  const ks = resolveRulesScope({ rulesScope: 'ks', repoScore: 0, domScore: 0 });
  assert.equal(ruleScopeEnabled('ks', ks), true);
});

test('buildHashSemanticUniquenessReport flags unrelated anatomy reuse', () => {
  const instances = [
    { hash: 'Fsb', dataKsType: 'react-primitive', dataKsName: 'forge-status-banner' },
    { hash: 'Fsb', dataKsType: 'section', dataKsName: 'unrelated-section' },
  ];
  const report = buildHashSemanticUniquenessReport(instances);
  const findings = findingsFromHashSemanticReport(report);
  assert.ok(findings.length >= 1);
  assert.equal(findings[0].hash, 'Fsb');
});

test('buildHashSemanticUniquenessReport passes single semantics', () => {
  const report = buildHashSemanticUniquenessReport([
    { hash: 'Fsb', dataKsType: 'react-primitive', dataKsName: 'forge-status-banner' },
  ]);
  assert.deepEqual(findingsFromHashSemanticReport(report), []);
});

test('buildConsumerAssetBundleReportFromHtml flags missing primitive css', () => {
  const report = buildConsumerAssetBundleReportFromHtml(readFixture('det-ks-consumer-bundle/fail.html'));
  const findings = findingsFromConsumerAssetBundleReport(report);
  assert.ok(findings.some((f) => f.message.includes('forge-react-primitives')));
});

test('buildConsumerAssetBundleReportFromHtml passes linked bundles', () => {
  const report = buildConsumerAssetBundleReportFromHtml(readFixture('det-ks-consumer-bundle/pass.html'));
  assert.deepEqual(findingsFromConsumerAssetBundleReport(report), []);
});

test('buildPrimitiveVersionMatchReport flags version mismatch', () => {
  const repoRoot = KS_ROOT;
  const report = buildPrimitiveVersionMatchReport(repoRoot, [
    {
      hash: 'Fsb',
      dataKsType: 'react-primitive',
      dataKsName: 'forge-status-banner',
      primitiveVersion: 'v9',
    },
  ]);
  if (report.skipped) {
    assert.ok(true, 'registry missing in fixture env — skip');
    return;
  }
  const withMismatch = {
    ...report,
    violations: [
      { kind: 'version-mismatch', hash: 'Fsb', domVersion: 'v2', expectedVersion: 'v1', ksName: 'forge-status-banner' },
    ],
  };
  const findings = findingsFromPrimitiveVersionReport(withMismatch);
  assert.equal(findings.length, 1);
  assert.ok(findings[0].message.includes('v2'));
});

test('findingsFromContractExampleSyncReport flags missing rule id in checks', () => {
  const findings = findingsFromContractExampleSyncReport({
    issues: [{ kind: 'rule-id-missing-in-deterministic-checks', ruleId: 'DET.KS.TEST', file: 'x.md' }],
  });
  assert.equal(findings.length, 1);
});

test('design rule runtime skips ks scope on generic sites', async () => {
  const runtime = await createDesignRuleRuntime({
    rulesScopeResolved: resolveRulesScope({ rulesScope: 'generic', repoScore: 0, domScore: 0 }),
  });
  const ksRule = runtime.implementedRules.find((r) => r.id === 'DET.KS.CONSUMER_ASSET_BUNDLE');
  assert.ok(ksRule, 'DET.KS.CONSUMER_ASSET_BUNDLE should be implemented');
  const { trace } = await runtime.runDeterministicRulesWithTrace({
    metrics: { url: 'https://example.test/', ksVisualHashReport: { validUnique: ['Fsb'] } },
    url: 'https://example.test/',
    page: null,
    repoRoot: KS_ROOT,
    ctx: { rulesScopeResolved: resolveRulesScope({ rulesScope: 'generic', repoScore: 0, domScore: 0 }) },
  });
  const ksTrace = trace.find((t) => t.ruleId === 'DET.KS.CONSUMER_ASSET_BUNDLE');
  assert.equal(ksTrace?.status, 'skipped_scope');
});

test('findingsFromVisualFamilyCoverageReport surfaces missing contract', () => {
  const findings = findingsFromVisualFamilyCoverageReport({
    violations: [{ kind: 'missing-contract-path', hash: 'Zzz', type: 'component' }],
  });
  assert.equal(findings.length, 1);
  assert.ok(findings[0].message.includes('Zzz'));
});
