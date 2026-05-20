import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const toolRoot = path.resolve(__dirname, '..');
const src = path.join(toolRoot, 'docs/design/ux-audit/rule-pages/det-app-persistent-chrome.md');
const dest = path.resolve(toolRoot, '../../docs/design/ux-audit/rule-pages/det-app-persistent-chrome.md');
const expectedPageVersion =
  'f5a18d2e84b4ae7ae74b1d76e889661ddb5b3a3d117f6e48814e59f6960102aa';

test('copy det-app-persistent-chrome.md to ks docs rule-pages', () => {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  const raw = fs.readFileSync(dest, 'utf8');
  const match = raw.match(/^page_version:\s*(.+)$/m);
  assert.equal(match?.[1], expectedPageVersion);
  fs.unlinkSync(src);
});
