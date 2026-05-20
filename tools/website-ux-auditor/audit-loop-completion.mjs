#!/usr/bin/env node
/**
 * Composite remediation loop completion check (all bars or gate-only).
 *
 * Usage:
 *   node audit-loop-completion.mjs <audit-data.json> [--check] [--check-all-bars] [--json]
 */

import fs from 'node:fs';
import path from 'node:path';

import { evaluateLoopCompletionFromAuditPath } from './lib/loop-watch-completion.js';

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith('--')));
const paths = args.filter((a) => !a.startsWith('--'));
const auditPath = paths[0];

if (!auditPath || flags.has('--help') || flags.has('-h')) {
  console.error('usage: audit-loop-completion.mjs <audit-data.json> [--check] [--check-all-bars] [--json]');
  process.exit(2);
}

if (!fs.existsSync(auditPath)) {
  console.error(`audit-loop-completion: missing ${auditPath}`);
  process.exit(1);
}

const allBars = flags.has('--check-all-bars') || String(process.env.FORGE_UX_LOOP_ALL_BARS || '') === '1';
const env = { ...process.env };
if (flags.has('--check-all-bars')) env.FORGE_UX_LOOP_ALL_BARS = '1';

const result = evaluateLoopCompletionFromAuditPath(auditPath, {
  outDir: path.dirname(path.resolve(auditPath)),
  env,
  allBarsMode: allBars,
});

if (flags.has('--json')) {
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  process.exit(result.pass ? 0 : 1);
}

if (flags.has('--check') || flags.has('--check-all-bars')) {
  if (result.pass) {
    console.error(`loop-completion: PASS (${result.mode})`);
    process.exit(0);
  }
  console.error(`loop-completion: FAIL (${result.mode}) · ${result.reasons.join('; ')}`);
  process.exit(1);
}

process.stdout.write(`${result.pass ? '1' : '0'}\n`);
process.exit(result.pass ? 0 : 1);
