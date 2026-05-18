import assert from 'node:assert/strict';
import fsp from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  archiveAuditDataToPrevious,
  extractMajorPlusUrlsFromPriorAudit,
  buildRegressionWaveSummary,
  normalizeAuditUrl,
} from '../lib/incremental-audit.js';
import { createLogger } from '../lib/logger.js';

test('normalizeAuditUrl strips hash', () => {
  assert.equal(normalizeAuditUrl('https://ex.test/a#x'), 'https://ex.test/a');
});

test('extractMajorPlusUrlsFromPriorAudit caps and dedupes', () => {
  const parsed = {
    pages: [
      { url: 'https://ex.test/a#h', findings: [{ severity: 'major' }] },
      { url: 'https://ex.test/a', findings: [{ severity: 'minor' }] },
      { url: 'https://ex.test/b', findings: [{ severity: 'blocker' }] },
    ],
  };
  const urls = extractMajorPlusUrlsFromPriorAudit(parsed, 1);
  assert.equal(urls.length, 1);
  assert.equal(urls[0], 'https://ex.test/a');
});

test('buildRegressionWaveSummary compares prior vs regression pages', () => {
  const prev = {
    pages: [{ url: 'https://ex.test/a', findings: [{ severity: 'critical' }, { severity: 'major' }] }],
  };
  const regressionPages = [{ url: 'https://ex.test/a', findings: [{ severity: 'major' }] }];
  const sum = buildRegressionWaveSummary(prev, regressionPages);
  assert.equal(sum.urlsChecked, 1);
  assert.equal(sum.rows[0].priorMajorPlusCount, 2);
  assert.equal(sum.rows[0].currentMajorPlusCount, 1);
  assert.equal(sum.rows[0].deltaMajorPlus, -1);
});

test('archiveAuditDataToPrevious copies when audit-data.json exists', async () => {
  const dir = await fsp.mkdtemp(path.join(os.tmpdir(), 'ux-audit-arch-'));
  const cur = path.join(dir, 'audit-data.json');
  await fsp.writeFile(cur, '{"ok":true}\n', 'utf8');
  const logger = createLogger(0);
  const ok = await archiveAuditDataToPrevious(dir, logger);
  assert.equal(ok, true);
  const prev = JSON.parse(await fsp.readFile(path.join(dir, 'audit-data.previous.json'), 'utf8'));
  assert.equal(prev.ok, true);
});

test('createLogger verbose prints structured markers (stderr)', () => {
  const lines = [];
  const orig = console.error;
  console.error = (msg) => {
    lines.push(String(msg));
  };
  try {
    const log = createLogger(1);
    log.verbose('[incremental]', 'hello', 'detail');
    assert.ok(lines.some((l) => l.includes('[incremental]') && l.includes('hello')));
  } finally {
    console.error = orig;
  }
});
