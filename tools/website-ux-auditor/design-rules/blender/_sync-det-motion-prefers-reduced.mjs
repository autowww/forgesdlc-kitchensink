#!/usr/bin/env node
/**
 * Copy det-motion-prefers-reduced.md from blender staging to canonical KS paths.
 * Run from forgesdlc-kitchensink repo root:
 *   node tools/website-ux-auditor/design-rules/blender/_sync-det-motion-prefers-reduced.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const blenderDir = path.dirname(fileURLToPath(import.meta.url));
const ksRoot = path.resolve(blenderDir, '../../../..');
const src = path.join(
  blenderDir,
  'docs/design/ux-audit/rule-pages/det-motion-prefers-reduced.md',
);
const dests = [
  path.join(ksRoot, 'docs/design/ux-audit/rule-pages/det-motion-prefers-reduced.md'),
  path.join(
    ksRoot,
    'tools/website-ux-auditor/docs/design/ux-audit/rule-pages/det-motion-prefers-reduced.md',
  ),
];

const expectedVersion =
  'd9481ea972486cca7587b718930908984ff9fee24b576e1086411685a71ddade';

if (!fs.existsSync(src)) {
  console.error('Source missing:', src);
  process.exit(1);
}

const text = fs.readFileSync(src, 'utf8');
const match = text.match(/^page_version:\s*(.+)$/m);
if (match?.[1]?.trim() !== expectedVersion) {
  console.error('Unexpected page_version:', match?.[1]?.trim());
  process.exit(1);
}

for (const dest of dests) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  console.log('copied ->', dest);
}
