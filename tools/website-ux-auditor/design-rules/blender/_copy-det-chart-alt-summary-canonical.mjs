#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(__dirname, 'docs/design/ux-audit/rule-pages/det-chart-alt-summary.md');
const dest = path.resolve(__dirname, '../../../../docs/design/ux-audit/rule-pages/det-chart-alt-summary.md');
fs.copyFileSync(src, dest);
console.log('copied', src, '->', dest);
