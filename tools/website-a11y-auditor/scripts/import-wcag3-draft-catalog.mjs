#!/usr/bin/env node
/**
 * Validate wcag3-outcomes-catalog.json structure (import from W3C TR is manual/curated).
 * Re-run when the WCAG 3.0 Working Draft changes; update draftSnapshot in the JSON.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CATALOG_PATH = path.resolve(
  __dirname,
  '../../../docs/design/a11y-audit/wcag3-outcomes-catalog.json',
);

const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
const profiles = ['wcag30bronze', 'wcag30silver', 'wcag30gold'];
const errors = [];

if (!catalog.specUrl?.includes('wcag-3.0')) {
  errors.push('missing specUrl for WCAG 3.0 TR');
}

for (const id of profiles) {
  if (!catalog.profiles[id]) errors.push(`missing profile ${id}`);
}

for (const req of catalog.requirements || []) {
  if (!req.id || !req.title) errors.push(`requirement missing id/title: ${JSON.stringify(req)}`);
}

if (errors.length) {
  console.error('import-wcag3-draft-catalog: validation failed');
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(
  `import-wcag3-draft-catalog: OK (${catalog.requirements.length} requirements, snapshot ${catalog.draftSnapshot})`,
);
