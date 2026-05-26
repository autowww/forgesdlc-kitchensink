#!/usr/bin/env node
import { copyFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const src = join(root, 'tools/website-ux-auditor/.staging-det-page-mode.md');
const dest = join(root, 'docs/design/ux-audit/rule-pages/det-page-mode.md');
const expected =
  '9ab49bfba4426e3217ba3f6c40b1a27e01ad37885da289c2e4c9ab4b8e6953e2';

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
