#!/usr/bin/env node
/**
 * Export axe rule catalog with docPath per WCAG criterion (from reference-manifest).
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

import { buildAxeRuleCatalog } from '../lib/axe-rule-catalog.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOOL_ROOT = path.resolve(__dirname, '..');
const KS_ROOT = path.resolve(TOOL_ROOT, '../..');
const OUT_PATH = path.join(TOOL_ROOT, 'design-rules/axe-catalog.generated.json');
const MANIFEST_PATH = path.join(KS_ROOT, 'docs/design/a11y-audit/wcag/reference-manifest.json');

async function main() {
  const checkOnly = process.argv.includes('--check');
  const manifest = JSON.parse(await fs.readFile(MANIFEST_PATH, 'utf8'));
  const entries = manifest.entries || {};

  const catalog = buildAxeRuleCatalog().map((row) => {
    const criteriaDocPaths = {};
    for (const sc of row.wcagCriteria || []) {
      const meta = entries[sc];
      if (meta?.path) criteriaDocPaths[sc] = `wcag/${meta.path}`;
    }
    return { ...row, criteriaDocPaths };
  });

  const payload = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    ruleCount: catalog.length,
    rules: catalog,
  };
  const body = `${JSON.stringify(payload, null, 2)}\n`;
  const checksum = crypto.createHash('sha256').update(body).digest('hex');

  if (checkOnly) {
    try {
      const prev = JSON.parse(await fs.readFile(OUT_PATH, 'utf8'));
      const prevStable = { schemaVersion: prev.schemaVersion, ruleCount: prev.ruleCount, rules: prev.rules };
      const nextStable = { schemaVersion: payload.schemaVersion, ruleCount: payload.ruleCount, rules: payload.rules };
      const prevSum = crypto.createHash('sha256').update(JSON.stringify(prevStable)).digest('hex');
      const nextSum = crypto.createHash('sha256').update(JSON.stringify(nextStable)).digest('hex');
      if (prevSum !== nextSum) {
        console.error('export-axe-catalog --check: drift');
        process.exit(1);
      }
    } catch {
      console.error('export-axe-catalog --check: missing output file');
      process.exit(1);
    }
    console.log(`export-axe-catalog --check: OK (${catalog.length} rules)`);
    return;
  }

  await fs.writeFile(OUT_PATH, body, 'utf8');
  console.log(`export-axe-catalog: wrote ${path.relative(TOOL_ROOT, OUT_PATH)} (${catalog.length} rules)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
