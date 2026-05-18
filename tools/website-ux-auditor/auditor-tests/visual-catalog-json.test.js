import assert from 'node:assert/strict';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { runCheck as visualCatalogAwareness } from '../checks/visual-catalog-awareness.js';
import {
  entryByHash,
  generatedRegistryPath,
  ksVisualHashReportFromHtmlBlob,
  loadGeneratedRegistry,
  registryDuplicateHashes,
  summarizeVisualCatalogCoverage,
} from '../lib/visual-catalog.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixtureCatalogRepo = join(__dirname, 'fixtures/catalog-json-repo');
const fixtureDupRepo = join(__dirname, 'fixtures/catalog-dup-repo');
const fixtureMinimalRepo = join(__dirname, 'fixtures/minimal-repo');

test('loadGeneratedRegistry reads only generated JSON (no design-catalog yaml)', () => {
  const data = loadGeneratedRegistry(fixtureCatalogRepo);
  assert.ok(data && data.entries);
  assert.equal(data.entries.length, 1);
  assert.equal(data.entries[0].hash, 'Tst');
  assert.equal(generatedRegistryPath(fixtureCatalogRepo), join(fixtureCatalogRepo, 'docs/design/catalog/visual-registry.generated.json'));
});

test('entryByHash maps JSON entries like the former parse-registry helper', () => {
  const data = loadGeneratedRegistry(fixtureCatalogRepo);
  const by = entryByHash(data.entries);
  assert.ok(by.get('Tst'));
  assert.equal(by.get('Tst').name, 'Fixture catalog entry');
});

test('registryDuplicateHashes lists repeated hash keys in generated JSON', () => {
  const data = loadGeneratedRegistry(fixtureDupRepo);
  assert.ok(data?.entries?.length);
  const d = registryDuplicateHashes(data.entries);
  assert.deepEqual(d, ['Dup']);
});

test('visual catalog awareness: DOM hashes without generated registry emit a finding (no crash)', () => {
  const findings = visualCatalogAwareness(
    { ksVisualHashes: ['Tst'] },
    'https://example.com/',
    { repoRoot: fixtureMinimalRepo },
  );
  assert.equal(findings.length, 1);
  assert.equal(findings[0].checkId, 'visual-catalog-awareness');
  assert.equal(findings[0].id, 'visual-catalog-registry-missing');
  assert.equal(findings[0].severity, 'minor');
  assert.match(findings[0].message, /visual-registry\.generated\.json/i);
});

test('visual catalog awareness: resolves hashes from generated JSON only', () => {
  const ok = visualCatalogAwareness(
    { ksVisualHashes: ['Tst'] },
    'https://example.com/',
    { repoRoot: fixtureCatalogRepo },
  );
  assert.equal(ok.length, 0, 'known hash with valid fixture registry should not emit findings');

  const unknown = visualCatalogAwareness(
    { ksVisualHashes: ['Zzz'] },
    'https://example.com/',
    { repoRoot: fixtureCatalogRepo },
  );
  assert.equal(unknown.length, 1);
  assert.equal(unknown[0].id, 'visual-catalog-unknown-hash');
  assert.equal(unknown[0].severity, 'warn');
  assert.equal(unknown[0].hash, 'Zzz');
  assert.equal(unknown[0].selector, '[data-ks-hash="Zzz"]');
  assert.match(unknown[0].message, /visual-registry\.generated\.json/);
});

test('visual catalog awareness: hash mismatch, duplicate instances (catalog not consulted when repo omitted)', () => {
  const rep = {
    validUnique: ['Abc'],
    invalidRaw: [],
    mismatches: [{ hashAttr: 'Xyz', dataKsHash: 'Abc', tag: 'div' }],
    incompleteMarkers: [],
    instanceCountByHash: { Abc: 2 },
  };
  const f = visualCatalogAwareness({ ksVisualHashReport: rep }, 'https://example.com/p', { repoRoot: '' });
  const ids = f.map((x) => x.id).sort();
  assert.ok(ids.includes('visual-catalog-hash-mismatch'));
  assert.ok(ids.includes('visual-catalog-duplicate-emitted-hash'));
});

test('visual catalog awareness: duplicate registry rows emitted once with shared ctx', () => {
  const rep = {
    validUnique: ['Dup'],
    invalidRaw: [],
    mismatches: [],
    incompleteMarkers: [],
    instanceCountByHash: { Dup: 1 },
  };
  const ctx = { repoRoot: fixtureDupRepo };
  const a = visualCatalogAwareness({ ksVisualHashReport: rep }, 'https://a.test/', ctx);
  const b = visualCatalogAwareness({ ksVisualHashReport: rep }, 'https://b.test/', ctx);
  assert.ok(a.some((x) => x.id === 'visual-catalog-registry-duplicate-hash'));
  assert.ok(!b.some((x) => x.id === 'visual-catalog-registry-duplicate-hash'));
});

test('ksVisualHashReportFromHtmlBlob discovers data-ks-hash and hash attributes', () => {
  const html = '<div data-ks-hash="Hmm" class="x"></div><span hash="Yep">x</span>';
  const r = ksVisualHashReportFromHtmlBlob(html);
  assert.ok(r.validUnique.includes('Hmm'));
  assert.ok(r.validUnique.includes('Yep'));
});

test('summarizeVisualCatalogCoverage aggregates pages with generated JSON only', () => {
  const pages = [
    {
      url: 'https://x/',
      metrics: {
        ksVisualHashReport: {
          validUnique: ['Tst', 'Zzz'],
          invalidRaw: [],
          mismatches: [],
          incompleteMarkers: [],
          instanceCountByHash: { Tst: 2, Zzz: 1 },
        },
      },
    },
  ];
  const cov = summarizeVisualCatalogCoverage(pages, fixtureCatalogRepo);
  assert.equal(cov.catalogPresent, true);
  assert.equal(cov.uniqueHashesEmitted, 2);
  assert.equal(cov.knownHashesEmitted.length, 1);
  assert.equal(cov.unknownHashesEmitted.join(','), 'Zzz');
  assert.equal(cov.duplicateEmittedHashes.join(','), 'Tst');
  assert.ok(cov.coverageRatio !== null && cov.coverageRatio < 1);
});
