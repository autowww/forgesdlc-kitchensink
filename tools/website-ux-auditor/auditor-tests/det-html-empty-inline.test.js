import assert from 'node:assert/strict';
import test from 'node:test';

import {
  findingsFromEmptyInlineReport,
  run,
} from '../design-rules/deterministic/generated/det-html-empty-inline.check.js';

test('findingsFromEmptyInlineReport flags empty strong and em counts', () => {
  const findings = findingsFromEmptyInlineReport(
    { emptyStrongCount: 2, emptyEmCount: 1 },
    'https://example.test/chapter',
  );
  assert.equal(findings.length, 2);
  assert.equal(findings[0].severity, 'minor');
  assert.ok(findings[0].message.includes('empty <strong>'));
  assert.ok(findings[0].evidence.includes('empty_strong_count=2'));
  assert.ok(findings[0].evidence.includes('url=https://example.test/chapter'));
  assert.equal(findings[1].severity, 'trivial');
});

test('findingsFromEmptyInlineReport returns empty when counts are zero', () => {
  assert.deepEqual(findingsFromEmptyInlineReport({ emptyStrongCount: 0, emptyEmCount: 0 }), []);
});

test('run uses metrics.emptyInlineReport without page', async () => {
  const findings = await run({
    metrics: { emptyInlineReport: { emptyStrongCount: 1, emptyEmCount: 0 } },
    url: 'https://example.test/page',
  });
  assert.equal(findings.length, 1);
});
