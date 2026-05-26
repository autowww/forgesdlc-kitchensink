import assert from 'node:assert/strict';
import test from 'node:test';

import {
  DEFAULT_QUALITY_GATE_THRESHOLDS,
  countBySeverity,
  evaluateQualityGate,
  evaluateQualityGateCrawlHalt,
  formatQualityGateSlashPairs,
  isQualityGateSegmentFilled,
  pagePassesQualityGate,
  parseQualityGateCsv,
} from '../lib/quality-gate.js';

test('DEFAULT_QUALITY_GATE_THRESHOLDS matches product defaults', () => {
  assert.deepEqual(DEFAULT_QUALITY_GATE_THRESHOLDS, {
    blocker: 0,
    critical: 0,
    major: 0,
    warn: 5,
    minor: 10,
    trivial: 15,
    cosmetic: 100,
  });
});

test('evaluateQualityGate passes when counts at threshold', () => {
  const counts = countBySeverity([
    { severity: 'warn' },
    { severity: 'warn' },
    { severity: 'minor' },
  ]);
  const r = evaluateQualityGate(counts, DEFAULT_QUALITY_GATE_THRESHOLDS);
  assert.equal(r.pass, true);
  assert.equal(r.total, 3);
});

test('isQualityGateSegmentFilled when count reaches threshold', () => {
  assert.equal(isQualityGateSegmentFilled(5, 5), true);
  assert.equal(isQualityGateSegmentFilled(4, 5), false);
  assert.equal(isQualityGateSegmentFilled(1, 0), true);
  assert.equal(isQualityGateSegmentFilled(0, 0), false);
});

test('evaluateQualityGateCrawlHalt when gate violation units exceed budget', () => {
  const counts = countBySeverity([
    ...Array.from({ length: 3 }, () => ({ severity: 'major' })),
    ...Array.from({ length: 16 }, () => ({ severity: 'warn' })),
  ]);
  const r = evaluateQualityGateCrawlHalt(counts, DEFAULT_QUALITY_GATE_THRESHOLDS, 10);
  assert.equal(r.halt, true);
  assert.ok(r.violationUnits > 10);
});

test('evaluateQualityGateCrawlHalt does not halt at exactly violation budget', () => {
  const counts = countBySeverity(Array.from({ length: 10 }, () => ({ severity: 'warn' })));
  const r = evaluateQualityGateCrawlHalt(counts, DEFAULT_QUALITY_GATE_THRESHOLDS, 10);
  assert.equal(r.halt, false);
  assert.equal(r.violationUnits, 5);
});

test('evaluateQualityGate fails when warn exceeds threshold', () => {
  const findings = Array.from({ length: 6 }, () => ({ severity: 'warn' }));
  const r = evaluateQualityGate(countBySeverity(findings), DEFAULT_QUALITY_GATE_THRESHOLDS);
  assert.equal(r.pass, false);
  assert.equal(r.violations[0].severity, 'warn');
  assert.equal(r.violations[0].overBy, 1);
});

test('formatQualityGateSlashPairs uses short labels', () => {
  const s = formatQualityGateSlashPairs(
    { blocker: 0, critical: 0, major: 0, warn: 78, minor: 0, trivial: 0, cosmetic: 0 },
    DEFAULT_QUALITY_GATE_THRESHOLDS,
  );
  assert.match(s, /B0\/0/);
  assert.match(s, /W78\/5/);
  assert.match(s, /Mi0\/10/);
});

test('parseQualityGateCsv', () => {
  const t = parseQualityGateCsv('0,0,0,5,10,15,100');
  assert.equal(t.warn, 5);
  assert.equal(t.cosmetic, 100);
});

test('pagePassesQualityGate is per-page', () => {
  const thr = { ...DEFAULT_QUALITY_GATE_THRESHOLDS };
  assert.equal(pagePassesQualityGate(Array.from({ length: 5 }, () => ({ severity: 'warn' })), thr), true);
  assert.equal(pagePassesQualityGate(Array.from({ length: 6 }, () => ({ severity: 'warn' })), thr), false);
});
