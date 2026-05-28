import fs from 'node:fs/promises';
import path from 'node:path';

import { defaultWebsiteRoots, findFilesRecursive, readUtf8, writeUtf8 } from '../../ops.mjs';
import { htmlPathsFromFindings } from '../../url-to-website.mjs';

/**
 * @param {string} repoRoot
 * @param {object[]} findings
 * @param {number} [cap]
 */
export async function targetHtmlFiles(repoRoot, findings, cap = 40) {
  const explicit = [];
  for (const p of htmlPathsFromFindings(repoRoot, findings)) {
    try {
      await fs.access(p);
      explicit.push(p);
    } catch {
      /* mapped path missing (e.g. harness repo with index.html at root only) */
    }
  }
  if (explicit.length) return explicit.slice(0, cap);
  /** Harness fixture-website/index.html (no website/ subfolder). */
  const harnessIndex = path.join(repoRoot, 'index.html');
  try {
    await fs.access(harnessIndex);
    return [harnessIndex];
  } catch {
    /* */
  }
  const out = [];
  for (const root of defaultWebsiteRoots(repoRoot)) {
    try {
      await fs.access(root);
    } catch {
      continue;
    }
    const files = await findFilesRecursive(root, /\.html?$/i);
    out.push(...files);
    if (out.length >= cap) break;
  }
  return out.slice(0, cap);
}

/**
 * @param {string} repoRoot
 * @param {object[]} findings
 * @param {(html: string, file: string) => string} patchFn
 * @param {number} [cap]
 */
export async function patchHtmlFiles(repoRoot, findings, patchFn, cap = 40) {
  let touched = 0;
  for (const file of await targetHtmlFiles(repoRoot, findings, cap)) {
    const html = await readUtf8(file);
    const next = patchFn(html, file);
    if (next !== html) {
      await writeUtf8(file, next);
      touched += 1;
    }
  }
  return touched;
}

/**
 * @param {string} html
 * @param {string} tag
 * @param {string} attrs
 */
export function ensureTagAfterOpen(html, tag, attrs) {
  const re = new RegExp(`<${tag}\\b[^>]*>`, 'i');
  if (re.test(html)) return html;
  return html.replace(/<body\b[^>]*>/i, (m) => `${m}\n${attrs}`);
}

/**
 * @param {string} html
 * @param {string} name
 * @param {string} content
 */
export function ensureMeta(html, name, content) {
  const tag = `<meta name="${name}" content="${content}" />`;
  if (new RegExp(`name=["']${name}["']`, 'i').test(html)) {
    return html.replace(
      new RegExp(`<meta[^>]+name=["']${name}["'][^>]*\\/?>`, 'i'),
      tag,
    );
  }
  return html.replace(/<head([^>]*)>/i, `<head$1>\n  ${tag}`);
}
