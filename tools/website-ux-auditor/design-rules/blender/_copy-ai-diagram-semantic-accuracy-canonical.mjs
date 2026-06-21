#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(
  __dirname,
  'docs/design/ux-audit/rule-pages/ai-diagram-semantic-accuracy.md',
);
const dest = path.resolve(
  __dirname,
  '../../../../docs/design/ux-audit/rule-pages/ai-diagram-semantic-accuracy.md',
);

await fs.copyFile(src, dest);
const raw = await fs.readFile(dest, 'utf8');
const m = raw.match(/^page_version:\s*(\S+)/m);
console.log('wrote', dest);
console.log('page_version:', m?.[1] ?? '(missing)');
const expected =
  '8bb03a75ed4ad02de06c7242c8f4cfb9d828437dfb255fb87ae7e543f58d694a';
if (m?.[1] !== expected) {
  console.error('VERIFY FAIL: expected', expected);
  process.exit(1);
}
console.log('VERIFY OK');
