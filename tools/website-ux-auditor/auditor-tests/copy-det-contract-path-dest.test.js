import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const toolRoot = path.resolve(__dirname, '..');
const src = path.join(
  toolRoot,
  'docs/design/ux-audit/rule-pages/det-contract-path.md',
);
const dest = path.resolve(
  toolRoot,
  '../../docs/design/ux-audit/rule-pages/det-contract-path.md',
);
const expectedPageVersion =
  '6083955e6d8907caed366060a29dc76649afb4426732ba85cdadc89524e30a35';

test('copy det-contract-path.md to ks docs rule-pages', () => {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  const text = fs.readFileSync(dest, 'utf8');
  const match = text.match(/^page_version:\s*(.+)$/m);
  assert.equal(match?.[1]?.trim(), expectedPageVersion);
  assert.ok(fs.existsSync(dest));
});
