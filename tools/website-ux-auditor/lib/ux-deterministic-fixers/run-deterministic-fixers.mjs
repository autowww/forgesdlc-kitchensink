#!/usr/bin/env node
/**
 * CLI: run pilot deterministic fixers against audit-data.json findings.
 *
 * Usage:
 *   node lib/ux-deterministic-fixers/run-deterministic-fixers.mjs \
 *     --repo-root PATH --audit-data PATH --out-dir PATH
 *
 * Harness:
 *   FORGE_UX_FIXER_HARNESS=1 --fixture-dir ... --rule-id DET.X
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { runDeterministicFixers } from './index.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  const opts = {
    repoRoot: '',
    auditData: '',
    outDir: '',
    ruleIds: [],
    harness: process.env.FORGE_UX_FIXER_HARNESS === '1',
    fixtureDir: process.env.FORGE_UX_FIXER_FIXTURE_DIR || '',
    fixtureMode: process.env.FORGE_UX_FIXER_FIXTURE_MODE || 'standalone',
    fixtureRoot: process.env.FORGE_UX_FIXER_FIXTURE_ROOT || '',
    repoOverlay: process.env.FORGE_UX_FIXER_REPO_OVERLAY || '',
    skipVerify: false,
    planPath: '',
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--repo-root' && argv[i + 1]) opts.repoRoot = path.resolve(argv[++i]);
    else if (a === '--audit-data' && argv[i + 1]) opts.auditData = path.resolve(argv[++i]);
    else if (a === '--out-dir' && argv[i + 1]) opts.outDir = path.resolve(argv[++i]);
    else if (a === '--rule-id' && argv[i + 1]) opts.ruleIds.push(argv[++i]);
    else if (a === '--harness') opts.harness = true;
    else if (a === '--fixture-dir' && argv[i + 1]) opts.fixtureDir = path.resolve(argv[++i]);
    else if (a === '--fixture-mode' && argv[i + 1]) opts.fixtureMode = argv[++i];
    else if (a === '--fixture-root' && argv[i + 1]) opts.fixtureRoot = path.resolve(argv[++i]);
    else if (a === '--repo-overlay' && argv[i + 1]) opts.repoOverlay = path.resolve(argv[++i]);
    else if (a === '--skip-verify') opts.skipVerify = true;
    else if (a === '--plan' && argv[i + 1]) opts.planPath = path.resolve(argv[++i]);
    else if (a === '--help' || a === '-h') {
      console.log(`Usage: node run-deterministic-fixers.mjs --repo-root R --audit-data A --out-dir O [options]

  --rule-id ID          Repeatable; default: all pilot rules with findings
  --harness             Harness mode (handbook_after adapter)
  --fixture-dir PATH
  --fixture-mode MODE
  --fixture-root PATH
  --repo-overlay PATH
  --skip-verify         Apply only; no expect-rule-clean
  --plan PATH           Trim plan todos after verify`);
      process.exit(0);
    }
  }
  if (!opts.outDir && opts.auditData) {
    opts.outDir = path.dirname(opts.auditData);
  }
  return opts;
}

async function main() {
  const opts = parseArgs(process.argv);
  if (!opts.repoRoot || !opts.auditData || !opts.outDir) {
    console.error('run-deterministic-fixers: --repo-root, --audit-data, --out-dir required');
    process.exit(2);
  }
  const { report, reportPath } = await runDeterministicFixers({
    repoRoot: opts.repoRoot,
    auditDataPath: opts.auditData,
    outDir: opts.outDir,
    ruleIds: opts.ruleIds.length ? opts.ruleIds : undefined,
    harness: opts.harness,
    fixtureDir: opts.fixtureDir,
    fixtureMode: opts.fixtureMode,
    fixtureRoot: opts.fixtureRoot,
    repoOverlay: opts.repoOverlay,
    skipVerify: opts.skipVerify,
    planPath: opts.planPath,
  });
  console.error(
    `run-deterministic-fixers: report → ${reportPath} applied=${report.summary.applied} verifyOk=${report.summary.verifyOk} agentRequired=${report.summary.agentRequired}`,
  );
  if (report.summary.agentRequired > 0 && process.env.FORGE_UX_FIXERS_ONLY === '1') {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
