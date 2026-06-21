#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeManifest } from './rule-page-version.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(
  __dirname,
  'docs/design/ux-audit/rule-pages/ai-premium-enterprise-feel.md',
);
const dest = path.resolve(__dirname, '../../../../docs/design/ux-audit/rule-pages/ai-premium-enterprise-feel.md');
await fs.mkdir(path.dirname(dest), { recursive: true });
await fs.copyFile(src, dest);
console.log('copied', dest);
const manifest = await writeManifest(
  JSON.parse(await fs.readFile(path.resolve(__dirname, '../registry.generated.json'), 'utf8')),
);
const row = manifest.rules.find((r) => r.id === 'AI.PREMIUM.ENTERPRISE_FEEL');
console.log(JSON.stringify(row, null, 2));
