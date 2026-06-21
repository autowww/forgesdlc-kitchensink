#!/usr/bin/env node
/** Copy staged DET.APP.CONTROL_A11Y handbook page to KS docs (no manifest write). */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(__dirname, 'docs/design/ux-audit/rule-pages/det-app-control-a11y.md');
const dest = path.resolve(__dirname, '../../../../docs/design/ux-audit/rule-pages/det-app-control-a11y.md');
await fs.mkdir(path.dirname(dest), { recursive: true });
await fs.copyFile(src, dest);
console.log('copied', dest);
