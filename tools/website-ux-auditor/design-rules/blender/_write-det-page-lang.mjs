#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(
  __dirname,
  'docs/design/ux-audit/rule-pages/det-page-lang.md',
);
const dest = path.resolve(
  __dirname,
  '../../../../docs/design/ux-audit/rule-pages/det-page-lang.md',
);
const expected =
  '92d1474ee3f383e7749ee80437fcdb2654c380980a8a8e89c662ac745e0c8d7e';
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
