#!/usr/bin/env node
/**
 * Subset audit-data.json for one rule and URL.
 * usage: node ux-audit-slice.mjs --audit audit-data.json --rule-id AI.X --url URL [--out slice.json]
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const argv = process.argv.slice(2);
const args = { audit: '', ruleId: '', url: '', out: '' };
for (let i = 0; i < argv.length; i += 1) {
  const k = argv[i];
  const n = argv[i + 1];
  if (k === '--audit') args.audit = n || '';
  else if (k === '--rule-id') args.ruleId = n || '';
  else if (k === '--url') args.url = n || '';
  else if (k === '--out') args.out = n || '';
}
if (!args.audit || !args.ruleId || !args.url) {
  console.error('usage: node ux-audit-slice.mjs --audit PATH --rule-id AI.X --url URL [--out slice.json]');
  process.exit(2);
}

const raw = await fs.readFile(path.resolve(args.audit), 'utf8');
const audit = JSON.parse(raw);
const pages = audit.pages || [];
const page = pages.find((p) => (p.url || p.pageUrl || '') === args.url) || pages[0];
const pageFindings = page?.findings || audit.findings || [];
const findings = pageFindings.filter((f) => {
  const pid = f.principleId || f.checkId || f.ruleId || '';
  return pid === args.ruleId || String(pid).startsWith(args.ruleId);
});
const pageFindingsSample = pageFindings.slice(0, 20).map((f) => ({
  principleId: f.principleId || f.checkId || f.ruleId || null,
  severity: f.severity || null,
  title: f.title || f.message || null,
  area: f.area || null,
}));
const slice = {
  ruleId: args.ruleId,
  url: args.url,
  auditRunId: audit.auditRunId || audit.audit_run_id || null,
  pageTitle: page?.title || page?.pageTitle || null,
  findings,
  pageFindingsSample,
  summaryFindingCount: findings.length,
};
const text = `${JSON.stringify(slice, null, 2)}\n`;
if (args.out) {
  await fs.mkdir(path.dirname(path.resolve(args.out)), { recursive: true });
  await fs.writeFile(path.resolve(args.out), text, 'utf8');
} else {
  process.stdout.write(text);
}
