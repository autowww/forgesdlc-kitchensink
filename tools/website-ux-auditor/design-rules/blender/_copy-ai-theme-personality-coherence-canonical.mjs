#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(
  __dirname,
  'docs/design/ux-audit/rule-pages/ai-theme-personality-coherence.md',
);
const dest = path.resolve(
  __dirname,
  '../../../../docs/design/ux-audit/rule-pages/ai-theme-personality-coherence.md',
);

await fs.mkdir(path.dirname(dest), { recursive: true });
await fs.copyFile(src, dest);
console.log('wrote', dest);
const raw = await fs.readFile(dest, 'utf8');
const m = raw.match(/^page_version:\s*(\S+)/m);
console.log('page_version:', m?.[1] ?? '(missing)');
const expected =
  'd2dff137b5c8562c86972b740359de36e8d97503d82fc14d41a6a5d6e7713aa8';
if (m?.[1] !== expected) {
  console.error('VERIFY FAIL: expected', expected);
  process.exit(1);
}
console.log('VERIFY OK');
