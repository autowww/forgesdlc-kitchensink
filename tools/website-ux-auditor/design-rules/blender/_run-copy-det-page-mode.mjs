#!/usr/bin/env node
import { copyFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = join(__dirname, 'docs/design/ux-audit/rule-pages/det-page-mode.md');
const dest = join(__dirname, '../../../../docs/design/ux-audit/rule-pages/det-page-mode.md');
const expected =
  'dea6bb3c09a5b7eb7caee8bdef5088d6572376d4879234f9daf370edc297dfff';

mkdirSync(dirname(dest), { recursive: true });
copyFileSync(src, dest);
if (!existsSync(dest)) {
  console.error('DEST_MISSING');
  process.exit(1);
}
const destText = readFileSync(dest, 'utf8');
const m = destText.match(/^page_version:\s*(.+)$/m);
const g = destText.match(/^generated_at:\s*(.+)$/m);
const pageVersion = m ? m[1].trim() : null;
const generatedAt = g ? g[1].trim() : null;
console.log(
  JSON.stringify({
    ok: pageVersion === expected,
    dest_exists: existsSync(dest),
    page_version: pageVersion,
    generated_at: generatedAt,
    dest,
  }),
);
process.exit(pageVersion === expected ? 0 : 1);
