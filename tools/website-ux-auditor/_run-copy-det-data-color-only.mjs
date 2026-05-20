#!/usr/bin/env node
import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const src = join(
  root,
  'tools/website-ux-auditor/forgesdlc-kitchensink/docs/design/ux-audit/rule-pages/det-data-color-only.md',
);
const dest = join(root, 'docs/design/ux-audit/rule-pages/det-data-color-only.md');
const expected =
  '6867492406d3ec909a0742d87b388c8f118929ae94e16f369025c8fa1c41f736';

mkdirSync(dirname(dest), { recursive: true });
copyFileSync(src, dest);
if (!existsSync(dest)) {
  console.error('DEST_MISSING');
  process.exit(1);
}
const destText = readFileSync(dest, 'utf8');
const m = destText.match(/^page_version:\s*(.+)$/m);
const pageVersion = m ? m[1].trim() : null;
const pageVersionLine = m ? m[0] : null;
console.log(
  JSON.stringify({
    ok: pageVersion === expected && existsSync(src) && existsSync(dest),
    page_version: pageVersion,
    page_version_line: pageVersionLine,
    dest,
  }),
);
