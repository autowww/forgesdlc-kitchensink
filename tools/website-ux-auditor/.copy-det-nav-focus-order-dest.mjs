#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(
  __dirname,
  'docs/design/ux-audit/rule-pages/det-nav-focus-order.md',
);
const dest = path.resolve(
  __dirname,
  '../../docs/design/ux-audit/rule-pages/det-nav-focus-order.md',
);
const expectedPageVersion =
  '84636f49a8af2c9595b613d075ec4f5c84d25ca7537f8b8fc84b43684a3d0210';

fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.copyFileSync(src, dest);
const text = fs.readFileSync(dest, 'utf8');
const match = text.match(/^page_version:\s*(\S+)/m);
const pageVersion = match?.[1] ?? '';
const ok = pageVersion === expectedPageVersion;
console.log(ok ? 'SUCCESS' : 'FAILURE');
console.log(`page_version=${pageVersion}`);
console.log(`dest=${dest}`);
process.exit(ok ? 0 : 1);
