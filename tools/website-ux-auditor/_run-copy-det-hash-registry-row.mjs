#!/usr/bin/env node
import { copyFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const src = join(
  root,
  'tools/website-ux-auditor/docs/design/ux-audit/rule-pages/det-hash-registry-row.md',
);
const dest = join(root, 'docs/design/ux-audit/rule-pages/det-hash-registry-row.md');
mkdirSync(dirname(dest), { recursive: true });
copyFileSync(src, dest);
if (!existsSync(dest)) {
  console.error('DEST_MISSING');
  process.exit(1);
}
const destText = readFileSync(dest, 'utf8');
const m = destText.match(/^page_version:\s*(.+)$/m);
const expected =
  '8b23253fec83e82d81039d13831251f57cd75cb62b86f892e33426a08c8c3ba9';
const pageVersion = m ? m[1].trim() : null;
console.log(
  JSON.stringify({
    ok: pageVersion === expected && existsSync(dest),
    page_version: pageVersion,
    line_count: destText.split('\n').length,
    dest,
  }),
);
