#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(
  __dirname,
  'docs/design/ux-audit/rule-pages/ai-narrative-coherence.md',
);
const dests = [
  path.resolve(
    __dirname,
    '../../../../docs/design/ux-audit/rule-pages/ai-narrative-coherence.md',
  ),
  path.resolve(
    __dirname,
    '../../../docs/design/ux-audit/rule-pages/ai-narrative-coherence.md',
  ),
];

for (const dest of dests) {
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.copyFile(src, dest);
  console.log('wrote', dest);
}
const raw = await fs.readFile(dests[0], 'utf8');
const m = raw.match(/^page_version:\s*(\S+)/m);
console.log('page_version:', m?.[1] ?? '(missing)');
const expected =
  'b6ebf728d379d1b4e965405508dc63b6cbca4bc9dd44bf63f07a532e235169a7';
if (m?.[1] !== expected) {
  console.error('VERIFY FAIL: expected', expected);
  process.exit(1);
}
console.log('VERIFY OK');
