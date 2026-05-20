import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const toolRoot = path.resolve(__dirname, '..');
const src = path.join(
  toolRoot,
  'docs/design/ux-audit/rule-pages/det-data-table-headers.md',
);
const dest = path.resolve(
  toolRoot,
  '../../docs/design/ux-audit/rule-pages/det-data-table-headers.md',
);
const expectedPageVersion =
  'c7bf5ba070b6cf5956699b142b0ff07574630b940eec46477fb9ab7891e2f04e';

test('copy det-data-table-headers.md to ks docs rule-pages', () => {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  const text = fs.readFileSync(dest, 'utf8');
  const match = text.match(/^page_version:\s*(.+)$/m);
  assert.equal(match?.[1]?.trim(), expectedPageVersion);
  assert.ok(fs.existsSync(dest));
  assert.ok(!/<\/?motion\b/i.test(text));
  assert.ok(text.split('\n').length >= 150 && text.split('\n').length <= 152);
});
