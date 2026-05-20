#!/usr/bin/env node
import { copyFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const src = join(
  root,
  'tools/website-ux-auditor/docs/design/ux-audit/rule-pages/det-data-table-headers.md',
);
const dest = join(root, 'docs/design/ux-audit/rule-pages/det-data-table-headers.md');
mkdirSync(dirname(dest), { recursive: true });
copyFileSync(src, dest);
if (!existsSync(dest)) {
  console.error('DEST_MISSING');
  process.exit(1);
}
const destText = readFileSync(dest, 'utf8');
const m = destText.match(/^page_version:\s*(.+)$/m);
const expected =
  'c7bf5ba070b6cf5956699b142b0ff07574630b940eec46477fb9ab7891e2f04e';
const pageVersion = m ? m[1].trim() : null;
const hasMotion = /<\/?motion\b/i.test(destText);
console.log(
  JSON.stringify({
    ok: pageVersion === expected && existsSync(dest) && !hasMotion,
    page_version: pageVersion,
    line_count: destText.split('\n').length,
    dest,
    has_motion_tags: hasMotion,
  }),
);
