#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(
  __dirname,
  'docs/design/ux-audit/rule-pages/det-token-no-drift.md',
);
const dest = path.resolve(
  __dirname,
  '../../../../docs/design/ux-audit/rule-pages/det-token-no-drift.md',
);
const expected =
  '53a3887c59e39d84ed2ca7f199dbceec852ca7bc4163d428d8cbb997c8fab24c';
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
