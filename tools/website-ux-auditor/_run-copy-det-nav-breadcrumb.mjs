#!/usr/bin/env node
import { copyFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const src = join(root, 'tools/website-ux-auditor/.staging-det-nav-breadcrumb.md');
const dest = join(root, 'docs/design/ux-audit/rule-pages/det-nav-breadcrumb.md');
const expected =
  'd29db46cf5a6dfbe5acb196335691d0cb791e2dd6772b11ce191aa93713bb303';

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
