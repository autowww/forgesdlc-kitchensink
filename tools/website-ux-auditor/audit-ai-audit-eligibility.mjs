#!/usr/bin/env node
/**
 * Check whether post-deterministic AI audit may run.
 *
 *   node audit-ai-audit-eligibility.mjs <audit-data.json> [--check] [--json]
 *
 * Eligible when FORGE_UX_FORCE_AI_AUDIT=1, or when quality gate passes and the
 * crawl completed within budget with every implemented DET rule satisfied on each page.
 */

import fs from 'node:fs';

import { evaluateAiAuditEligibility } from './lib/ai-audit-eligibility.js';

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith('--')));
const paths = args.filter((a) => !a.startsWith('--'));
const auditPath = paths[0];

if (!auditPath || flags.has('--help') || flags.has('-h')) {
  console.error('usage: audit-ai-audit-eligibility.mjs <audit-data.json> [--check] [--json]');
  process.exit(2);
}

if (!fs.existsSync(auditPath)) {
  console.error(`audit-ai-audit-eligibility: missing ${auditPath}`);
  process.exit(1);
}

const audit = JSON.parse(fs.readFileSync(auditPath, 'utf8'));
const result = evaluateAiAuditEligibility(audit);

if (flags.has('--json')) {
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  process.exit(result.eligible ? 0 : 1);
}

if (flags.has('--check')) {
  if (result.eligible) {
    const mode = result.forced ? 'forced' : 'post_clean';
    console.error(`ai-audit-eligibility: PASS (${mode})`);
    process.exit(0);
  }
  console.error(`ai-audit-eligibility: FAIL · ${result.reasons.join('; ')}`);
  process.exit(1);
}

process.stdout.write(`${result.eligible ? '1' : '0'}\n`);
process.exit(result.eligible ? 0 : 1);
