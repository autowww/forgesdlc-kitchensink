#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(__dirname, 'docs/design/ux-audit/rule-pages/det-button-group-max.md');
const dest = path.resolve(__dirname, '../../../../docs/design/ux-audit/rule-pages/det-button-group-max.md');
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.copyFileSync(src, dest);
const text = fs.readFileSync(dest, 'utf8');
const match = text.match(/^page_version:\s*(.+)$/m);
console.log(JSON.stringify({ ok: true, page_version: match?.[1]?.trim() ?? null, head: text.split('\n').slice(0, 12).join('\n') }));
