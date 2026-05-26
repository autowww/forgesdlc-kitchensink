import fs from 'node:fs/promises';

import { defaultWebsiteRoots, findFilesRecursive, readUtf8, writeUtf8 } from '../ops.mjs';
import { htmlPathsFromFindings } from '../url-to-website.mjs';

/**
 * @param {string} html
 */
function stripEmptyInlineInMain(html) {
  const mainRe = /(<main\b[^>]*>)([\s\S]*?)(<\/main>)/i;
  const m = html.match(mainRe);
  if (!m) return html;
  let body = m[2];
  const before = body;
  body = body.replace(/<strong>\s*<\/strong>/gi, '<strong>—</strong>');
  body = body.replace(/<em>\s*<\/em>/gi, '');
  body = body.replace(/<strong><\/strong>/gi, '<strong>—</strong>');
  body = body.replace(/<em><\/em>/gi, '');
  if (body === before) return html;
  return html.replace(mainRe, `${m[1]}${body}${m[3]}`);
}

/**
 * @param {{ repoRoot: string, findings?: object[] }} ctx
 */
export async function runHtmlEmptyInlineFixer(ctx) {
  const { repoRoot, findings = [] } = ctx;
  let touched = 0;
  const explicit = htmlPathsFromFindings(repoRoot, findings);
  const targets =
    explicit.length > 0
      ? explicit
      : (
          await Promise.all(
            defaultWebsiteRoots(repoRoot).map(async (root) => {
              try {
                await fs.access(root);
              } catch {
                return [];
              }
              return findFilesRecursive(root, /\.html?$/i);
            }),
          )
        ).flat();

  for (const file of targets.slice(0, 40)) {
    const html = await readUtf8(file);
    const next = stripEmptyInlineInMain(html);
    if (next !== html) {
      await writeUtf8(file, next);
      touched += 1;
    }
  }

  return { applied: touched > 0, filesTouched: touched, adapter: 'html_empty_inline' };
}
