#!/usr/bin/env node
import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const toolRoot = dirname(fileURLToPath(import.meta.url));
const src = join(toolRoot, 'docs/design/ux-audit/rule-pages/det-data-color-only.md');
const dest = join(toolRoot, '../../docs/design/ux-audit/rule-pages/det-data-color-only.md');
const expected =
  '6867492406d3ec909a0742d87b388c8f118929ae94e16f369025c8fa1c41f736';

mkdirSync(dirname(dest), { recursive: true });
copyFileSync(src, dest);
const destExists = existsSync(dest);
const text = destExists ? readFileSync(dest, 'utf8') : '';
const m = text.match(/^page_version:\s*(.+)$/m);
const pageVersion = m ? m[1].trim() : null;
const pageVersionLine = text.match(/^page_version:.*$/m)?.[0] ?? null;

console.log(
  JSON.stringify({
    ok: destExists && pageVersion === expected,
    dest_exists: destExists,
    page_version: pageVersion,
    page_version_line: pageVersionLine,
    dest,
  }),
);
