#!/usr/bin/env node

import process from 'node:process';

import { loadStandardsPack } from './lib/compliance-score.js';
import { validateStandardsPack } from './lib/build-standards-pack.js';

function usage() {
  console.log(`Validate a standards pack (run npm run blend-rules first)

Usage:
  node validate-standards-pack.mjs --pack wcag20aa
  node validate-standards-pack.mjs --pack wcag20aaa --strict
  node validate-standards-pack.mjs --pack path/to/custom.pack.json --allow-manual-only
`);
}

function parseArgs(argv) {
  const args = { pack: null, strict: false, allowManualOnly: false };
  for (let i = 2; i < argv.length; i += 1) {
    const raw = argv[i];
    if (raw === '--help' || raw === '-h') {
      usage();
      process.exit(0);
    }
    if (raw === '--pack') args.pack = argv[++i] || null;
    else if (raw === '--strict') args.strict = true;
    else if (raw === '--allow-manual-only') args.allowManualOnly = true;
    else throw new Error(`Unknown flag: ${raw}`);
  }
  return args;
}

function main() {
  const args = parseArgs(process.argv);
  if (!args.pack) {
    console.error('--pack is required');
    usage();
    process.exit(1);
  }

  const pack = loadStandardsPack(args.pack);
  const result = validateStandardsPack(pack, {
    allowManualOnly: args.allowManualOnly || !args.strict,
  });

  console.log(`Pack: ${pack.packId} (${pack.label})`);
  console.log(`Criteria: ${pack.summary?.totalCriteria}`);
  console.log(
    `Coverage: ${pack.summary?.automationMapped} automated, ${pack.summary?.manualExpected} manual, ${pack.summary?.uncovered} uncovered`,
  );
  console.log(`Untied rules: ${(pack.validation?.untiedRules || []).length}`);

  if (args.strict && (pack.validation?.uncoveredCriteria || []).length) {
    result.ok = false;
    result.errors.push(
      `strict: ${pack.validation.uncoveredCriteria.length} uncovered criteria remain`,
    );
  }

  if (!result.ok) {
    for (const err of result.errors) console.error(`ERROR: ${err}`);
    if (args.strict && pack.validation?.uncoveredCriteria?.length) {
      console.error(`Uncovered: ${pack.validation.uncoveredCriteria.join(', ')}`);
    }
    process.exit(1);
  }

  console.log('OK — pack validation passed');
}

main();
