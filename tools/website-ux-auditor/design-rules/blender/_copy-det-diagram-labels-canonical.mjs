#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(__dirname, 'docs/design/ux-audit/rule-pages/det-diagram-labels.md');
const dest = path.resolve(__dirname, '../../../../docs/design/ux-audit/rule-pages/det-diagram-labels.md');
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.copyFileSync(src, dest);
fs.unlinkSync(src);
const text = fs.readFileSync(dest, 'utf8');
const pageVersion = text.match(/^page_version:\s*(.+)$/m)?.[1]?.trim() ?? null;
const generatedAt = text.match(/^generated_at:\s*(.+)$/m)?.[1]?.trim() ?? null;
const hasRelatedRules = /^related_rules:\s*$/m.test(text);
console.log(JSON.stringify({ ok: true, page_version: pageVersion, generated_at: generatedAt, has_related_rules: hasRelatedRules, src_removed: !fs.existsSync(src) }));
