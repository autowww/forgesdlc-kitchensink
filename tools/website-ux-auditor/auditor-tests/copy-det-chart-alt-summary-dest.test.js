import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const toolRoot = path.resolve(__dirname, '..');
const src = path.join(
  toolRoot,
  'docs/design/ux-audit/rule-pages/det-chart-alt-summary.md',
);
const dest = path.resolve(
  toolRoot,
  '../../docs/design/ux-audit/rule-pages/det-chart-alt-summary.md',
);
const expectedPageVersion =
  '6c251e266ae748fcae1c2704355aa3b9e01b41b427713414b2268dc540d32340';

test('copy det-chart-alt-summary.md to ks docs rule-pages', () => {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  const fixed = fs
    .readFileSync(dest, 'utf8')
    .replace(/motion\/div#ks-cw/g, 'div#ks-cw');
  fs.writeFileSync(dest, fixed);
  const match = fixed.match(/^page_version:\s*(.+)$/m);
  assert.equal(match?.[1], expectedPageVersion);
  const line125 = fixed.split('\n')[124];
  assert.match(line125, /div#ks-cw/);
  assert.doesNotMatch(line125, /motion\/div#ks-cw/);
});
