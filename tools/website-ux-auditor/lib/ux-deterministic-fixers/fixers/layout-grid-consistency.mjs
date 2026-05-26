import fs from 'node:fs/promises';

import { defaultWebsiteRoots, findFilesRecursive, readUtf8, writeUtf8 } from '../ops.mjs';
import { htmlPathsFromFindings } from '../url-to-website.mjs';

/**
 * Wrap main inner content in a reading-width container when prose lacks grid ancestry.
 * @param {string} html
 */
function wrapMainProseContainer(html) {
  const mainRe = /(<main\b([^>]*)>)([\s\S]*?)(<\/main>)/i;
  const m = html.match(mainRe);
  if (!m) return html;
  const attrs = m[2];
  const inner = m[3];
  if (/\bdoc-content\b/.test(inner) || /\bcontainer\b/.test(inner.slice(0, 400))) {
    return html;
  }
  if (/<div[^>]*class=["'][^"']*doc-content/.test(inner)) {
    return html;
  }
  const wrapped = `<div class="doc-content mx-auto" style="max-width:56rem">\n${inner.trim()}\n</div>`;
  return html.replace(mainRe, `<main${attrs}>${wrapped}</main>`);
}

/**
 * @param {{ repoRoot: string, findings?: object[] }} ctx
 */
export async function runLayoutGridConsistencyFixer(ctx) {
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
    const next = wrapMainProseContainer(html);
    if (next !== html) {
      await writeUtf8(file, next);
      touched += 1;
    }
  }

  return { applied: touched > 0, filesTouched: touched, adapter: 'layout_grid_consistency' };
}
