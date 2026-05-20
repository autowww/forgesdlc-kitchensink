#!/usr/bin/env node
import { copyFileSync, mkdirSync, readFileSync, existsSync, unlinkSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const src = join(root, 'tools/website-ux-auditor/.staging-det-diagram-asset-registry.md');
const dest = join(root, 'docs/design/ux-audit/rule-pages/det-diagram-asset-registry.md');
const expected =
  '760457a5e7fdd76fad2a2fdc15e29a3d65de58e38a97a0e6f3b0d66d497fd4dc';

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
    'tools/website-ux-auditor/docs/design/ux-audit/rule-pages/det-diagram-asset-registry.md',
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
