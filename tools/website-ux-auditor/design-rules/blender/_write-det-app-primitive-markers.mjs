#!/usr/bin/env node
/** Copy staged DET.APP.PRIMITIVE_MARKERS handbook page to KS docs (no manifest write). */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(__dirname, 'docs/design/ux-audit/rule-pages/det-app-primitive-markers.md');
const dest = path.resolve(__dirname, '../../../../docs/design/ux-audit/rule-pages/det-app-primitive-markers.md');
const auditorCopy = path.resolve(__dirname, '../../docs/design/ux-audit/rule-pages/det-app-primitive-markers.md');
const expectedPageVersion =
  'bea28d34baf7530df4a75aaa0348712067b5ef581b6de321e9b1986ab50d8f62';

for (const target of [dest, auditorCopy]) {
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.copyFile(src, target);
}
const raw = await fs.readFile(dest, 'utf8');
const titleMatch = raw.match(/^title:\s*(.+)$/m);
const versionMatch = raw.match(/^page_version:\s*(.+)$/m);
if (titleMatch?.[1] !== 'React primitive KS markers') {
  throw new Error(`title mismatch: got ${titleMatch?.[1]}`);
}
if (versionMatch?.[1] !== expectedPageVersion) {
  throw new Error(`page_version mismatch: got ${versionMatch?.[1]}`);
}
console.log('copied', dest);
console.log('copied', auditorCopy);
console.log('title:', titleMatch[1]);
console.log('page_version:', versionMatch[1]);
