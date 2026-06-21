#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(__dirname, '.staging-ai-js-behavior-discoverability.md');
const dest = path.resolve(
  __dirname,
  '../../../../docs/design/ux-audit/rule-pages/ai-js-behavior-discoverability.md',
);

await fs.copyFile(src, dest);
const raw = await fs.readFile(dest, 'utf8');
const m = raw.match(/^page_version:\s*(\S+)/m);
console.log('wrote', dest);
console.log('page_version:', m?.[1] ?? '(missing)');
const expected =
  '682e546ce56b8a85e9ce9add97e37dc5c05dc4e2fd4350af55b8fd119d17bbe6';
if (m?.[1] !== expected) {
  console.error('VERIFY FAIL: expected', expected);
  process.exit(1);
}
console.log('VERIFY OK');
