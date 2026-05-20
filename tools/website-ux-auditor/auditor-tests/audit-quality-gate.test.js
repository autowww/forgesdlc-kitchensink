import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const script = path.join(__dirname, '..', 'audit-quality-gate.mjs');

test('audit-quality-gate --check fails when warn exceeds default threshold', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'qg-audit-'));
  const auditPath = path.join(tmp, 'audit-data.json');
  const findings = Array.from({ length: 6 }, () => ({ severity: 'warn', area: 'metadata', message: 'x' }));
  fs.writeFileSync(auditPath, JSON.stringify({ pages: [{ url: 'http://x/', findings }] }), 'utf8');
  const r = spawnSync(process.execPath, [script, auditPath, '--check'], { encoding: 'utf8' });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /W6\/5/);
});

test('audit-quality-gate --check passes at default warn threshold', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'qg-audit-'));
  const auditPath = path.join(tmp, 'audit-data.json');
  const findings = Array.from({ length: 5 }, () => ({ severity: 'warn', area: 'metadata', message: 'x' }));
  fs.writeFileSync(auditPath, JSON.stringify({ pages: [{ url: 'http://x/', findings }] }), 'utf8');
  const r = spawnSync(process.execPath, [script, auditPath, '--check'], { encoding: 'utf8' });
  assert.equal(r.status, 0);
  assert.match(r.stderr, /PASS/);
});
