#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(__dirname, 'docs/design/ux-audit/rule-pages/det-inventory-crosswalk.md');
const dest = path.resolve(__dirname, '../../../../docs/design/ux-audit/rule-pages/det-inventory-crosswalk.md');
const expected = '1ff85299f06dc68add4d86309b7e7f7baa939d1767e55cee5288b001d5d0c73b';

fs.copyFileSync(src, dest);
const text = fs.readFileSync(dest, 'utf8');
const match = text.match(/^page_version:\s*(\S+)/m);
const pv = match?.[1] ?? '';
const ok = pv === expected;
console.log(ok ? 'SUCCESS' : 'FAILURE');
console.log(`page_version=${pv}`);
console.log('--- first 12 lines ---');
console.log(text.split('\n').slice(0, 12).join('\n'));
process.exit(ok ? 0 : 1);
