#!/usr/bin/env node
/** Copy staged DET.APP.DEMO_DISCLOSURE handbook page to KS docs (no manifest write). */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(__dirname, 'docs/design/ux-audit/rule-pages/det-app-demo-disclosure.md');
const dest = path.resolve(__dirname, '../../../../docs/design/ux-audit/rule-pages/det-app-demo-disclosure.md');
await fs.mkdir(path.dirname(dest), { recursive: true });
await fs.copyFile(src, dest);
const stat = await fs.stat(dest);
console.log('copied', dest);
console.log('bytes:', stat.size);
