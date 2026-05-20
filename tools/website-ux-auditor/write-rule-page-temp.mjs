import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ksRoot = path.resolve(__dirname, '../..');
const src = path.join(__dirname, 'docs/design/ux-audit/rule-pages/ai-app-density-balance.md');
const dest = path.join(ksRoot, 'docs/design/ux-audit/rule-pages/ai-app-density-balance.md');
const blender = path.join(__dirname, 'design-rules/blender/rule-page-version.mjs');

fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.copyFileSync(src, dest);
console.log('wrote', dest);

execFileSync(process.execPath, [blender, '--write-manifest'], {
  cwd: path.join(__dirname, 'design-rules/blender'),
  stdio: 'inherit',
});

const raw = fs.readFileSync(dest, 'utf8');
const pageVersion = raw.match(/^page_version:\s*(\S+)/m)?.[1] ?? '';
const manifest = JSON.parse(
  fs.readFileSync(path.join(ksRoot, 'docs/design/ux-audit/rule-pages/rule-pages.manifest.json'), 'utf8'),
);
const row = manifest.rules.find((r) => r.id === 'AI.APP.DENSITY_BALANCE');
console.log('page_version:', pageVersion);
console.log('manifest status:', row?.status ?? 'not found');
console.log('manifest pageVersion:', row?.pageVersion ?? '');
