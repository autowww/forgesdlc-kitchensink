import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ksRoot = path.resolve(__dirname, '../..');
const src = path.join(
  __dirname,
  'docs/design/ux-audit/rule-pages/det-hash-registry-row.md',
);
const dest = path.join(ksRoot, 'docs/design/ux-audit/rule-pages/det-hash-registry-row.md');
const expectedPageVersion =
  '8b23253fec83e82d81039d13831251f57cd75cb62b86f892e33426a08c8c3ba9';

fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.copyFileSync(src, dest);

const text = fs.readFileSync(dest, 'utf8');
const pageVersion = text.match(/^page_version:\s*(\S+)/m)?.[1] ?? '';

console.log(
  JSON.stringify({
    ok: fs.existsSync(dest) && pageVersion === expectedPageVersion,
    page_version: pageVersion,
    line_count: text.split('\n').length,
    dest,
  }),
);
