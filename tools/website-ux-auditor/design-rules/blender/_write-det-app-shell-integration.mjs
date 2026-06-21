#!/usr/bin/env node
/** Copy staged DET.APP.SHELL_INTEGRATION handbook page to KS docs (no manifest write). */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(__dirname, '.staging-det-app-shell-integration.md');
const dest = path.resolve(
  __dirname,
  '../../../../docs/design/ux-audit/rule-pages/det-app-shell-integration.md',
);
const accidental = path.resolve(
  __dirname,
  'docs/design/ux-audit/rule-pages/det-app-shell-integration.md',
);
const expectedPageVersion =
  '6dd4b00f88ac436ec18a428e36d29cdb99c488cfb214472e05ceacaacc05d8d7';

await fs.mkdir(path.dirname(dest), { recursive: true });
await fs.copyFile(src, dest);
try {
  await fs.unlink(accidental);
  console.log('removed accidental', accidental);
} catch {
  /* optional */
}
const raw = await fs.readFile(dest, 'utf8');
const titleMatch = raw.match(/^title:\s*(.+)$/m);
const versionMatch = raw.match(/^page_version:\s*(.+)$/m);
if (titleMatch?.[1] !== 'App shell integration') {
  throw new Error(`title mismatch: got ${titleMatch?.[1]}`);
}
if (versionMatch?.[1] !== expectedPageVersion) {
  throw new Error(`page_version mismatch: got ${versionMatch?.[1]}`);
}
console.log('copied', dest);
console.log('title:', titleMatch[1]);
console.log('page_version:', versionMatch[1]);
