#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(
  __dirname,
  'docs/design/ux-audit/rule-pages/det-visual-rhythm.md',
);
const dest = path.resolve(
  __dirname,
  '../../../../docs/design/ux-audit/rule-pages/det-visual-rhythm.md',
);
const expected =
  '34c97742f51f9ba21a25a468c09d85934f66664723a208599c485565a7016b51';
await fs.mkdir(path.dirname(dest), { recursive: true });
await fs.copyFile(src, dest);
const text = await fs.readFile(dest, 'utf8');
const m = text.match(/^page_version:\s*(.+)$/m);
const pageVersion = m ? m[1].trim() : null;
console.log(
  JSON.stringify({
    ok: pageVersion === expected,
    dest,
    page_version: pageVersion,
    expected,
  }),
);
process.exit(pageVersion === expected ? 0 : 1);
