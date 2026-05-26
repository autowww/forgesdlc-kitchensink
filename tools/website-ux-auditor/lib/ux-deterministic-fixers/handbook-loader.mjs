import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOOL_ROOT = path.resolve(__dirname, '../..');
export const KS_ROOT = path.resolve(TOOL_ROOT, '../..');
const RULE_PAGES_DIR = path.join(KS_ROOT, 'docs', 'design', 'ux-audit', 'rule-pages');

/**
 * @param {string} ruleId e.g. DET.PAGE.TITLE
 */
export function kebabFromRuleId(ruleId) {
  return String(ruleId || '')
    .replace(/^DET\./, 'det-')
    .replace(/\./g, '-')
    .toLowerCase();
}

/**
 * @param {string} rawMd
 */
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

/**
 * @param {string} sectionBody
 */
export function extractHtmlFence(sectionBody) {
  const m = sectionBody.match(/```html\s*\r?\n([\s\S]*?)```/i);
  return m ? m[1].trim() : '';
}

/**
 * @param {string} rawMd
 * @param {string} sectionSubstring
 */
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

/**
 * @param {string} rawMd
 */
export function extractAfterExampleHtml(rawMd) {
  const section = extractSectionBody(rawMd, 'after example');
  return section ? extractHtmlFence(section) : '';
}

/**
 * @param {string} ruleId
 */
export async function loadRulePageMarkdown(ruleId) {
  const mdPath = path.join(RULE_PAGES_DIR, `${kebabFromRuleId(ruleId)}.md`);
  return fs.readFile(mdPath, 'utf8');
}

/**
 * @param {string} ruleId
 */
export async function loadAfterHtmlForRule(ruleId) {
  try {
    const raw = await loadRulePageMarkdown(ruleId);
    return extractAfterExampleHtml(raw);
  } catch {
    return '';
  }
}

/**
 * Extract first matching element outer HTML from a fragment.
 * @param {string} html
 * @param {string} selectorHint class name substring e.g. ks-doc-breadcrumb
 */
export function extractFragmentByClass(html, selectorHint) {
  const re = new RegExp(
    `<([a-z][a-z0-9]*)\\b[^>]*class=["'][^"']*\\b${selectorHint}\\b[^"']*["'][^>]*>[\\s\\S]*?<\\/\\1>`,
    'i',
  );
  const m = html.match(re);
  return m ? m[0] : '';
}
