import assert from 'node:assert/strict';
import test from 'node:test';

import {
  VALID_TABLE_HEADER_SCOPES,
  findingsFromTableHeadersReport,
  run,
} from '../design-rules/deterministic/generated/det-data-table-headers.check.js';

test('VALID_TABLE_HEADER_SCOPES lists WAI-ARIA table scopes', () => {
  assert.deepEqual(VALID_TABLE_HEADER_SCOPES, ['col', 'row', 'colgroup', 'rowgroup']);
});

test('findingsFromTableHeadersReport flags tables without header cells', () => {
  const findings = findingsFromTableHeadersReport({
    violations: [
      {
        issue: 'no-header-cells',
        selectorHint: 'table.data-grid',
      },
    ],
  });
  assert.equal(findings.length, 1);
  assert.equal(findings[0].severity, 'major');
  assert.ok(findings[0].message.includes('<th>'));
  assert.ok(findings[0].evidence.includes('missing_table_headers'));
});

test('findingsFromTableHeadersReport flags th without scope', () => {
  const findings = findingsFromTableHeadersReport({
    violations: [
      {
        issue: 'th-missing-scope',
        selectorHint: 'table#metrics',
      },
    ],
  });
  assert.equal(findings.length, 1);
  assert.ok(findings[0].message.includes('scope'));
  assert.ok(findings[0].remediation.includes('scope="col"'));
});

test('findingsFromTableHeadersReport returns empty when no violations', () => {
  const findings = findingsFromTableHeadersReport({ violations: [] });
  assert.deepEqual(findings, []);
});

test('run returns empty when no report or page', async () => {
  const findings = await run({ metrics: {}, url: 'https://example.test/' });
  assert.deepEqual(findings, []);
});

test('run uses metrics.tableHeadersReport when provided', async () => {
  const findings = await run({
    metrics: {
      url: 'https://example.test/tables',
      tableHeadersReport: {
        violations: [
          {
            issue: 'th-missing-scope',
            selectorHint: 'table.compare',
          },
        ],
      },
    },
    url: 'https://example.test/tables',
  });
  assert.equal(findings.length, 1);
  assert.ok(findings[0].evidence.includes('url=https://example.test/tables'));
});
