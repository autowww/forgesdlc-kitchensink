import { extractFragmentByClass } from '../../handbook-loader.mjs';
import { patchHtmlFiles } from './shared.mjs';

const FOOTER_STUB = `<footer
  hash="Ksf"
  data-ks-hash="Ksf"
  data-ks-type="chrome-region"
  data-ks-name="site-footer"
  class="ks-site-footer-region border-top py-4 mt-4"
>
  <p class="forge-support mb-0 text-center">© Forge</p>
</footer>`;

/**
 * @param {{ repoRoot: string, afterHtml?: string, findings?: object[] }} ctx
 */
export async function patchLandmarksRequired(ctx) {
  const touched = await patchHtmlFiles(ctx.repoRoot, ctx.findings || [], (html) => {
    let out = html;
    if (!/<main\b/i.test(out)) {
      out = out.replace(/<body\b[^>]*>/i, (m) => `${m}\n<main id="main"><p>Content</p></main>`);
    } else if (!/\bid=["']main["']/i.test(out)) {
      out = out.replace(/<main\b/i, '<main id="main"');
    }
    if (!/<header\b/i.test(out)) {
      out = out.replace(/<body\b[^>]*>/i, (m) => `${m}\n<header class="site-header"><p class="mb-0">Site</p></header>`);
    }
    if (!/<footer\b/i.test(out)) {
      out = out.replace(/<\/body>/i, `${FOOTER_STUB}\n</body>`);
    }
    return out;
  });
  return { applied: touched > 0, filesTouched: touched, adapter: 'dom_accessibility' };
}

/**
 * @param {{ repoRoot: string, findings?: object[] }} ctx
 */
export async function patchDiagramAlt(ctx) {
  const touched = await patchHtmlFiles(ctx.repoRoot, ctx.findings || [], (html) => {
    let out = html;
    out = out.replace(
      /<img\b((?![^>]*\balt=)[^>]*)>/gi,
      '<img alt="Diagram summary"$1>',
    );
    out = out.replace(
      /<svg\b((?![^>]*\baria-label=)[^>]*)>/gi,
      '<svg role="img" aria-label="Diagram"$1>',
    );
    return out;
  });
  return { applied: touched > 0, filesTouched: touched, adapter: 'dom_accessibility' };
}

/**
 * @param {{ repoRoot: string, findings?: object[] }} ctx
 */
export async function patchDataTableHeaders(ctx) {
  const touched = await patchHtmlFiles(ctx.repoRoot, ctx.findings || [], (html) => {
    let out = html;
    out = out.replace(/<th\b((?![^>]*\bscope=)[^>]*)>/gi, '<th scope="col"$1>');
    return out;
  });
  return { applied: touched > 0, filesTouched: touched, adapter: 'dom_accessibility' };
}

/**
 * @param {{ repoRoot: string, findings?: object[] }} ctx
 */
export async function patchCtaLabelNonempty(ctx) {
  const touched = await patchHtmlFiles(ctx.repoRoot, ctx.findings || [], (html) => {
    let out = html;
    out = out.replace(/<button\b([^>]*)>\s*<\/button>/gi, '<button$1>Continue</button>');
    out = out.replace(/<a\b([^>]*class=["'][^"']*btn[^"']*["'][^>]*)>\s*<\/a>/gi, '<a$1>Continue</a>');
    return out;
  });
  return { applied: touched > 0, filesTouched: touched, adapter: 'dom_accessibility' };
}

/**
 * @param {{ repoRoot: string, afterHtml?: string, findings?: object[] }} ctx
 */
export async function patchNavInPageToc(ctx) {
  const snippet =
    extractFragmentByClass(ctx.afterHtml || '', 'ks-doc-toc') ||
    `<nav class="ks-doc-toc forge-toc mb-3" aria-label="On this page"><ul class="nav flex-column"><li class="nav-item"><a class="nav-link" href="#overview">Overview</a></li></ul></nav>`;
  const touched = await patchHtmlFiles(ctx.repoRoot, ctx.findings || [], (html) => {
    if (/ks-doc-toc|forge-toc/i.test(html)) return html;
    const main = html.match(/<main\b[^>]*>/i);
    if (!main) return html;
    return html.replace(main[0], `${main[0]}\n${snippet}\n`);
  });
  return { applied: touched > 0, filesTouched: touched, adapter: 'dom_accessibility' };
}

/**
 * @param {{ repoRoot: string, findings?: object[] }} ctx
 */
export async function patchCardTitle(ctx) {
  const touched = await patchHtmlFiles(ctx.repoRoot, ctx.findings || [], (html) => {
    let out = html;
    out = out.replace(
      /(<div[^>]*class=["'][^"']*forge-card[^"']*["'][^>]*>)(?![\s\S]*?<h[2-6])/gi,
      '$1<h2 class="h5 font-display mb-2">Section</h2>',
    );
    return out;
  });
  return { applied: touched > 0, filesTouched: touched, adapter: 'dom_accessibility' };
}

/**
 * @param {{ repoRoot: string, findings?: object[] }} ctx
 */
export async function patchSectionHeading(ctx) {
  const touched = await patchHtmlFiles(ctx.repoRoot, ctx.findings || [], (html) => {
    let out = html;
    out = out.replace(
      /(<section\b[^>]*>)(?!\s*<h[2-6])/gi,
      '$1<h2 class="font-display mt-4">Section</h2>',
    );
    return out;
  });
  return { applied: touched > 0, filesTouched: touched, adapter: 'dom_accessibility' };
}

/**
 * @param {{ repoRoot: string, findings?: object[] }} ctx
 */
export async function patchMotionReduced(ctx) {
  const touched = await patchHtmlFiles(ctx.repoRoot, ctx.findings || [], (html) => {
    if (/@media\s*\(\s*prefers-reduced-motion/i.test(html)) return html;
    const block =
      '<style>@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } }</style>';
    return html.replace(/<\/head>/i, `${block}\n</head>`);
  });
  return { applied: touched > 0, filesTouched: touched, adapter: 'dom_accessibility' };
}

/**
 * @param {{ repoRoot: string, findings?: object[] }} ctx
 */
export async function patchMotionNoAutoplay(ctx) {
  const touched = await patchHtmlFiles(ctx.repoRoot, ctx.findings || [], (html) => {
    let out = html;
    out = out.replace(/\bautoplay\b/gi, '');
    out = out.replace(/<video\b([^>]*)>/gi, '<video$1 muted playsinline>');
    return out;
  });
  return { applied: touched > 0, filesTouched: touched, adapter: 'dom_accessibility' };
}
