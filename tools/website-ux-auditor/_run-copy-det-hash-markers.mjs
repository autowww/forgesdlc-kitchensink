#!/usr/bin/env node
import { copyFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const src = join(
  root,
  'tools/website-ux-auditor/docs/design/ux-audit/rule-pages/det-hash-markers.md',
);
const dest = join(root, 'docs/design/ux-audit/rule-pages/det-hash-markers.md');
const expected =
  'd7c8001eff82b529e9c4f8919173e977dcb44b91fb8b98ac1acf792f9c81780b';

mkdirSync(dirname(dest), { recursive: true });
copyFileSync(src, dest);
if (!existsSync(dest)) {
  console.error('DEST_MISSING');
  process.exit(1);
}
const destText = readFileSync(dest, 'utf8');
const m = destText.match(/^page_version:\s*(.+)$/m);
const pageVersion = m ? m[1].trim() : null;
const first12 = destText.split('\n').slice(0, 12).join('\n');
console.log(
  JSON.stringify({
    dest_exists: existsSync(dest),
    page_version_ok: pageVersion === expected,
    page_version: pageVersion,
    dest,
    first12,
  }),
);
