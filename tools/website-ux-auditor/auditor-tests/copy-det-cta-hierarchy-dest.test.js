import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const toolRoot = path.resolve(__dirname, '..');
const src = path.join(toolRoot, 'docs/design/ux-audit/rule-pages/det-cta-hierarchy.md');
const dest = path.resolve(
  toolRoot,
  '../../docs/design/ux-audit/rule-pages/det-cta-hierarchy.md',
);
const expectedPageVersion =
  '96c734fbaeda694dfccadfe33c76c0e18ce82d905b6013754688a044463755af';

test('copy det-cta-hierarchy.md to ks docs rule-pages', () => {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  const raw = fs.readFileSync(dest, 'utf8');
  const match = raw.match(/^page_version:\s*(.+)$/m);
  assert.equal(match?.[1], expectedPageVersion);
  if (fs.readFileSync(src, 'utf8') === raw) {
    fs.unlinkSync(src);
  }
});
