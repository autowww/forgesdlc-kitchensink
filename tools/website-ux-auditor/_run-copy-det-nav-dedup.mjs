import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const src = join(root, 'tools/website-ux-auditor/.staging-det-nav-dedup.md');
const dest = join(root, 'docs/design/ux-audit/rule-pages/det-nav-dedup.md');
mkdirSync(dirname(dest), { recursive: true });
copyFileSync(src, dest);
console.log('copied', dest);
console.log('page_version', dest.match(/page_version:.*/)?.[0] ?? 'missing');
