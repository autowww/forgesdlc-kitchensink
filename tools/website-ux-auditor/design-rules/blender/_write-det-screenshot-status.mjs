#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(
  __dirname,
  'docs/design/ux-audit/rule-pages/det-screenshot-status.md',
);
const dest = path.resolve(
  __dirname,
  '../../../../docs/design/ux-audit/rule-pages/det-screenshot-status.md',
);
const expected =
  '3df32ff59b36c63479998b1321ecdfed89c1da25b9dd2f3ce5cdbd800f328448';
await fs.mkdir(path.dirname(dest), { recursive: true });
await fs.copyFile(src, dest);
const text = await fs.readFile(dest, 'utf8');
const m = text.match(/^page_version:\s*(.+)$/m);
const pageVersion = m ? m[1].trim() : null;
const stat = await fs.stat(dest);
console.log(
  JSON.stringify({
    ok: pageVersion === expected,
    dest,
    bytes: stat.size,
    page_version: pageVersion,
    expected,
  }),
);
process.exit(pageVersion === expected ? 0 : 1);
