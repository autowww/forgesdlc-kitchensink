#!/usr/bin/env node
/**
 * Merge AI audit findings into a11y-audit-data.json for compliance scoring.
 *
 * Usage:
 *   node scripts/merge-ai-audit-findings.mjs --audit-data ./out/a11y-audit-data.json \
 *     --ai-findings ./out/ai-runs/merged-ai-findings.json
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import { normalizeAiFinding } from '../lib/ai-audit-batches.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function usage() {
  return `merge-ai-audit-findings — append AI findings to audit JSON

Options:
  --audit-data PATH     a11y-audit-data.json (required)
  --ai-findings PATH    JSON with { findings: [...] } or array of findings
  --out PATH            Write merged file (default: overwrite --audit-data)
`;
}

function parseArgs(argv) {
  const args = { auditData: null, aiFindings: null, out: null };
  for (let i = 2; i < argv.length; i += 1) {
    const raw = argv[i];
    if (raw === '--help' || raw === '-h') {
      console.log(usage());
      process.exit(0);
    }
    if (raw === '--audit-data') args.auditData = path.resolve(argv[++i] || '');
    else if (raw === '--ai-findings') args.aiFindings = path.resolve(argv[++i] || '');
    else if (raw === '--out') args.out = path.resolve(argv[++i] || '');
    else throw new Error(`Unknown flag: ${raw}`);
  }
  if (!args.auditData || !args.aiFindings) throw new Error('--audit-data and --ai-findings required');
  if (!args.out) args.out = args.auditData;
  return args;
}

async function loadAiFindings(filePath) {
  const raw = JSON.parse(await fs.readFile(filePath, 'utf8'));
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw.findings)) return raw.findings;
  return [];
}

async function main() {
  const args = parseArgs(process.argv);
  const audit = JSON.parse(await fs.readFile(args.auditData, 'utf8'));
  const site = audit.site || '';
  const incoming = await loadAiFindings(args.aiFindings);
  const normalized = [];
  for (const f of incoming) {
    const n = normalizeAiFinding({ ...f, lane: 'ai' }, site);
    if (n) normalized.push(n);
  }

  const existing = audit.findings || [];
  const merged = [...existing, ...normalized];
  audit.findings = merged;
  audit.aiLaneExecuted = true;
  audit.aiFindingsMerged = (audit.aiFindingsMerged || 0) + normalized.length;
  audit.aiFindingsMergedAt = new Date().toISOString();
  if (!audit.lanes?.includes('ai')) audit.lanes = [...(audit.lanes || []), 'ai'];
  audit.lanesExecuted = { ...(audit.lanesExecuted || {}), ai: true };

  const sev = {};
  for (const f of merged) {
    const s = String(f.severity || 'minor').toLowerCase();
    sev[s] = (sev[s] || 0) + 1;
  }
  audit.severitySummary = sev;

  await fs.writeFile(args.out, `${JSON.stringify(audit, null, 2)}\n`, 'utf8');
  console.log(
    `merge-ai-audit-findings: added ${normalized.length} AI findings → ${path.basename(args.out)} (total ${merged.length})`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
