#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(
  __dirname,
  'docs/design/ux-audit/rule-pages/det-app-primitive-styles.md',
);
const dest = path.resolve(
  __dirname,
  '../../../../docs/design/ux-audit/rule-pages/det-app-primitive-styles.md',
);
const auditorCopy = path.resolve(
  __dirname,
  '../../docs/design/ux-audit/rule-pages/det-app-primitive-styles.md',
);
const expectedPageVersion =
  'c46becf0f3421283779fd56cbf19e9b3e06aa05ebe4bc0961df91e7d5e36b73f';

for (const target of [dest, auditorCopy]) {
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.copyFile(src, target);
}
const raw = await fs.readFile(dest, 'utf8');
const titleMatch = raw.match(/^title:\s*(.+)$/m);
const versionMatch = raw.match(/^page_version:\s*(.+)$/m);
if (titleMatch?.[1] !== 'React primitive stylesheet wiring') {
  throw new Error(`title mismatch: got ${titleMatch?.[1]}`);
}
if (versionMatch?.[1] !== expectedPageVersion) {
  throw new Error(`page_version mismatch: got ${versionMatch?.[1]}`);
}
console.log('copied', dest);
console.log('copied', auditorCopy);
console.log('title:', titleMatch[1]);
console.log('page_version:', versionMatch[1]);
