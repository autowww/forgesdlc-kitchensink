#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';

import { writeStudioRemediationPlan } from './lib/generate-studio-remediation-plan.mjs';

function parseArgs(argv) {
  const opts = { audit: '', out: '' };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--audit' && argv[i + 1]) opts.audit = path.resolve(argv[++i]);
    else if (a === '--out' && argv[i + 1]) opts.out = path.resolve(argv[++i]);
    else if (a === '-h' || a === '--help') {
      console.log('Usage: node generate-studio-remediation-plan.mjs --audit audit-data.json [--out forge-studio-remediation.plan.md]');
      process.exit(0);
    }
  }
  return opts;
}

async function main() {
  const opts = parseArgs(process.argv);
  if (!opts.audit) {
    console.error('--audit required');
    process.exit(2);
  }
  const auditData = JSON.parse(await fs.readFile(opts.audit, 'utf8'));
  const outPath =
    opts.out || path.join(path.dirname(opts.audit), 'forge-studio-remediation.plan.md');
  await writeStudioRemediationPlan(auditData, outPath);
  console.error(`generate-studio-remediation-plan: wrote ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
