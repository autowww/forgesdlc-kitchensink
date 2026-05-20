import assert from 'node:assert/strict';
import test from 'node:test';

import {
  findingsFromReactKsAttrsReport,
  isValidKsHashToken,
  run,
} from '../design-rules/deterministic/generated/det-react-ks-attrs.check.js';

test('isValidKsHashToken accepts three distinct ASCII letters', () => {
  assert.equal(isValidKsHashToken('Tdc'), true);
  assert.equal(isValidKsHashToken('abcd'), false);
  assert.equal(isValidKsHashToken('Aaa'), false);
});

test('findingsFromReactKsAttrsReport flags missing and invalid KS attrs', () => {
  const findings = findingsFromReactKsAttrsReport({
    primitiveRootCount: 2,
    violations: [
      { kind: 'missing-data-ks-hash', hash: '?', tag: 'motion', ksName: '' },
      { kind: 'wrong-data-ks-type', hash: 'Tdc', tag: 'div', ksName: 'tile-dropdown-control', ksType: 'component' },
      { kind: 'missing-data-ks-name', hash: 'Fkg', tag: 'div', ksName: '' },
      { kind: 'hash-mismatch', hash: 'Fsb', hashAttr: 'Bad', tag: 'motion', ksName: 'forge-status-banner' },
    ],
  });
  assert.equal(findings.length, 4);
  assert.ok(findings.some((f) => f.message.includes('data-ks-hash')));
  assert.ok(findings.some((f) => f.message.includes('react-primitive')));
  assert.ok(findings.some((f) => f.message.includes('data-ks-name')));
  assert.ok(findings.some((f) => f.severity === 'warn' && f.message.includes('disagree')));
  assert.equal(findings[0].area, 'visual-catalog');
});

test('run returns empty when no react ks attrs report or page', async () => {
  const findings = await run({ metrics: {}, url: 'https://example.test/' });
  assert.deepEqual(findings, []);
});

test('run uses metrics.reactKsAttrsReport when provided', async () => {
  const findings = await run({
    metrics: {
      url: 'https://example.test/showcase/forge-react-primitives.html',
      reactKsAttrsReport: {
        primitiveRootCount: 1,
        violations: [{ kind: 'missing-react-root-flag', hash: 'Wlc', tag: 'div', ksName: 'workspace-lens-control' }],
      },
    },
    url: 'https://example.test/showcase/forge-react-primitives.html',
  });
  assert.equal(findings.length, 1);
  assert.ok(findings[0].message.includes('data-ks-react-root'));
  assert.ok(findings[0].evidence.includes('url=https://example.test/showcase/forge-react-primitives.html'));
});
