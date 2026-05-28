#!/usr/bin/env node
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { generateA11yRemediationPlan } from './lib/generate-a11y-remediation-plan.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  const opts = { auditData: '', outDir: '', repoRoot: process.cwd(), fixerReport: '' };
  for (let i = 2; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--audit-data' && argv[i + 1]) opts.auditData = path.resolve(argv[++i]);
    else if (a === '--out-dir' && argv[i + 1]) opts.outDir = path.resolve(argv[++i]);
    else if (a === '--repo' && argv[i + 1]) opts.repoRoot = path.resolve(argv[++i]);
    else if (a === '--fixer-report' && argv[i + 1]) opts.fixerReport = path.resolve(argv[++i]);
  }
  if (!opts.outDir && opts.auditData) opts.outDir = path.dirname(opts.auditData);
  return opts;
}

async function main() {
  const opts = parseArgs(process.argv);
  if (!opts.auditData || !opts.outDir) {
    console.error('generate-a11y-remediation-plan: --audit-data and --out-dir required');
    process.exit(2);
  }
  const fixerReportPath =
    opts.fixerReport || path.join(opts.outDir, 'deterministic-fixer-report.json');
  const result = await generateA11yRemediationPlan({
    auditDataPath: opts.auditData,
    outDir: opts.outDir,
    repoRoot: opts.repoRoot,
    fixerReportPath,
  });
  console.log(`wrote ${result.planPath} (${result.todoCount} todos, ${result.openClusters} clusters)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
