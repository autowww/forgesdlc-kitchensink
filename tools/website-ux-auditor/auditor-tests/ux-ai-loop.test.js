import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const toolDir = path.join(__dirname, '..');
const loopScript = path.join(toolDir, 'run-website-ux-remediation-loop.sh');

function writeExecutable(filePath, body, mode = 0o755) {
  fs.writeFileSync(filePath, body, 'utf8');
  fs.chmodSync(filePath, mode);
}

function makeNodeTool(filePath, source) {
  writeExecutable(filePath, `#!/usr/bin/env node\n${source}\n`);
}

function setupHarness(majorPlusCount) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ux-ai-loop-'));
  const repo = path.join(root, 'repo');
  const site = path.join(repo, 'website');
  const bin = path.join(root, 'bin');
  fs.mkdirSync(repo, { recursive: true });
  fs.mkdirSync(site, { recursive: true });
  fs.mkdirSync(bin, { recursive: true });
  fs.writeFileSync(path.join(site, 'index.html'), '<!doctype html><html><body>fixture</body></html>\n', 'utf8');

  const fakeScorer = path.join(root, 'fake-score.mjs');
  makeNodeTool(fakeScorer, 'process.exit(0);');

  const fakeAuditor = path.join(root, 'fake-audit.mjs');
  makeNodeTool(
    fakeAuditor,
    `
import fs from 'node:fs';
import path from 'node:path';
const args = process.argv.slice(2);
let out = null;
for (let i = 0; i < args.length; i += 1) {
  if (args[i] === '--out') out = args[i + 1];
}
if (!out) process.exit(2);
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, 'audit-data.json'), JSON.stringify({
  auditRunId: 'fixture-run',
  generatedAt: '2026-05-18T00:00:00.000Z',
  pages: [
    { url: 'http://127.0.0.1:9999/', findings: [] },
    { url: 'http://127.0.0.1:9999/docs-start.html', findings: [{ severity: 'minor', message: 'small issue' }] }
  ],
  crawlSummary: { stopReason: 'normal_completion', queuedRemainingAtStop: 0 }
}, null, 2) + '\\n', 'utf8');
fs.writeFileSync(path.join(out, 'forge-ux-remediation.plan.md'), 'plan\\n', 'utf8');
console.log('fake auditor complete');
`,
  );

  const fakeMajor = path.join(root, 'fake-major.mjs');
  makeNodeTool(fakeMajor, `process.stdout.write(${JSON.stringify(String(majorPlusCount))});`);

  const fakePlan = path.join(root, 'fake-plan.sh');
  writeExecutable(fakePlan, `#!/usr/bin/env bash\nset -euo pipefail\necho plan >> "$2.plan-run.log"\n`, 0o755);

  const fakeAi = path.join(root, 'fake-ai.sh');
  writeExecutable(fakeAi, `#!/usr/bin/env bash\nset -euo pipefail\nmkdir -p "$2/ai-audit"\nprintf '%s\\n' '{"totalFindings":2,"majorPlusFindingCount":1}' > "$2/ai-audit/ai-audit-data.json"\nprintf '%s\\n' '# ai audit' > "$2/ai-audit/ai-audit-report.md"\necho ai >> "$2/ai-ran.log"\n`, 0o755);

  const fakeAgent = path.join(bin, 'agent');
  writeExecutable(fakeAgent, '#!/usr/bin/env bash\nexit 0\n', 0o755);

  return { root, repo, site, fakeScorer, fakeAuditor, fakeMajor, fakePlan, fakeAi, bin };
}

test('loop runs AI audit only on deterministic-clean single-pass branch', () => {
  const h = setupHarness(0);
  const outDir = path.join(h.root, 'out');
  const res = spawnSync('bash', [loopScript, h.repo, h.site], {
    encoding: 'utf8',
    env: {
      ...process.env,
      PATH: `${h.bin}:${process.env.PATH || ''}`,
      CURSOR_API_KEY: 'fixture',
      UX_AUDIT_OUT_DIR: outDir,
      FORGE_UX_LOOP_UNTIL_MAJOR_CLEAN: '0',
      FORGE_UX_SKIP_DONE_CRAWL_MERGE: '1',
      FORGE_UX_ENABLE_AI_AUDIT: '1',
      FORGE_UX_SCORER_BIN: h.fakeScorer,
      FORGE_UX_AUDITOR_BIN: h.fakeAuditor,
      FORGE_UX_MAJOR_PLUS_COUNT_BIN: h.fakeMajor,
      FORGE_UX_RUN_PLAN_BIN: h.fakePlan,
      FORGE_UX_RUN_AI_AUDIT_BIN: h.fakeAi,
    },
  });
  assert.equal(res.status, 0, `${res.stderr}\n${res.stdout}`);
  assert.equal(fs.existsSync(path.join(outDir, 'ai-ran.log')), true);
  assert.equal(fs.existsSync(path.join(outDir, 'forge-ux-remediation.plan.md.plan-run.log')), false);
  assert.match(res.stderr, /single-pass clean — no remediation agent needed/);
});

test('loop skips AI audit when deterministic Major\\+ remains and goes to remediation', () => {
  const h = setupHarness(3);
  const outDir = path.join(h.root, 'out');
  const res = spawnSync('bash', [loopScript, h.repo, h.site], {
    encoding: 'utf8',
    env: {
      ...process.env,
      PATH: `${h.bin}:${process.env.PATH || ''}`,
      CURSOR_API_KEY: 'fixture',
      UX_AUDIT_OUT_DIR: outDir,
      FORGE_UX_LOOP_UNTIL_MAJOR_CLEAN: '0',
      FORGE_UX_SKIP_DONE_CRAWL_MERGE: '1',
      FORGE_UX_ENABLE_AI_AUDIT: '1',
      FORGE_UX_SCORER_BIN: h.fakeScorer,
      FORGE_UX_AUDITOR_BIN: h.fakeAuditor,
      FORGE_UX_MAJOR_PLUS_COUNT_BIN: h.fakeMajor,
      FORGE_UX_RUN_PLAN_BIN: h.fakePlan,
      FORGE_UX_RUN_AI_AUDIT_BIN: h.fakeAi,
    },
  });
  assert.equal(res.status, 0, `${res.stderr}\n${res.stdout}`);
  assert.equal(fs.existsSync(path.join(outDir, 'ai-ran.log')), false);
  assert.equal(fs.existsSync(path.join(outDir, 'forge-ux-remediation.plan.md.plan-run.log')), true);
});
