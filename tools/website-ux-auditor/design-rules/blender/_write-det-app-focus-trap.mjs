#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(__dirname, '../../docs/design/ux-audit/rule-pages/det-app-focus-trap.md');
const dest = path.resolve(__dirname, '../../../../docs/design/ux-audit/rule-pages/det-app-focus-trap.md');
const expectedPageVersion =
  'b00d291ded12c54043f412b186dfb0ed74880144c3ffab69d19386d2c6be1b47';

await fs.mkdir(path.dirname(dest), { recursive: true });
await fs.copyFile(src, dest);
const raw = await fs.readFile(dest, 'utf8');
const match = raw.match(/^page_version:\s*(.+)$/m);
if (match?.[1] !== expectedPageVersion) {
  throw new Error(`page_version mismatch: got ${match?.[1]}`);
}
console.log('copied', dest);
console.log('page_version:', match[1]);
