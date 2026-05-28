#!/usr/bin/env node
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { runAiFixers } from './index.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  const opts = { auditData: '', outDir: '', ruleIds: [], repoRoot: '' };
  for (let i = 2; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--audit-data' && argv[i + 1]) opts.auditData = path.resolve(argv[++i]);
    else if (a === '--out-dir' && argv[i + 1]) opts.outDir = path.resolve(argv[++i]);
    else if (a === '--repo-root' && argv[i + 1]) opts.repoRoot = path.resolve(argv[++i]);
    else if (a === '--rule-id' && argv[i + 1]) opts.ruleIds.push(argv[++i]);
  }
  if (!opts.outDir && opts.auditData) opts.outDir = path.dirname(opts.auditData);
  return opts;
}

async function main() {
  const opts = parseArgs(process.argv);
  if (!opts.auditData || !opts.outDir) {
    console.error('run-ai-fixers: --audit-data and --out-dir required');
    process.exit(2);
  }
  const { reportPath } = await runAiFixers({
    auditDataPath: opts.auditData,
    outDir: opts.outDir,
    repoRoot: opts.repoRoot || undefined,
    ruleIds: opts.ruleIds.length ? opts.ruleIds : undefined,
  });
  console.log(`wrote ${reportPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
