import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const toolRoot = path.resolve(__dirname, '..');
const src = path.join(
  toolRoot,
  'docs/design/ux-audit/rule-pages/det-layout-grid-consistency.md',
);
const dest = path.resolve(
  toolRoot,
  '../../docs/design/ux-audit/rule-pages/det-layout-grid-consistency.md',
);
const expectedPageVersion =
  'c712bdd2575f6dc25d95725261f7cec1bcae2af0f85ce49b5bfaa02b2636a97d';

test('copy det-layout-grid-consistency.md to ks docs rule-pages', () => {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  const text = fs.readFileSync(dest, 'utf8');
  const match = text.match(/^page_version:\s*(.+)$/m);
  assert.equal(match?.[1]?.trim(), expectedPageVersion);
  assert.ok(fs.existsSync(dest));
});
