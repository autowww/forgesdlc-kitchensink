import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = join(here, 'docs/design/ux-audit/rule-pages/det-diagram-alt.md');
const dest = join(here, '../../docs/design/ux-audit/rule-pages/det-diagram-alt.md');
mkdirSync(dirname(dest), { recursive: true });
copyFileSync(src, dest);
console.log('copied to', dest);
