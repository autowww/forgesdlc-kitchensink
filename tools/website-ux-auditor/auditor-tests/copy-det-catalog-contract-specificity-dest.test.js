import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const toolRoot = path.resolve(__dirname, '..');
const src = path.join(
  toolRoot,
  'docs/design/ux-audit/rule-pages/det-catalog-contract-specificity.md',
);
const dest = path.resolve(
  toolRoot,
  '../../docs/design/ux-audit/rule-pages/det-catalog-contract-specificity.md',
);
const expectedPageVersion =
  '0cff2731e516d39b0134050ba1d240fe3f5fccf45a7cae0c5854e1c9ec3c6a96';

test('copy det-catalog-contract-specificity.md to ks docs rule-pages', () => {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  const raw = fs.readFileSync(dest, 'utf8');
  const match = raw.match(/^page_version:\s*(.+)$/m);
  assert.equal(match?.[1], expectedPageVersion);
  if (fs.readFileSync(src, 'utf8') === raw) {
    fs.unlinkSync(src);
  }
});
