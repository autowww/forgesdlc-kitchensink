#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(
  __dirname,
  'docs/design/ux-audit/rule-pages/det-nav-in-page-toc.md',
);
const dest = path.resolve(
  __dirname,
  '../../docs/design/ux-audit/rule-pages/det-nav-in-page-toc.md',
);
const expectedPageVersion =
  '73ca82c130c0f8d8ea17f8412cab30621bfb8fabd1924a6a943a3653e9680f47';

fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.copyFileSync(src, dest);
const text = fs.readFileSync(dest, 'utf8');
const match = text.match(/^page_version:\s*(\S+)/m);
const pageVersion = match?.[1] ?? '';
const ok = pageVersion === expectedPageVersion;
console.log(ok ? 'SUCCESS' : 'FAILURE');
console.log(`page_version=${pageVersion}`);
console.log(`dest=${dest}`);
process.exit(ok ? 0 : 1);
