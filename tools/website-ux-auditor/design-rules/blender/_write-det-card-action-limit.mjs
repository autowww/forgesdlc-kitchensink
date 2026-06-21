#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(__dirname, 'docs/design/ux-audit/rule-pages/det-card-action-limit.md');
const dest = path.resolve(__dirname, '../../../../docs/design/ux-audit/rule-pages/det-card-action-limit.md');
await fs.mkdir(path.dirname(dest), { recursive: true });
await fs.copyFile(src, dest);
const text = await fs.readFile(dest, 'utf8');
const m = text.match(/^page_version:\s*(.+)$/m);
console.log(
  JSON.stringify({
    ok: true,
    dest,
    page_version: m ? m[1].trim() : null,
    lines: text.split('\n').length,
  }),
);
