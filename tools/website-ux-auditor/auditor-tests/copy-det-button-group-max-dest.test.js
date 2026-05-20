import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const toolRoot = path.resolve(__dirname, '..');
const src = path.join(toolRoot, 'docs/design/ux-audit/rule-pages/det-button-group-max.md');
const dest = path.resolve(toolRoot, '../../docs/design/ux-audit/rule-pages/det-button-group-max.md');
const expectedPageVersion =
  '4bf3b7d05427562278ec74fbec5c91f84219aa8c14c5a0a12a6ec9ebdea9590a';

test('copy det-button-group-max.md to ks docs rule-pages', () => {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  const raw = fs.readFileSync(dest, 'utf8');
  const match = raw.match(/^page_version:\s*(.+)$/m);
  assert.equal(match?.[1], expectedPageVersion);
  if (fs.readFileSync(src, 'utf8') === raw) {
    fs.unlinkSync(src);
  }
});
