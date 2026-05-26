import fs from 'node:fs/promises';
import path from 'node:path';
import { defaultWebsiteRoots, findFilesRecursive, readUtf8, setDocumentTitle, writeUtf8 } from '../ops.mjs';

/**
 * Extract <title> from handbook After HTML fragment.
 * @param {string} afterHtml
 */
function titleFromAfter(afterHtml) {
  const m = afterHtml.match(/<title[^>]*>([^<]*)<\/title>/i);
  if (m) return m[1].trim();
  const h1 = afterHtml.match(/<h1[^>]*>([^<]*)<\/h1>/i);
  if (h1) return h1[1].trim();
  return '';
}

/**
 * @param {{ ruleId: string, repoRoot: string, afterHtml?: string, findings?: object[] }} ctx
 */
export async function runPageTitleFixer(ctx) {
  const { repoRoot, afterHtml, findings = [] } = ctx;
  let title = afterHtml ? titleFromAfter(afterHtml) : '';
  if (!title && findings.length) {
    const msg = findings[0].message || '';
    const em = msg.match(/Title:\s*"([^"]+)"/);
    if (em) title = `Fixed — ${em[1]}`;
  }
  if (!title) title = 'Forge product page';

  let touched = 0;
  for (const root of defaultWebsiteRoots(repoRoot)) {
    try {
      await fs.access(root);
    } catch {
      continue;
    }
    const htmlFiles = await findFilesRecursive(root, /\.html?$/i);
    for (const file of htmlFiles.slice(0, 20)) {
      const html = await readUtf8(file);
      const next = setDocumentTitle(html, title);
      if (next !== html) {
        await writeUtf8(file, next);
        touched += 1;
      }
    }
  }
  return { applied: touched > 0, filesTouched: touched, adapter: 'page_title' };
}
