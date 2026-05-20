#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(
  __dirname,
  '../../docs/design/ux-audit/rule-pages/det-diagram-alt.md',
);
const dest = path.resolve(
  __dirname,
  '../../../../docs/design/ux-audit/rule-pages/det-diagram-alt.md',
);
const expected =
  '2a41d2762a8955a191adcfb2803cbf7d10eb49e43c8b575f7545749b36ddb51d';
await fs.mkdir(path.dirname(dest), { recursive: true });
await fs.copyFile(src, dest);
const text = await fs.readFile(dest, 'utf8');
const m = text.match(/^page_version:\s*(.+)$/m);
const pageVersion = m ? m[1].trim() : null;
console.log(
  JSON.stringify({
    ok: pageVersion === expected,
    dest,
    page_version: pageVersion,
  }),
);
