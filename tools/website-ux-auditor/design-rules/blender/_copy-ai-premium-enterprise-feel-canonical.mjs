#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(
  __dirname,
  'docs/design/ux-audit/rule-pages/ai-premium-enterprise-feel.md',
);
const dest = path.resolve(
  __dirname,
  '../../../../docs/design/ux-audit/rule-pages/ai-premium-enterprise-feel.md',
);

await fs.mkdir(path.dirname(dest), { recursive: true });
await fs.copyFile(src, dest);
console.log('wrote', dest);
const raw = await fs.readFile(dest, 'utf8');
const m = raw.match(/^page_version:\s*(\S+)/m);
console.log('page_version:', m?.[1] ?? '(missing)');
const expected =
  '22fac276efb9e12698672c8c9b297aa012e77f757b8d8f8c04ac75f353af2592';
if (m?.[1] !== expected) {
  console.error('VERIFY FAIL: expected', expected);
  process.exit(1);
}
console.log('VERIFY OK');
