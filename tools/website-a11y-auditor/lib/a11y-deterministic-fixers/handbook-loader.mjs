import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOOL_ROOT = path.resolve(__dirname, '../..');
export const KS_ROOT = path.resolve(TOOL_ROOT, '../..');
const RULE_PAGES_DIR = path.join(KS_ROOT, 'docs', 'design', 'a11y-audit', 'rule-pages');

export function kebabFromRuleId(ruleId) {
  return String(ruleId || '')
    .toLowerCase()
    .replace(/\./g, '-')
    .replace(/_/g, '-');
}

export function parseFrontMatter(rawMd) {
  const m = rawMd.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) return { front: {}, body: rawMd };
  const front = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([a-z0-9_]+):\s*(.*)$/i);
    if (kv) front[kv[1]] = kv[2].trim();
  }
  return { front, body: m[2] };
}

export function extractHtmlFence(sectionBody) {
  const m = sectionBody.match(/```html\s*\r?\n([\s\S]*?)```/i);
  return m ? m[1].trim() : '';
}

export function extractSectionBody(rawMd, sectionSubstring) {
  const { body } = parseFrontMatter(rawMd);
  const parts = body.split(/^## /m);
  for (const part of parts) {
    if (!part.trim()) continue;
    const nl = part.indexOf('\n');
    const title = (nl >= 0 ? part.slice(0, nl) : part).trim();
    const content = nl >= 0 ? part.slice(nl + 1) : '';
    if (title.toLowerCase().includes(sectionSubstring.toLowerCase())) {
      return content.trim();
    }
  }
  return '';
}

export async function loadRulePageMarkdown(ruleId) {
  const mdPath = path.join(RULE_PAGES_DIR, `${kebabFromRuleId(ruleId)}.md`);
  return fs.readFile(mdPath, 'utf8');
}

export async function loadAfterHtmlForRule(ruleId) {
  const raw = await loadRulePageMarkdown(ruleId);
  const section = extractSectionBody(raw, 'after example');
  return section ? extractHtmlFence(section) : '';
}
