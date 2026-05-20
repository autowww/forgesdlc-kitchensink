import assert from 'node:assert/strict';
import test from 'node:test';

import {
  findingsFromHashMarkersReport,
  MAX_HASH_MARKER_FINDINGS,
  run,
} from '../design-rules/deterministic/generated/det-hash-markers.check.js';

test('MAX_HASH_MARKER_FINDINGS caps per-page output', () => {
  assert.equal(MAX_HASH_MARKER_FINDINGS, 10);
});

test('findingsFromHashMarkersReport flags invalid hash format', () => {
  const findings = findingsFromHashMarkersReport({
    validUnique: [],
    invalidRaw: [{ value: 'abcd', source: 'data-ks-hash' }],
    mismatches: [],
    incompleteMarkers: [],
    instanceCountByHash: {},
  });
  assert.equal(findings.length, 1);
  assert.equal(findings[0].severity, 'minor');
  assert.ok(findings[0].message.includes('abcd'));
});

test('findingsFromHashMarkersReport flags hash vs data-ks-hash mismatch', () => {
  const findings = findingsFromHashMarkersReport({
    validUnique: [],
    invalidRaw: [],
    mismatches: [{ hashAttr: 'Abc', dataKsHash: 'Xyz', tag: 'div' }],
    incompleteMarkers: [],
    instanceCountByHash: {},
  });
  assert.equal(findings.length, 1);
  assert.equal(findings[0].hash, 'Xyz');
  assert.ok(findings[0].message.includes('disagree'));
});

test('findingsFromHashMarkersReport flags incomplete marker pairs', () => {
  const findings = findingsFromHashMarkersReport({
    validUnique: ['Hmm'],
    invalidRaw: [],
    mismatches: [],
    incompleteMarkers: [{ side: 'hash-missing', tag: 'section', dataKsHash: 'Hmm' }],
    instanceCountByHash: { Hmm: 1 },
  });
  assert.equal(findings.length, 1);
  assert.equal(findings[0].severity, 'warn');
  assert.ok(findings[0].message.includes('hash='));
});

test('findingsFromHashMarkersReport returns empty when no DOM signal', () => {
  assert.deepEqual(findingsFromHashMarkersReport(null), []);
  assert.deepEqual(
    findingsFromHashMarkersReport({
      validUnique: [],
      invalidRaw: [],
      mismatches: [],
      incompleteMarkers: [],
      instanceCountByHash: {},
    }),
    [],
  );
});

test('run uses metrics.ksVisualHashReport', async () => {
  const findings = await run({
    metrics: {
      url: 'https://example.test/page',
      ksVisualHashReport: {
        validUnique: [],
        invalidRaw: [],
        mismatches: [{ hashAttr: 'One', dataKsHash: 'Two', tag: 'main' }],
        incompleteMarkers: [],
        instanceCountByHash: {},
      },
    },
    url: 'https://example.test/page',
  });
  assert.equal(findings.length, 1);
  assert.ok(findings[0].message.includes('disagree'));
  assert.equal(findings[0].hash, 'Two');
});
