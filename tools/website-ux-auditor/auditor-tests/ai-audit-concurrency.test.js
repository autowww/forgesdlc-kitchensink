import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const script = path.join(__dirname, '..', 'cursor-agent-run-ux-audit.sh');

test('cursor-agent-run-ux-audit.sh documents AI concurrency cap', () => {
  const text = fs.readFileSync(script, 'utf8');
  assert.match(text, /FORGE_UX_AI_AUDIT_CONCURRENCY/);
  assert.match(text, /concurrency capped at 3/);
  assert.match(text, /batch-status\.json/);
});

test('ai audit concurrency env rejects zero', () => {
  assert.throws(
    () => {
      execFileSync('bash', ['-c', 'AI_CONCURRENCY="${FORGE_UX_AI_AUDIT_CONCURRENCY:-3}"; [[ "${AI_CONCURRENCY}" =~ ^[1-9][0-9]*$ ]] || exit 2'], {
        env: { ...process.env, FORGE_UX_AI_AUDIT_CONCURRENCY: '0' },
      });
    },
    (err) => err.status === 2,
  );
});
