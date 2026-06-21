#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(__dirname, 'docs/design/ux-audit/rule-pages/det-app-focus-trap.md');
const dest = path.resolve(__dirname, '../../../../docs/design/ux-audit/rule-pages/det-app-focus-trap.md');
const toolCopy = path.resolve(__dirname, '../../docs/design/ux-audit/rule-pages/det-app-focus-trap.md');
const expectedPageVersion =
  'fa5dee2e6870a2b15bf5e0e508bc424767e16479167ec419ca40b8adfa8ccc8b';

for (const target of [dest, toolCopy]) {
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.copyFile(src, target);
}
const raw = await fs.readFile(dest, 'utf8');
const match = raw.match(/^page_version:\s*(.+)$/m);
if (match?.[1] !== expectedPageVersion) {
  throw new Error(`page_version mismatch: got ${match?.[1]}`);
}
console.log('copied', dest);
console.log('copied', toolCopy);
console.log('page_version:', match[1]);
