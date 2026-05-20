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

const FIXTURE_DET_RULES = ['DET.PAGE.LANG', 'DET.PAGE.TITLE'];

function detTraceForRules(ruleIds, status = 'ran') {
  return ruleIds.map((ruleId) => ({ ruleId, status, findingsCount: 0 }));
}

function setupHarness(qualityGatePass, { aiEligible = true } = {}) {
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
  const eligibleJson = aiEligible
    ? JSON.stringify({
        stopReason: 'normal_completion',
        queuedRemainingAtStop: 0,
        pagesCaptured: 2,
        pagesPlannedBudget: 2,
        deterministicImplementedRuleIds: FIXTURE_DET_RULES,
      })
    : JSON.stringify({
        stopReason: 'backlog_threshold',
        queuedRemainingAtStop: 4,
        pagesCaptured: 2,
        pagesPlannedBudget: 10,
        deterministicImplementedRuleIds: FIXTURE_DET_RULES,
      });
  const detTrace = JSON.stringify(detTraceForRules(FIXTURE_DET_RULES));
  const pagesJson = aiEligible
    ? JSON.stringify([
        {
          url: 'http://127.0.0.1:9999/',
          findings: [],
          ruleExecution: { deterministic: JSON.parse(detTrace) },
        },
        {
          url: 'http://127.0.0.1:9999/docs-start.html',
          findings: [],
          ruleExecution: { deterministic: JSON.parse(detTrace) },
        },
      ])
    : JSON.stringify([
        { url: 'http://127.0.0.1:9999/', findings: [{ severity: 'minor', message: 'small issue' }] },
        { url: 'http://127.0.0.1:9999/docs-start.html', findings: [{ severity: 'minor', message: 'small issue' }] },
      ]);
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
  staticOnly: false,
  pages: ${pagesJson},
  crawlSummary: ${eligibleJson}
}, null, 2) + '\\n', 'utf8');
fs.writeFileSync(path.join(out, 'forge-ux-remediation.plan.md'), 'plan\\n', 'utf8');
console.log('fake auditor complete');
`,
  );

  const fakeCompletion = path.join(root, 'fake-loop-completion.mjs');
  const passFlag = qualityGatePass ? '1' : '0';
  makeNodeTool(
    fakeCompletion,
    `
const pass = ${JSON.stringify(passFlag)} === '1';
const args = process.argv.slice(2);
if (args.includes('--check') || args.includes('--check-all-bars')) {
  if (pass) {
    console.error('loop-completion: PASS · fixture');
    process.exit(0);
  }
  console.error('loop-completion: FAIL · fixture');
  process.exit(1);
}
process.stdout.write(pass ? '1' : '0');
`,
  );

  const fakePlan = path.join(root, 'fake-plan.sh');
  writeExecutable(fakePlan, `#!/usr/bin/env bash\nset -euo pipefail\necho plan >> "$2.plan-run.log"\n`, 0o755);

  const fakeAi = path.join(root, 'fake-ai.sh');
  writeExecutable(fakeAi, `#!/usr/bin/env bash\nset -euo pipefail\nmkdir -p "$2/ai-audit"\nprintf '%s\\n' '{"totalFindings":2,"majorPlusFindingCount":1}' > "$2/ai-audit/ai-audit-data.json"\nprintf '%s\\n' '# ai audit' > "$2/ai-audit/ai-audit-report.md"\necho ai >> "$2/ai-ran.log"\n`, 0o755);

  const fakeAgent = path.join(bin, 'agent');
  writeExecutable(fakeAgent, '#!/usr/bin/env bash\nexit 0\n', 0o755);

  return { root, repo, site, fakeScorer, fakeAuditor, fakeCompletion, fakePlan, fakeAi, bin };
}

test('loop runs AI audit only on quality-gate pass single-pass branch', () => {
  const h = setupHarness(true);
  const outDir = path.join(h.root, 'out');
  const res = spawnSync('bash', [loopScript, h.repo, h.site], {
    encoding: 'utf8',
    env: {
      ...process.env,
      PATH: `${h.bin}:${process.env.PATH || ''}`,
      CURSOR_API_KEY: 'fixture',
      UX_AUDIT_OUT_DIR: outDir,
      FORGE_UX_LOOP_UNTIL_QUALITY_GATE: '0',
      FORGE_UX_SKIP_DONE_CRAWL_MERGE: '1',
      FORGE_UX_ENABLE_AI_AUDIT: '1',
      FORGE_UX_SCORER_BIN: h.fakeScorer,
      FORGE_UX_AUDITOR_BIN: h.fakeAuditor,
      FORGE_UX_LOOP_COMPLETION_BIN: h.fakeCompletion,
      FORGE_UX_LOOP_ALL_BARS: '0',
      FORGE_UX_RUN_PLAN_BIN: h.fakePlan,
      FORGE_UX_RUN_AI_AUDIT_BIN: h.fakeAi,
    },
  });
  assert.equal(res.status, 0, `${res.stderr}\n${res.stdout}`);
  assert.equal(fs.existsSync(path.join(outDir, 'ai-ran.log')), true);
  assert.equal(fs.existsSync(path.join(outDir, 'forge-ux-remediation.plan.md.plan-run.log')), false);
  assert.match(res.stderr, /single-pass — loop complete/);
});

