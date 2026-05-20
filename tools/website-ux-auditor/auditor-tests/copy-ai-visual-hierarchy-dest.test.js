import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const toolRoot = path.resolve(__dirname, '..');
const src = path.join(toolRoot, 'docs/design/ux-audit/rule-pages/ai-visual-hierarchy.md');
const dest = path.resolve(toolRoot, '../../docs/design/ux-audit/rule-pages/ai-visual-hierarchy.md');
const expectedPageVersion =
  'ec93b09eb3c72879f87748ded10effcf98d81ad21640eebac2c9f0c27019584a';

test('copy ai-visual-hierarchy.md to ks docs rule-pages', () => {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  const raw = fs.readFileSync(dest, 'utf8');
  const match = raw.match(/^page_version:\s*(.+)$/m);
  assert.equal(match?.[1], expectedPageVersion);
});
