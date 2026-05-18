import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync, rmSync } from 'node:fs';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const __dirname = dirname(fileURLToPath(import.meta.url));
const auditorRoot = join(__dirname, '..');
const analyzeScript = join(auditorRoot, 'analyze-website-ux.mjs');
const fixtureRepo = join(__dirname, 'fixtures', 'minimal-repo');

test('CLI: static audit exits 0 and writes schema v2 audit-data.json', () => {
  const out = mkdtempSync(join(tmpdir(), 'ux-audit-cli-'));
  const r = spawnSync(
    process.execPath,
    [analyzeScript, '--repo', fixtureRepo, '--static-only', '--out', out, '--no-mirror-root-plan', '--no-ux-csv'],
    { encoding: 'utf8' },
  );
  assert.equal(r.status, 0, r.stderr || r.stdout);
  assert.match(r.stderr || '', /\[ux-audit\] phase=startup/);
  assert.match(r.stderr || '', /\[ux-audit\] phase=inventory · done/);
  assert.match(r.stderr || '', /\[ux-audit\] phase=static_only/);
  const data = JSON.parse(readFileSync(join(out, 'audit-data.json'), 'utf8'));
  assert.equal(data.schemaVersion, 2);
  assert.ok(data.designStandard?.sha256 && data.designStandard.sha256.length === 64);
  assert.equal(data.crawlSummary?.crawlMode, 'static_only');
  assert.equal(data.crawlSummary?.stopReason, 'static_only');
  assert.ok(data.uxScores && typeof data.uxScores.overall === 'number');
  assert.strictEqual(data.uxScoreDeltaVsPrior, null);
  assert.strictEqual(data.priorUxScoresSnapshot, null);
  assert.strictEqual(data.precrawlUxScores, null);
  assert.strictEqual(data.uxQualityScoreLoopDelta ?? null, null);
  assert.ok(Array.isArray(data.pages) && data.pages.length === 1);
  const first = data.pages[0].findings || [];
  assert.ok(first.length >= 1);
  for (const f of first) {
    assert.ok(f.severity);
    assert.ok(f.legacySeverity);
  }
  rmSync(out, { recursive: true, force: true });
});