test('loop skips AI audit when quality gate passes but crawl is incomplete', () => {
  const h = setupHarness(true, { aiEligible: false });
  const outDir = path.join(h.root, 'out-partial');
  const res = spawnSync('bash', [loopScript, h.repo, h.site], {
    encoding: 'utf8',
    env: {
      ...process.env,
      PATH: `${h.bin}:${process.env.PATH || ''}`,
      CURSOR_API_KEY: 'fixture',
      UX_AUDIT_OUT_DIR: outDir,
      FORGE_UX_LOOP_UNTIL_QUALITY_GATE: '0',
      FORGE_UX_SKIP_DONE_CRAWL_MERGE: '1',
      FORGE_UX_ENABLE_AI_AUDIT: '1',
      FORGE_UX_SCORER_BIN: h.fakeScorer,
      FORGE_UX_AUDITOR_BIN: h.fakeAuditor,
      FORGE_UX_LOOP_COMPLETION_BIN: h.fakeCompletion,
      FORGE_UX_LOOP_ALL_BARS: '0',
      FORGE_UX_RUN_PLAN_BIN: h.fakePlan,
      FORGE_UX_RUN_AI_AUDIT_BIN: h.fakeAi,
    },
  });
  assert.equal(res.status, 0, `${res.stderr}\n${res.stdout}`);
  assert.equal(fs.existsSync(path.join(outDir, 'ai-ran.log')), false);
  assert.match(res.stderr, /skipping AI audit/);
});

test('loop runs AI audit when FORGE_UX_FORCE_AI_AUDIT=1 despite incomplete crawl', () => {
  const h = setupHarness(true, { aiEligible: false });
  const outDir = path.join(h.root, 'out-force');
  const res = spawnSync('bash', [loopScript, h.repo, h.site], {
    encoding: 'utf8',
    env: {
      ...process.env,
      PATH: `${h.bin}:${process.env.PATH || ''}`,
      CURSOR_API_KEY: 'fixture',
      UX_AUDIT_OUT_DIR: outDir,
      FORGE_UX_LOOP_UNTIL_QUALITY_GATE: '0',
      FORGE_UX_SKIP_DONE_CRAWL_MERGE: '1',
      FORGE_UX_ENABLE_AI_AUDIT: '1',
      FORGE_UX_FORCE_AI_AUDIT: '1',
      FORGE_UX_SCORER_BIN: h.fakeScorer,
      FORGE_UX_AUDITOR_BIN: h.fakeAuditor,
      FORGE_UX_LOOP_COMPLETION_BIN: h.fakeCompletion,
      FORGE_UX_LOOP_ALL_BARS: '0',
      FORGE_UX_RUN_PLAN_BIN: h.fakePlan,
      FORGE_UX_RUN_AI_AUDIT_BIN: h.fakeAi,
    },
  });
  assert.equal(res.status, 0, `${res.stderr}\n${res.stdout}`);
  assert.equal(fs.existsSync(path.join(outDir, 'ai-ran.log')), true);
});

test('loop skips AI audit when quality gate fails and goes to remediation', () => {
  const h = setupHarness(false);
  const outDir = path.join(h.root, 'out');
  const res = spawnSync('bash', [loopScript, h.repo, h.site], {
    encoding: 'utf8',
    env: {
      ...process.env,
      PATH: `${h.bin}:${process.env.PATH || ''}`,
      CURSOR_API_KEY: 'fixture',
      UX_AUDIT_OUT_DIR: outDir,
      FORGE_UX_LOOP_UNTIL_QUALITY_GATE: '0',
      FORGE_UX_SKIP_DONE_CRAWL_MERGE: '1',
      FORGE_UX_ENABLE_AI_AUDIT: '1',
      FORGE_UX_SCORER_BIN: h.fakeScorer,
      FORGE_UX_AUDITOR_BIN: h.fakeAuditor,
      FORGE_UX_LOOP_COMPLETION_BIN: h.fakeCompletion,
      FORGE_UX_LOOP_ALL_BARS: '0',
      FORGE_UX_RUN_PLAN_BIN: h.fakePlan,
      FORGE_UX_RUN_AI_AUDIT_BIN: h.fakeAi,
    },
  });
  assert.equal(res.status, 0, `${res.stderr}\n${res.stdout}`);
  assert.equal(fs.existsSync(path.join(outDir, 'ai-ran.log')), false);
  assert.equal(fs.existsSync(path.join(outDir, 'forge-ux-remediation.plan.md.plan-run.log')), true);
});

test('loop skips AI audit when FORGE_UX_ENABLE_AI_AUDIT=0 on quality-gate pass single-pass', () => {
  const h = setupHarness(true);
  const outDir = path.join(h.root, 'out-no-ai');
  const res = spawnSync('bash', [loopScript, h.repo, h.site], {
    encoding: 'utf8',
    env: {
      ...process.env,
      PATH: `${h.bin}:${process.env.PATH || ''}`,
      CURSOR_API_KEY: 'fixture',
      UX_AUDIT_OUT_DIR: outDir,
      FORGE_UX_LOOP_UNTIL_QUALITY_GATE: '0',
      FORGE_UX_SKIP_DONE_CRAWL_MERGE: '1',
      FORGE_UX_ENABLE_AI_AUDIT: '0',
      FORGE_UX_SCORER_BIN: h.fakeScorer,
      FORGE_UX_AUDITOR_BIN: h.fakeAuditor,
      FORGE_UX_LOOP_COMPLETION_BIN: h.fakeCompletion,
      FORGE_UX_LOOP_ALL_BARS: '0',
      FORGE_UX_RUN_PLAN_BIN: h.fakePlan,
      FORGE_UX_RUN_AI_AUDIT_BIN: h.fakeAi,
    },
  });
  assert.equal(res.status, 0, `${res.stderr}\n${res.stdout}`);
  assert.equal(fs.existsSync(path.join(outDir, 'ai-ran.log')), false);
  assert.match(res.stderr, /single-pass — loop complete/);
});
