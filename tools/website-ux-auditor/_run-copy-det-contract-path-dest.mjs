#!/usr/bin/env node
import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const toolRoot = join(dirname(fileURLToPath(import.meta.url)));
const src = join(
  toolRoot,
  'docs/design/ux-audit/rule-pages/det-contract-path.md',
);
const dest = join(toolRoot, '../../docs/design/ux-audit/rule-pages/det-contract-path.md');
const expected =
  '6083955e6d8907caed366060a29dc76649afb4426732ba85cdadc89524e30a35';

mkdirSync(dirname(dest), { recursive: true });
copyFileSync(src, dest);
const destExists = existsSync(dest);
const text = destExists ? readFileSync(dest, 'utf8') : '';
const m = text.match(/^page_version:\s*(.+)$/m);
const pageVersion = m ? m[1].trim() : null;

console.log(
  JSON.stringify({
    ok: destExists && pageVersion === expected,
    dest_exists: destExists,
    page_version: pageVersion,
  }),
);
