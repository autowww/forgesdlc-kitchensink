import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const toolRoot = path.resolve(__dirname, '..');
const src = path.join(toolRoot, 'docs/design/ux-audit/rule-pages/det-card-title.md');
const dest = path.resolve(toolRoot, '../../docs/design/ux-audit/rule-pages/det-card-title.md');
const expectedPageVersion =
  'ee28367724421799c6bb05f9eddada3934bfdcfbdc953a16fcf32156ff285354';

test('copy det-card-title.md to ks docs rule-pages', () => {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  const raw = fs.readFileSync(dest, 'utf8');
  const match = raw.match(/^page_version:\s*(.+)$/m);
  assert.equal(match?.[1], expectedPageVersion);
  if (fs.readFileSync(src, 'utf8') === raw) {
    fs.unlinkSync(src);
  }
});
