#!/usr/bin/env node
import { copyFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const src = join(root, 'tools/website-ux-auditor/.staging-det-nav-focus-order.md');
const dest = join(root, 'docs/design/ux-audit/rule-pages/det-nav-focus-order.md');
const expected =
  '84636f49a8af2c9595b613d075ec4f5c84d25ca7537f8b8fc84b43684a3d0210';

mkdirSync(dirname(dest), { recursive: true });
copyFileSync(src, dest);
if (!existsSync(dest)) {
  console.error('DEST_MISSING');
  process.exit(1);
}
const srcText = readFileSync(src, 'utf8');
const destText = readFileSync(dest, 'utf8');
if (srcText !== destText) {
  console.error('MISMATCH');
  process.exit(1);
}
const m = destText.match(/^page_version:\s*(.+)$/m);
const pageVersion = m ? m[1].trim() : null;
console.log(
  JSON.stringify({
    ok: pageVersion === expected,
    source_exists: existsSync(src),
    dest_exists: existsSync(dest),
    page_version: pageVersion,
    dest,
  }),
);
