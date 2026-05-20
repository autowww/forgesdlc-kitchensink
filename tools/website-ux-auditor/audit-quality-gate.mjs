#!/usr/bin/env node
/**
 * Evaluate sitewide quality gate on audit-data.json (visited pages, flattened findings).
 *
 * Usage:
 *   node audit-quality-gate.mjs <audit-data.json> [--check] [--json]
 *
 * --check  Exit 0 when gate passes, 1 when it fails (summary on stderr).
 * --json   Print evaluation JSON on stdout (default without --check).
 */

import fs from 'node:fs';

import {
  evaluateAuditQualityGate,
  formatQualityGateSlashPairs,
  loadQualityGateThresholdsFromEnv,
} from './lib/quality-gate.js';

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith('--')));
const paths = args.filter((a) => !a.startsWith('--'));
const auditPath = paths[0];

if (!auditPath || flags.has('--help') || flags.has('-h')) {
  console.error('usage: audit-quality-gate.mjs <audit-data.json> [--check] [--json]');
  process.exit(2);
}

let audit;
try {
  audit = JSON.parse(fs.readFileSync(auditPath, 'utf8'));
} catch (e) {
  console.error(e?.message || String(e));
  process.exit(1);
}

let thresholds;
try {
  thresholds = loadQualityGateThresholdsFromEnv();
} catch (e) {
  console.error(e?.message || String(e));
  process.exit(1);
}

const result = evaluateAuditQualityGate(audit, thresholds);
const summary = formatQualityGateSlashPairs(result.counts, result.thresholds);

if (flags.has('--check')) {
  if (!result.pass) {
    const viol = result.violations
      .map((v) => `${v.severity} ${v.count}>${v.threshold}`)
      .join(', ');
    console.error(`quality-gate: FAIL · ${summary} · violations: ${viol}`);
    process.exit(1);
  }
  console.error(`quality-gate: PASS · ${summary}`);
  process.exit(0);
}

if (flags.has('--json')) {
  process.stdout.write(`${JSON.stringify({ ...result, summary })}\n`);
} else {
  process.stdout.write(`${result.pass ? '1' : '0'}\n`);
}
