#!/usr/bin/env node
import { copyFileSync, mkdirSync, readFileSync, existsSync, unlinkSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const src = join(
  root,
  'tools/website-ux-auditor/forgesdlc-kitchensink/docs/design/ux-audit/rule-pages/det-diagram-alt.md',
);
const dest = join(root, 'docs/design/ux-audit/rule-pages/det-diagram-alt.md');
const expected =
  '2a41d2762a8955a191adcfb2803cbf7d10eb49e43c8b575f7545749b36ddb51d';

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
for (const extra of [
  join(
    root,
    'tools/website-ux-auditor/docs/design/ux-audit/rule-pages/det-diagram-alt.md',
  ),
]) {
  if (existsSync(extra)) unlinkSync(extra);
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
