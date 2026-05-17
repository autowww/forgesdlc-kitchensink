import assert from 'node:assert/strict';
import test from 'node:test';

import { makeFinding } from '../lib/severity.js';
import { scorePage } from '../lib/scoring.js';

function baseMetrics() {
  return {
    firstH1: { text: 'x', words: 5 },
    topCtas: [{ text: 'Get started' }],
    trustTermCount: 10,
    ecosystemTermCount: 4,
    wordCount: 800,
  };
}

test('scorePage ignores falsy findings and applies penalties', () => {
  const findings = [
    makeFinding({
      severity: 'major',
      checkId: 't',
      area: 'x',
      message: 'm',
      evidence: 'e',
      remediation: 'r',
    }),
    undefined,
    null,
    makeFinding({
      severity: 'trivial',
      checkId: 't',
      area: 'y',
      message: 'm2',
      evidence: 'e2',
      remediation: 'r2',
    }),
  ];
  const s = scorePage(baseMetrics(), findings);
  assert.ok(typeof s === 'number');
  assert.ok(s <= 100);
  assert.ok(s >= 0);
});
