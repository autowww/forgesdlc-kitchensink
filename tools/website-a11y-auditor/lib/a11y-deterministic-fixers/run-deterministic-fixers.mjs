#!/usr/bin/env node
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
    harness: process.env.FORGE_A11Y_FIXER_HARNESS === '1',
    fixtureDir: process.env.FORGE_A11Y_FIXER_FIXTURE_DIR || '',
    fixtureMode: process.env.FORGE_A11Y_FIXER_FIXTURE_MODE || 'standalone',
    skipVerify: false,
  };
  for (let i = 2; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--repo-root' && argv[i + 1]) opts.repoRoot = path.resolve(argv[++i]);
    else if (a === '--audit-data' && argv[i + 1]) opts.auditData = path.resolve(argv[++i]);
    else if (a === '--out-dir' && argv[i + 1]) opts.outDir = path.resolve(argv[++i]);
    else if (a === '--rule-id' && argv[i + 1]) opts.ruleIds.push(argv[++i]);
    else if (a === '--harness') opts.harness = true;
    else if (a === '--fixture-dir' && argv[i + 1]) opts.fixtureDir = path.resolve(argv[++i]);
    else if (a === '--fixture-mode' && argv[i + 1]) opts.fixtureMode = argv[++i];
    else if (a === '--skip-verify') opts.skipVerify = true;
  }
  if (!opts.outDir && opts.auditData) opts.outDir = path.dirname(opts.auditData);
  return opts;
}

async function main() {
  const opts = parseArgs(process.argv);
  if (!opts.repoRoot || !opts.auditData || !opts.outDir) {
    console.error('run-deterministic-fixers: --repo-root, --audit-data, --out-dir required');
    process.exit(2);
  }
  const { reportPath } = await runDeterministicFixers({
    repoRoot: opts.repoRoot,
    auditDataPath: opts.auditData,
    outDir: opts.outDir,
    ruleIds: opts.ruleIds.length ? opts.ruleIds : undefined,
    harness: opts.harness,
    fixtureDir: opts.fixtureDir,
    fixtureMode: opts.fixtureMode,
    skipVerify: opts.skipVerify,
  });
  console.log(`wrote ${reportPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
