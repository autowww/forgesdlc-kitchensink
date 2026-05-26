import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const toolRoot = path.resolve(__dirname, '..');
const src = path.join(
  toolRoot,
  'docs/design/ux-audit/rule-pages/det-motion-no-auto-play-flash.md',
);
const dest = path.resolve(
  toolRoot,
  '../../docs/design/ux-audit/rule-pages/det-motion-no-auto-play-flash.md',
);
const expectedPageVersion =
  'f6716461755c5906686a586535661bb7dc3d022d186faaf718efbf89ed7070d3';

test('copy det-motion-no-auto-play-flash.md to ks docs rule-pages', () => {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  const text = fs.readFileSync(dest, 'utf8');
  const match = text.match(/^page_version:\s*(.+)$/m);
  assert.equal(match?.[1]?.trim(), expectedPageVersion);
  assert.ok(fs.existsSync(dest));
});
