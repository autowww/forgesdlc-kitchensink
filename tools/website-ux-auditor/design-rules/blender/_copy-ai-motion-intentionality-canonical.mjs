#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(
  __dirname,
  'docs/design/ux-audit/rule-pages/ai-motion-intentionality.md',
);
const dest = path.resolve(
  __dirname,
  '../../../../docs/design/ux-audit/rule-pages/ai-motion-intentionality.md',
);

await fs.copyFile(src, dest);
const raw = await fs.readFile(dest, 'utf8');
const m = raw.match(/^page_version:\s*(\S+)/m);
console.log('wrote', dest);
console.log('page_version:', m?.[1] ?? '(missing)');
const expected =
  '136728ab3fe29e6d695661f901d3c331816c1d82725d75fc155f673d279da7ce';
if (m?.[1] !== expected) {
  console.error('VERIFY FAIL: expected', expected);
  process.exit(1);
}
console.log('VERIFY OK');
