#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(
  __dirname,
  'docs/design/ux-audit/rule-pages/det-prose-length.md',
);
const dest = path.resolve(
  __dirname,
  '../../docs/design/ux-audit/rule-pages/det-prose-length.md',
);
const expectedPageVersion =
  'b246000e8074dc2ec8325cca1ad2af3f39e46152d69d019a9536befacd6887f9';

fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.copyFileSync(src, dest);
const text = fs.readFileSync(dest, 'utf8');
const match = text.match(/^page_version:\s*(\S+)/m);
const pageVersion = match?.[1] ?? '';
const titleMatch = text.match(/^title:\s*(.+)$/m);
const ok = pageVersion === expectedPageVersion;
console.log(ok ? 'SUCCESS' : 'FAILURE');
console.log(`page_version=${pageVersion}`);
console.log(`title=${titleMatch?.[1] ?? ''}`);
process.exit(ok ? 0 : 1);
