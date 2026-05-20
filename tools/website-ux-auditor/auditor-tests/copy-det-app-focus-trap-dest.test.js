import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const toolRoot = path.resolve(__dirname, '..');
const src = path.join(toolRoot, 'docs/design/ux-audit/rule-pages/det-app-focus-trap.md');
const dest = path.resolve(toolRoot, '../../docs/design/ux-audit/rule-pages/det-app-focus-trap.md');
const expectedPageVersion =
  'b00d291ded12c54043f412b186dfb0ed74880144c3ffab69d19386d2c6be1b47';

test('copy det-app-focus-trap.md to ks docs rule-pages', () => {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  const raw = fs.readFileSync(dest, 'utf8');
  const match = raw.match(/^page_version:\s*(.+)$/m);
  assert.equal(match?.[1], expectedPageVersion);
});
