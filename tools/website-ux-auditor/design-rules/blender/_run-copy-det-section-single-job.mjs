#!/usr/bin/env node
import { copyFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = join(__dirname, 'docs/design/ux-audit/rule-pages/det-section-single-job.md');
const dest = join(__dirname, '../../../../docs/design/ux-audit/rule-pages/det-section-single-job.md');
const expected =
  'a02e490ddd88ad710ba66fb729532ee48682de2d853ce6bd6e59cf6b2ac30339';

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
