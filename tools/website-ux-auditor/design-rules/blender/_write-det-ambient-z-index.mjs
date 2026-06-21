#!/usr/bin/env node
/** Copy staged DET.AMBIENT.Z_INDEX handbook page to KS docs (no manifest write). */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(__dirname, 'docs/design/ux-audit/rule-pages/det-ambient-z-index.md');
const dest = path.resolve(__dirname, '../../../../docs/design/ux-audit/rule-pages/det-ambient-z-index.md');
await fs.mkdir(path.dirname(dest), { recursive: true });
await fs.copyFile(src, dest);
console.log('copied', dest);
