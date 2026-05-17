import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { computeUxScores } from '../lib/design-ux-score.js';
import {
  appendUxScoringCsv,
  uxScoringCsvHeaderLine,
  UX_SCORING_CSV_FILENAME,
} from '../lib/ux-scoring-csv.js';

test('ux-scoring CSV: writes header once then appends rows', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'ux-scoring-test-'));
  try {
    const ux = computeUxScores({
      pages: [{ url: 'http://t/', findings: [] }],
      crawlSummary: { stopReason: 'normal_completion', crawlMode: 'full_budget_within_max_pages' },
      staticOnly: false,
    });
    await appendUxScoringCsv(dir, {
      generatedAt: '2099-01-01T00:00:00.000Z',
      tool: 'test',
      runSegment: 'unit',
      siteKind: 'generic',
      runId: 'abc',
      siteUrl: 'http://localhost/',
      uxScores: ux,
      crawlSummary: { crawlMode: 'full_budget_within_max_pages', stopReason: 'normal_completion' },
    });
    const text = readFileSync(join(dir, UX_SCORING_CSV_FILENAME), 'utf8');
    const lines = text.trim().split('\n');
    assert.equal(lines.length, 2);
    assert.equal(lines[0], uxScoringCsvHeaderLine());
    assert.ok(lines[1].startsWith('2099-01-01T'));
    assert.ok(lines[1].includes(',test,unit,generic,abc,'));
    assert.ok(lines[1].includes(',100,'));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
