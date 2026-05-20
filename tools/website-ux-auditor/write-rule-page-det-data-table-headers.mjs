import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ksRoot = path.resolve(__dirname, '../..');
const src = path.join(
  __dirname,
  'docs/design/ux-audit/rule-pages/det-data-table-headers.md',
);
const dest = path.join(ksRoot, 'docs/design/ux-audit/rule-pages/det-data-table-headers.md');
const expectedPageVersion =
  'c7bf5ba070b6cf5956699b142b0ff07574630b940eec46477fb9ab7891e2f04e';

fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.copyFileSync(src, dest);

const text = fs.readFileSync(dest, 'utf8');
const pageVersion = text.match(/^page_version:\s*(\S+)/m)?.[1] ?? '';
const hasMotion = /<\/?motion\b/i.test(text);

console.log(
  JSON.stringify({
    ok:
      fs.existsSync(dest) &&
      pageVersion === expectedPageVersion &&
      !hasMotion &&
      text.split('\n').length >= 150 &&
      text.split('\n').length <= 152,
    page_version: pageVersion,
    line_count: text.split('\n').length,
    dest,
  }),
);
