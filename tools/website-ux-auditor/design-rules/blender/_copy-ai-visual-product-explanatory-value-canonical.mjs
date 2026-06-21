#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(__dirname, 'docs/design/ux-audit/rule-pages/ai-visual-product-explanatory-value.md');
const dest = path.resolve(
  __dirname,
  '../../../../docs/design/ux-audit/rule-pages/ai-visual-product-explanatory-value.md',
);
const auditorCopy = path.resolve(
  __dirname,
  '../../docs/design/ux-audit/rule-pages/ai-visual-product-explanatory-value.md',
);

const body = await fs.readFile(src, 'utf8');
await fs.mkdir(path.dirname(dest), { recursive: true });
await fs.mkdir(path.dirname(auditorCopy), { recursive: true });
await fs.writeFile(dest, body);
await fs.writeFile(auditorCopy, body);
console.log('Wrote', dest);
console.log('Wrote', auditorCopy);
