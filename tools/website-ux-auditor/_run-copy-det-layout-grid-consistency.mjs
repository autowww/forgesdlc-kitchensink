#!/usr/bin/env node
import { copyFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const src = join(
  root,
  'tools/website-ux-auditor/docs/design/ux-audit/rule-pages/det-layout-grid-consistency.md',
);
const dest = join(
  root,
  'docs/design/ux-audit/rule-pages/det-layout-grid-consistency.md',
);
const expected =
  'c712bdd2575f6dc25d95725261f7cec1bcae2af0f85ce49b5bfaa02b2636a97d';

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
    source_exists: existsSync(src),
    dest_exists: existsSync(dest),
    page_version: pageVersion,
    dest,
  }),
);
process.exit(pageVersion === expected ? 0 : 1);
