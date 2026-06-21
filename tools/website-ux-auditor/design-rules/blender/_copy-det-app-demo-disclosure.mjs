#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(__dirname, 'docs/design/ux-audit/rule-pages/det-app-demo-disclosure.md');
const dest = path.resolve(__dirname, '../../../../docs/design/ux-audit/rule-pages/det-app-demo-disclosure.md');
const bytes = (await fs.readFile(src)).length;
await fs.mkdir(path.dirname(dest), { recursive: true });
await fs.writeFile(dest, await fs.readFile(src));
console.log(JSON.stringify({ ok: true, dest, bytes }));
