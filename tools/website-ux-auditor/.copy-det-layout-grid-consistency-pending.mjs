#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(
  __dirname,
  'docs/design/ux-audit/rule-pages/det-layout-grid-consistency.md',
);
const dest = path.resolve(
  __dirname,
  '../../docs/design/ux-audit/rule-pages/det-layout-grid-consistency.md',
);
const expected =
  'c712bdd2575f6dc25d95725261f7cec1bcae2af0f85ce49b5bfaa02b2636a97d';

fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.copyFileSync(src, dest);
const text = fs.readFileSync(dest, 'utf8');
const match = text.match(/^page_version:\s*(\S+)/m);
const pv = match?.[1] ?? '';
const ok = pv === expected;
console.log(ok ? 'SUCCESS' : 'FAILURE');
console.log(`page_version=${pv}`);
console.log(`dest=${dest}`);
process.exit(ok ? 0 : 1);
