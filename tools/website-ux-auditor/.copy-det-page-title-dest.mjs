#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(
  __dirname,
  'docs/design/ux-audit/rule-pages/det-page-title.md',
);
const dest = path.resolve(
  __dirname,
  '../../docs/design/ux-audit/rule-pages/det-page-title.md',
);
const expectedPageVersion =
  '4040ca340c20e070ac3646e7875cf98f539cdb90d66b4145dd5874f55ad35dfd';

fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.copyFileSync(src, dest);
const text = fs.readFileSync(dest, 'utf8');
const lines = text.split('\n').slice(0, 12);
const match = text.match(/^page_version:\s*(\S+)/m);
const pageVersion = match?.[1] ?? '';
const titleMatch = text.match(/^title:\s*(.+)$/m);
const ok = pageVersion === expectedPageVersion;
console.log(ok ? 'SUCCESS' : 'FAILURE');
console.log(`page_version=${pageVersion}`);
console.log(`title=${titleMatch?.[1] ?? ''}`);
console.log('--- first 12 lines ---');
for (const line of lines) console.log(line);
process.exit(ok ? 0 : 1);
