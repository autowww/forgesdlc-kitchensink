import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const toolRoot = path.resolve(__dirname, '..');
const src = path.join(toolRoot, 'docs/design/ux-audit/rule-pages/det-page-title.md');
const dest = path.resolve(toolRoot, '../../docs/design/ux-audit/rule-pages/det-page-title.md');
const expectedPageVersion =
  '4040ca340c20e070ac3646e7875cf98f539cdb90d66b4145dd5874f55ad35dfd';

test('copy det-page-title.md to ks docs rule-pages', () => {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  const raw = fs.readFileSync(dest, 'utf8');
  const match = raw.match(/^page_version:\s*(.+)$/m);
  assert.equal(match?.[1], expectedPageVersion);
  assert.match(raw, /^title:\s*Document page title$/m);
  assert.equal(fs.readFileSync(src, 'utf8'), raw);
});
