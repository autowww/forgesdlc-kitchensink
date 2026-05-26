#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(
  __dirname,
  'docs/design/ux-audit/rule-pages/det-page-lang.md',
);
const dest = path.resolve(
  __dirname,
  '../../docs/design/ux-audit/rule-pages/det-page-lang.md',
);
const expectedPageVersion =
  '44c6f35dae6a383cc76fab9c0dca814bfe8c1309ffa6bd28a6473d44f81cad9e';

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
