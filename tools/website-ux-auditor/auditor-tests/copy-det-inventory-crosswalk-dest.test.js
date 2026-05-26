import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const toolRoot = path.resolve(__dirname, '..');
const src = path.join(
  toolRoot,
  'docs/design/ux-audit/rule-pages/det-inventory-crosswalk.md',
);
const dest = path.resolve(
  toolRoot,
  '../../docs/design/ux-audit/rule-pages/det-inventory-crosswalk.md',
);
const expectedPageVersion =
  '1ff85299f06dc68add4d86309b7e7f7baa939d1767e55cee5288b001d5d0c73b';

test('copy det-inventory-crosswalk.md to ks docs rule-pages', () => {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  const text = fs.readFileSync(dest, 'utf8');
  const match = text.match(/^page_version:\s*(.+)$/m);
  assert.equal(match?.[1]?.trim(), expectedPageVersion);
  assert.ok(fs.existsSync(dest));
});
