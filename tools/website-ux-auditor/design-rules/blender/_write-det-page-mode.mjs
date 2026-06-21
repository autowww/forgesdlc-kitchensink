#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(
  __dirname,
  'docs/design/ux-audit/rule-pages/det-page-mode.md',
);
const dest = path.resolve(
  __dirname,
  '../../../../docs/design/ux-audit/rule-pages/det-page-mode.md',
);
const expected =
  'dea6bb3c09a5b7eb7caee8bdef5088d6572376d4879234f9daf370edc297dfff';
await fs.mkdir(path.dirname(dest), { recursive: true });
await fs.copyFile(src, dest);
const text = await fs.readFile(dest, 'utf8');
const m = text.match(/^page_version:\s*(.+)$/m);
const pageVersion = m ? m[1].trim() : null;
const gen = text.match(/^generated_at:\s*(.+)$/m);
const generatedAt = gen ? gen[1].trim() : null;
console.log(
  JSON.stringify({
    ok: pageVersion === expected,
    dest,
    page_version: pageVersion,
    generated_at: generatedAt,
    expected,
  }),
);
process.exit(pageVersion === expected ? 0 : 1);
