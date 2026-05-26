import fs from 'node:fs/promises';

import { extractFragmentByClass } from '../handbook-loader.mjs';
import { defaultWebsiteRoots, findFilesRecursive, readUtf8, writeUtf8 } from '../ops.mjs';
import { htmlPathsFromFindings } from '../url-to-website.mjs';

const DEFAULT_BREADCRUMB = `<nav
  class="ks-doc-breadcrumb"
  aria-label="Breadcrumb"
  hash="Kbc"
  data-ks-hash="Kbc"
  data-ks-type="chrome-region"
  data-ks-name="doc-breadcrumb"
>
  <ol class="breadcrumb mb-0">
    <li class="breadcrumb-item"><a href="/">Home</a></li>
    <li class="breadcrumb-item active" aria-current="page">This page</li>
  </ol>
</nav>`;

/**
 * @param {string} html
 * @param {string} breadcrumbHtml
 */
function injectBreadcrumb(html, breadcrumbHtml) {
  if (/ks-doc-breadcrumb|data-ks-hash=["']Kbc["']/i.test(html)) {
    return html;
  }
  const headerContent = html.match(
    /(<div[^>]*class=["'][^"']*site-header-content[^"']*["'][^>]*>)([\s\S]*?)(<\/div>)/i,
  );
  if (headerContent) {
    const inner = headerContent[2];
    if (/ks-doc-breadcrumb|aria-label=["']Breadcrumb/i.test(inner)) {
      return html;
    }
    const nextInner = `${breadcrumbHtml}\n        ${inner.trimStart()}`;
    return html.replace(headerContent[0], `${headerContent[1]}${nextInner}${headerContent[3]}`);
  }
  const mainOpen = html.match(/<main\b[^>]*>/i);
  if (mainOpen) {
    return html.replace(mainOpen[0], `${mainOpen[0]}\n${breadcrumbHtml}\n`);
  }
  return html;
}

/**
 * @param {{ repoRoot: string, afterHtml?: string, findings?: object[] }} ctx
 */
export async function runNavBreadcrumbFixer(ctx) {
  const { repoRoot, afterHtml = '', findings = [] } = ctx;
  let breadcrumbHtml = extractFragmentByClass(afterHtml, 'ks-doc-breadcrumb');
  if (!breadcrumbHtml) {
    breadcrumbHtml = DEFAULT_BREADCRUMB;
  }

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
    const next = injectBreadcrumb(html, breadcrumbHtml);
    if (next !== html) {
      await writeUtf8(file, next);
      touched += 1;
    }
  }

  return { applied: touched > 0, filesTouched: touched, adapter: 'nav_breadcrumb' };
}
