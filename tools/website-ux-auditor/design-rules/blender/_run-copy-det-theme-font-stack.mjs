#!/usr/bin/env node
import { copyFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = join(__dirname, 'docs/design/ux-audit/rule-pages/det-theme-font-stack.md');
const dest = join(__dirname, '../../../../docs/design/ux-audit/rule-pages/det-theme-font-stack.md');
const expected =
  '855117ccb546d0ee21cc5acc6dc802220159feb9e559b67b64419387dde5768a';

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
