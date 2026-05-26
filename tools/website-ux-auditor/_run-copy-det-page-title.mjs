#!/usr/bin/env node
import { copyFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const src = join(
  root,
  'tools/website-ux-auditor/docs/design/ux-audit/rule-pages/det-page-title.md',
);
const dest = join(root, 'docs/design/ux-audit/rule-pages/det-page-title.md');
const expected =
  '4040ca340c20e070ac3646e7875cf98f539cdb90d66b4145dd5874f55ad35dfd';

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
const titleM = destText.match(/^title:\s*(.+)$/m);
const pageVersion = m ? m[1].trim() : null;
const title = titleM ? titleM[1].trim() : null;
const ok = pageVersion === expected;
console.log(
  JSON.stringify({
    ok,
    status: ok ? 'SUCCESS' : 'FAILURE',
    source_exists: existsSync(src),
    dest_exists: existsSync(dest),
    page_version: pageVersion,
    title,
    first_12_lines: destText.split('\n').slice(0, 12),
    dest,
  }),
);
process.exit(ok ? 0 : 1);
