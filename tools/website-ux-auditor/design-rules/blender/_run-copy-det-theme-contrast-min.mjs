#!/usr/bin/env node
import { copyFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = join(__dirname, 'docs/design/ux-audit/rule-pages/det-theme-contrast-min.md');
const dest = join(__dirname, '../../../../docs/design/ux-audit/rule-pages/det-theme-contrast-min.md');
const expected =
  '97c147779f5f6f04f6305f426ad1aebad6f7de5ded7de9b6d052f38d8f737141';

mkdirSync(dirname(dest), { recursive: true });
copyFileSync(src, dest);
if (!existsSync(dest)) {
  console.error('DEST_MISSING');
  process.exit(1);
}
const destText = readFileSync(dest, 'utf8');
const m = destText.match(/^page_version:\s*(.+)$/m);
const pageVersion = m ? m[1].trim() : null;
console.log(
  JSON.stringify({
    ok: pageVersion === expected,
    dest_exists: existsSync(dest),
    page_version: pageVersion,
    dest,
  }),
);
process.exit(pageVersion === expected ? 0 : 1);
