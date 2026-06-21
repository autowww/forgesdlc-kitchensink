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
const text = await fs.readFile(dest, 'utf8');
const match = text.match(/^page_version:\s*(.+)$/m);
console.log(`Wrote ${dest}`);
console.log(`page_version: ${match?.[1] ?? '(missing)'}`);
