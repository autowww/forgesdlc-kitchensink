#!/usr/bin/env node
/** Copy blender-staged DET.DATA.COLOR_ONLY rule page to KS docs canonical path. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(__dirname, 'docs/design/ux-audit/rule-pages/det-data-color-only.md');
const dest = path.resolve(
  __dirname,
  '../../../../docs/design/ux-audit/rule-pages/det-data-color-only.md',
);

fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.copyFileSync(src, dest);
const text = fs.readFileSync(dest, 'utf8');
const m = text.match(/^page_version:\s*(.+)$/m);
console.log('Wrote', dest);
console.log('page_version:', m?.[1]?.trim() ?? '(missing)');
