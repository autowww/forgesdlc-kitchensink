import assert from 'node:assert/strict';
import test from 'node:test';

import {
  compareFindingSeverity,
  countMajorPlus,
  isMajorPlus,
  legacySeverityFrom,
  makeFinding,
  severityRank,
  summarizeBySeverity,
} from '../lib/severity.js';

test('severityRank orders worst-first (lower rank = worse)', () => {
  assert.ok(severityRank('blocker') < severityRank('critical'));
  assert.ok(severityRank('critical') < severityRank('major'));
  assert.ok(severityRank('major') < severityRank('minor'));
});

test('isMajorPlus is true for blocker crit major only', () => {
  assert.equal(isMajorPlus('blocker'), true);
  assert.equal(isMajorPlus('major'), true);
  assert.equal(isMajorPlus('minor'), false);
});

test('makeFinding adds legacySeverity mapping', () => {
  const f = makeFinding({
    severity: 'critical',
    area: 'hero',
    message: 'm',
    evidence: 'e',
    remediation: 'r',
    checkId: 't',
  });
  assert.equal(f.severity, 'critical');
  assert.equal(f.legacySeverity, legacySeverityFrom('critical'));
});

test('summarizeBySeverity counts tiers', () => {
  const a = summarizeBySeverity([
    makeFinding({ severity: 'major', area: 'a', message: '', evidence: '', remediation: '' }),
    makeFinding({ severity: 'major', area: 'a', message: '', evidence: '', remediation: '' }),
    makeFinding({ severity: 'trivial', area: 'a', message: '', evidence: '', remediation: '' }),
  ]);
  assert.equal(a.major, 2);
  assert.equal(a.trivial, 1);
});

test('countMajorPlus matches isMajorPlus', () => {
  const list = ['blocker', 'minor', 'major', 'cosmetic'].map((severity) =>
    makeFinding({ severity, area: 'x', message: '', evidence: '', remediation: '' }),
  );
  assert.equal(countMajorPlus(list), 2);
});

test('compareFindingSeverity sorts blocker before minor then URL', () => {
  const a = makeFinding({ severity: 'minor', area: 'x', message: '', evidence: '', remediation: '', url: 'http://z' });
  const b = makeFinding({ severity: 'blocker', area: 'x', message: '', evidence: '', remediation: '', url: 'http://a' });
  assert.ok(compareFindingSeverity(b, a) < 0);
});
