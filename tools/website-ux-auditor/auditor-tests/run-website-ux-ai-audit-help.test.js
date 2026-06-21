import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import test from 'node:test';

const TOOL_ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const RUNNER = path.join(TOOL_ROOT, 'run-website-ux-ai-audit.mjs');

test('run-website-ux-ai-audit.mjs --help exits 0', () => {
  const out = execFileSync(process.execPath, [RUNNER, '--help'], { encoding: 'utf8' });
  assert.match(out, /--manifest-only/);
  assert.match(out, /--execute/);
  assert.match(out, /--merge-score/);
});
