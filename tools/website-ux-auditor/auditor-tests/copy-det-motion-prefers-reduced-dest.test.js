import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const toolRoot = path.resolve(__dirname, '..');
const src = path.join(
  toolRoot,
  'docs/design/ux-audit/rule-pages/det-motion-prefers-reduced.md',
);
const dest = path.resolve(
  toolRoot,
  '../../docs/design/ux-audit/rule-pages/det-motion-prefers-reduced.md',
);
const expectedPageVersion =
  '49a23233fa7dbc7d7d980dd0891b238b19c782633c1e748896a0c6aeeac33ba5';

test('copy det-motion-prefers-reduced.md to ks docs rule-pages', () => {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  const text = fs.readFileSync(dest, 'utf8');
  const match = text.match(/^page_version:\s*(.+)$/m);
  assert.equal(match?.[1]?.trim(), expectedPageVersion);
  assert.ok(text.includes('title: Prefers-reduced-motion compliance'));
  assert.ok(fs.existsSync(dest));
});
