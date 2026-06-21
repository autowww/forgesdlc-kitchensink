#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(__dirname, '.staging-ai-visual-hierarchy.md');
const dest = path.resolve(
  __dirname,
  '../../../../docs/design/ux-audit/rule-pages/ai-visual-hierarchy.md',
);

const body = await fs.readFile(src, 'utf8');
await fs.writeFile(dest, body);
const pv = body.match(/^page_version:\s*(.+)$/m)?.[1]?.trim();
console.log(`Wrote ${dest}`);
console.log(`page_version: ${pv}`);
