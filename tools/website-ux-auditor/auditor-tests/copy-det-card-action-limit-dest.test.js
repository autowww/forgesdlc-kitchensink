import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const toolRoot = path.resolve(__dirname, '..');
const src = path.join(toolRoot, 'docs/design/ux-audit/rule-pages/det-card-action-limit.md');
const dest = path.resolve(toolRoot, '../../docs/design/ux-audit/rule-pages/det-card-action-limit.md');
const expectedPageVersion =
  '8b47ef1cec520e036dadd4f0ae3e9fb630d0f96e8be3c9728b373c131624629c';

test('copy det-card-action-limit.md to ks docs rule-pages', () => {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  const raw = fs.readFileSync(dest, 'utf8');
  const match = raw.match(/^page_version:\s*(.+)$/m);
  assert.equal(match?.[1], expectedPageVersion);
  if (fs.readFileSync(src, 'utf8') === raw) {
    fs.unlinkSync(src);
  }
});
