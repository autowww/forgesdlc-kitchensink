#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(__dirname, '.staging-ai-credibility-no-overclaim.md');
const dest = path.resolve(
  __dirname,
  '../../../../docs/design/ux-audit/rule-pages/ai-credibility-no-overclaim.md',
);
await fs.mkdir(path.dirname(dest), { recursive: true });
await fs.copyFile(src, dest);
const raw = await fs.readFile(dest, 'utf8');
const match = raw.match(/^page_version:\s*(.+)$/m);
console.log('dest:', dest);
console.log('page_version:', match?.[1] ?? '(missing)');
