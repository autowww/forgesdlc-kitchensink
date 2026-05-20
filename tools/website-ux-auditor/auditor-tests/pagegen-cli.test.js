import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const toolRoot = path.resolve(__dirname, '..');
const pagegenScript = path.resolve(
  toolRoot,
  'design-rules/blender/cursor-agent-generate-rule-pages.sh',
);

test('pagegen --help documents --concurrency', () => {
  const run = spawnSync('bash', [pagegenScript, '--help'], {
    cwd: toolRoot,
    encoding: 'utf8',
  });
  assert.equal(run.status, 0, run.stderr || run.stdout);
  assert.match(run.stderr || run.stdout, /--concurrency/);
  assert.match(run.stderr || run.stdout, /FORGE_UX_PAGE_GEN_CONCURRENCY/);
});

test('pagegen rejects --concurrency 0', () => {
  const run = spawnSync('bash', [pagegenScript, '--concurrency', '0', '--dry-run'], {
    cwd: toolRoot,
    encoding: 'utf8',
  });
  assert.equal(run.status, 2, run.stderr || run.stdout);
  assert.match(run.stderr || run.stdout, /Invalid --concurrency/i);
});
