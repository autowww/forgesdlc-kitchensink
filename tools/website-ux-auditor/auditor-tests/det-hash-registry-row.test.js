import assert from 'node:assert/strict';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import {
  buildHashRegistryRowReport,
  findingsFromHashRegistryRowReport,
  instancesFromMetrics,
  MAX_HASH_REGISTRY_ROW_FINDINGS,
  run,
} from '../design-rules/deterministic/generated/det-hash-registry-row.check.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixtureCatalogRepo = join(__dirname, 'fixtures/catalog-json-repo');
const fixtureDupRepo = join(__dirname, 'fixtures/catalog-dup-repo');
const fixtureMinimalRepo = join(__dirname, 'fixtures/minimal-repo');

test('MAX_HASH_REGISTRY_ROW_FINDINGS caps per-page output', () => {
  assert.equal(MAX_HASH_REGISTRY_ROW_FINDINGS, 12);
});

test('instancesFromMetrics prefers explicit instances with types', () => {
  const rows = instancesFromMetrics({
    ksVisualHashReport: {
      validUnique: ['Tst'],
      invalidRaw: [],
      mismatches: [],
      incompleteMarkers: [],
      instanceCountByHash: { Tst: 1 },
      instances: [{ hash: 'Tst', dataKsType: 'layout', tag: 'main' }],
    },
  });
  assert.equal(rows.length, 1);
  assert.equal(rows[0].dataKsType, 'layout');
});

test('buildHashRegistryRowReport flags unknown hash', () => {
  const report = buildHashRegistryRowReport(fixtureCatalogRepo, [
    { hash: 'Zzz', dataKsType: 'layout', tag: 'div' },
  ]);
  assert.equal(report.skipped, false);
  assert.equal(report.issues.length, 1);
  assert.equal(report.issues[0].kind, 'unknown-hash');
});

test('buildHashRegistryRowReport passes known hash with matching type', () => {
  const report = buildHashRegistryRowReport(fixtureCatalogRepo, [
    { hash: 'Tst', dataKsType: 'layout', tag: 'main' },
  ]);
  assert.equal(report.issues.length, 0);
});

test('buildHashRegistryRowReport flags type mismatch', () => {
  const report = buildHashRegistryRowReport(fixtureCatalogRepo, [
    { hash: 'Tst', dataKsType: 'page', tag: 'main' },
  ]);
  assert.equal(report.issues.length, 1);
  assert.equal(report.issues[0].kind, 'type-mismatch');
  assert.equal(report.issues[0].registryType, 'layout');
});

test('buildHashRegistryRowReport emits registry-missing when repo has no catalog', () => {
  const report = buildHashRegistryRowReport(fixtureMinimalRepo, [
    { hash: 'Tst', dataKsType: '', tag: 'div' },
  ]);
  assert.equal(report.skipped, true);
  assert.equal(report.issues[0].kind, 'registry-missing');
});

test('buildHashRegistryRowReport emits duplicate registry hash once per ctx', () => {
  const ctx = {};
  const instances = [{ hash: 'Dup', dataKsType: '', tag: 'motion' }];
  const a = buildHashRegistryRowReport(fixtureDupRepo, instances, ctx);
  const b = buildHashRegistryRowReport(fixtureDupRepo, instances, ctx);
  assert.ok(a.issues.some((i) => i.kind === 'registry-duplicate'));
  assert.ok(!b.issues.some((i) => i.kind === 'registry-duplicate'));
});

test('findingsFromHashRegistryRowReport maps unknown hash to warn finding', () => {
  const findings = findingsFromHashRegistryRowReport({
    skipped: false,
    issues: [{
      kind: 'unknown-hash',
      hash: 'Zzz',
      message: 'Rendered hash Zzz is not in docs/design/catalog/visual-registry.generated.json.',
    }],
  }, 'https://example.test/p');
  assert.equal(findings.length, 1);
  assert.equal(findings[0].severity, 'warn');
  assert.equal(findings[0].hash, 'Zzz');
  assert.equal(findings[0].selector, '[data-ks-hash="Zzz"]');
});

test('run returns empty without repoRoot', async () => {
  const findings = await run({
    metrics: {
      ksVisualHashReport: {
        validUnique: ['Tst'],
        invalidRaw: [],
        mismatches: [],
        incompleteMarkers: [],
        instanceCountByHash: { Tst: 1 },
      },
    },
    url: 'https://example.test/',
  });
  assert.deepEqual(findings, []);
});

test('run crosswalks metrics instances against fixture registry', async () => {
  const findings = await run({
    metrics: {
      ksVisualHashReport: {
        validUnique: ['Zzz'],
        invalidRaw: [],
        mismatches: [],
        incompleteMarkers: [],
        instanceCountByHash: { Zzz: 1 },
        instances: [{ hash: 'Zzz', dataKsType: 'layout', tag: 'div' }],
      },
    },
    url: 'https://example.test/p',
    repoRoot: fixtureCatalogRepo,
  });
  assert.equal(findings.length, 1);
  assert.ok(findings[0].message.includes('Zzz'));
});
