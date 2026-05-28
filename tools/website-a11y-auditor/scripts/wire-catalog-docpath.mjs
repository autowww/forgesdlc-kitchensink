#!/usr/bin/env node
/**
 * Add docPath fields to wcag-criteria-catalog.json and wcag3-outcomes-catalog.json
 * from docs/design/a11y-audit/wcag/reference-manifest.json.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KS_ROOT = path.resolve(__dirname, '../../..');
const MANIFEST_PATH = path.join(KS_ROOT, 'docs/design/a11y-audit/wcag/reference-manifest.json');
const CATALOG2_PATH = path.join(KS_ROOT, 'docs/design/a11y-audit/wcag-criteria-catalog.json');
const CATALOG3_PATH = path.join(KS_ROOT, 'docs/design/a11y-audit/wcag3-outcomes-catalog.json');

async function main() {
  const checkOnly = process.argv.includes('--check');
  const manifest = JSON.parse(await fs.readFile(MANIFEST_PATH, 'utf8'));
  const entries = manifest.entries || {};

  const catalog2 = JSON.parse(await fs.readFile(CATALOG2_PATH, 'utf8'));
  let wired2 = 0;
  for (const profile of Object.values(catalog2.profiles || {})) {
    for (const c of profile.criteria || []) {
      const meta = entries[c.id];
      if (meta?.path) {
        const docPath = `wcag/${meta.path}`;
        if (c.docPath !== docPath) wired2 += 1;
        if (!checkOnly) c.docPath = docPath;
      }
    }
  }

  const catalog3 = JSON.parse(await fs.readFile(CATALOG3_PATH, 'utf8'));
  let wired3 = 0;
  for (const r of catalog3.requirements || []) {
    const meta = entries[r.id];
    if (meta?.path) {
      const docPath = `wcag/${meta.path}`;
      if (r.docPath !== docPath) wired3 += 1;
      if (!checkOnly) r.docPath = docPath;
    }
  }

  if (checkOnly) {
    if (wired2 || wired3) {
      console.error(`wire-catalog-docpath --check: drift (${wired2} SC, ${wired3} WCAG3)`);
      process.exit(1);
    }
    console.log('wire-catalog-docpath --check: OK');
    return;
  }

  await fs.writeFile(CATALOG2_PATH, `${JSON.stringify(catalog2, null, 2)}\n`, 'utf8');
  await fs.writeFile(CATALOG3_PATH, `${JSON.stringify(catalog3, null, 2)}\n`, 'utf8');
  console.log(`wire-catalog-docpath: updated ${wired2} SC rows, ${wired3} WCAG3 requirements`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
