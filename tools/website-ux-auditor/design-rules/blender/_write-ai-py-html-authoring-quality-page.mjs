#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(
  __dirname,
  'docs/design/ux-audit/rule-pages/ai-py-html-authoring-quality.md',
);
const dest = path.resolve(
  __dirname,
  '../../../../docs/design/ux-audit/rule-pages/ai-py-html-authoring-quality.md',
);

await fs.copyFile(src, dest);
const head = (await fs.readFile(dest, 'utf8')).split('\n').slice(0, 8).join('\n');
console.log(`Wrote ${dest}\n${head}`);
