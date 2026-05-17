import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { makeFinding } from '../lib/severity.js';
import { writeRcaPromptBatch } from '../lib/rca.js';

test('writeRcaPromptBatch writes markdown files for priority findings', async () => {
  const out = await mkdtemp(join(tmpdir(), 'ks-ux-rca-'));
  const pages = [
    {
      url: 'https://fixture.test/',
      screenshot: 'screenshots/01-fixture.png',
      findings: [
        makeFinding({
          severity: 'major',
          checkId: 'test-check',
          area: 'conversion',
          message: 'Issue one',
          evidence: 'Evidence',
          remediation: 'Fix it',
        }),
      ],
    },
  ];
  const res = await writeRcaPromptBatch({
    outDir: out,
    pages,
    args: { repo: '/fixture/repo' },
    profile: { name: 'Fixture' },
    runMeta: { auditRunId: 'deadbeefdeadbeef', generatedAt: '2026-01-02T00:00:00.000Z' },
    designStandard: {
      path: '/p',
      id: 'std',
      updated: 'u',
      sha256: 'aa'.repeat(32),
      rawSnippet: '# Snip\n',
    },
    crawlSummary: { stopReason: 'normal_completion' },
  });
  assert.equal(res.count >= 1, true);
  assert.ok(typeof res.dir === 'string');
  const firstMd = join(res.dir, 'deadbeefdeadbeef-f00.md');
  const text = await readFile(firstMd, 'utf8');
  assert.ok(text.includes('finding_id:'));
  assert.ok(text.includes('Issue one'));
  assert.ok(text.includes('screenshots/01-fixture.png'));
  await rm(out, { recursive: true, force: true });
});
