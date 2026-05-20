import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const toolRoot = path.resolve(__dirname, '..');
const mergeScript = path.resolve(toolRoot, 'merge-done-crawl-urls-from-audit.mjs');

test('done-crawl merge writes design rule fingerprint header', async () => {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ux-audit-merge-'));
  const auditPath = path.join(tmpDir, 'audit-data.json');
  const donePath = path.join(tmpDir, 'done.txt');
  await fs.writeFile(
    auditPath,
    JSON.stringify({
      crawlSummary: { designRuleRegistryFingerprint: 'abc123' },
      pages: [
        { url: 'https://fixture.test/', findings: [] },
      ],
    }),
    'utf8',
  );

  const run = spawnSync('node', [mergeScript, auditPath, donePath], { cwd: toolRoot, encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr || run.stdout);
  const text = await fs.readFile(donePath, 'utf8');
  assert.match(text, /design_rules_registry_fingerprint=abc123/);
});
