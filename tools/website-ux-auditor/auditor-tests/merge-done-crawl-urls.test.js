import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const toolDir = path.resolve(__dirname, '..');
const script = path.join(toolDir, 'merge-done-crawl-urls-from-audit.mjs');

test('merge-done-crawl-urls-from-audit rewrites file to zero-Major+ pages from audit', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ux-done-urls-'));
  const auditPath = path.join(tmp, 'audit-data.json');
  const donePath = path.join(tmp, 'ux-audit-done-crawl-urls.txt');
  fs.writeFileSync(
    auditPath,
    JSON.stringify({
      pages: [
        { url: 'http://127.0.0.1:9/a.html', findings: [{ severity: 'major', area: 'x', message: 'm' }] },
        { url: 'http://127.0.0.1:9/b.html', findings: [{ severity: 'minor', area: 'x', message: 'n' }] },
        { url: 'http://127.0.0.1:9/c.html', findings: [] },
      ],
    }),
    'utf8',
  );
  const r = spawnSync(process.execPath, [script, auditPath, donePath], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  const body = fs.readFileSync(donePath, 'utf8');
  assert.match(body, /http:\/\/127\.0\.0\.1:9\/b\.html/);
  assert.match(body, /http:\/\/127\.0\.0\.1:9\/c\.html/);
  assert.doesNotMatch(body, /\/a\.html/);
});

test('merge-done-crawl-urls-from-audit drops prior entries not clean in this audit', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ux-done-urls-'));
  const auditPath = path.join(tmp, 'audit-data.json');
  const donePath = path.join(tmp, 'ux-audit-done-crawl-urls.txt');
  fs.writeFileSync(
    donePath,
    [
      '# old header',
      'http://127.0.0.1:9/stale-from-old-run.html',
      'http://127.0.0.1:9/b.html',
    ].join('\n'),
    'utf8',
  );
  fs.writeFileSync(
    auditPath,
    JSON.stringify({
      pages: [
        { url: 'http://127.0.0.1:9/b.html', findings: [{ severity: 'minor', area: 'x', message: 'n' }] },
        { url: 'http://127.0.0.1:9/c.html', findings: [] },
      ],
    }),
    'utf8',
  );
  const r = spawnSync(process.execPath, [script, auditPath, donePath], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  const body = fs.readFileSync(donePath, 'utf8');
  assert.match(body, /http:\/\/127\.0\.0\.1:9\/b\.html/);
  assert.match(body, /http:\/\/127\.0\.0\.1:9\/c\.html/);
  assert.doesNotMatch(body, /stale-from-old-run/);
});
