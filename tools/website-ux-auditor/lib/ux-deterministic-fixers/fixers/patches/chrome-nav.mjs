import { patchHtmlFiles } from './shared.mjs';

/**
 * @param {{ repoRoot: string, findings?: object[] }} ctx
 */
export async function patchChromeBoundary(ctx) {
  const touched = await patchHtmlFiles(ctx.repoRoot, ctx.findings || [], (html) => {
    let out = html;
    out = out.replace(/\b(d-none)\s+(d-lg-block|d-lg-flex)\b/gi, '$2');
    return out;
  });
  return { applied: touched > 0, filesTouched: touched, adapter: 'chrome_nav' };
}

/**
 * @param {{ repoRoot: string, findings?: object[] }} ctx
 */
export async function patchButtonGroupMax(ctx) {
  const touched = await patchHtmlFiles(ctx.repoRoot, ctx.findings || [], (html) => {
    if (!/landing-hero-actions__buttons/.test(html)) return html;
    if (/flex-wrap/.test(html)) return html;
    return html.replace(
      /landing-hero-actions__buttons/g,
      'landing-hero-actions__buttons flex-wrap',
    );
  });
  return { applied: touched > 0, filesTouched: touched, adapter: 'chrome_nav' };
}

/**
 * @param {{ repoRoot: string, findings?: object[] }} ctx
 */
export async function patchCtaHierarchy(ctx) {
  const touched = await patchHtmlFiles(ctx.repoRoot, ctx.findings || [], (html) => {
    let out = html;
    if (!/btn-primary/.test(out) && /btn-outline/.test(out)) {
      out = out.replace(/\bbtn-outline-secondary\b/, 'btn-primary');
    }
    return out;
  });
  return { applied: touched > 0, filesTouched: touched, adapter: 'chrome_nav' };
}

/**
 * @param {{ repoRoot: string, findings?: object[] }} ctx
 */
export async function patchAmbientZIndex(ctx) {
  const block =
    '<style>.forge-theme-dropdown,.site-header,.ks-doc-breadcrumb{z-index:1050;}.forge-aurora{z-index:0;}</style>';
  const touched = await patchHtmlFiles(ctx.repoRoot, ctx.findings || [], (html) => {
    if (/forge-theme-dropdown.*z-index/i.test(html)) return html;
    return html.replace(/<\/head>/i, `${block}\n</head>`);
  });
  return { applied: touched > 0, filesTouched: touched, adapter: 'chrome_nav' };
}

/**
 * @param {{ repoRoot: string, findings?: object[] }} ctx
 */
export async function patchAppFocusTrap(ctx) {
  const opener =
    '<button type="button" class="btn btn-sm btn-outline-secondary m-3" data-bs-toggle="offcanvas" data-bs-target="#docNavOffcanvas" aria-controls="docNavOffcanvas">Open navigation</button>';
  const touched = await patchHtmlFiles(ctx.repoRoot, ctx.findings || [], (html) => {
    let out = html.replace(/\bd-lg-none\b/gi, '');
    if (!/data-bs-toggle=["']offcanvas["']/i.test(out) && /offcanvas/i.test(out)) {
      out = out.replace(/<body\b[^>]*>/i, (m) => `${m}\n${opener}\n`);
    } else if (!/Open navigation/i.test(out)) {
      out = out.replace(/<body\b[^>]*>/i, (m) => `${m}\n${opener}\n`);
    }
    if (/offcanvas/i.test(out) && !/aria-modal=["']true["']/i.test(out)) {
      out = out.replace(
        /<div\b([^>]*class=["'][^"']*offcanvas[^"']*["'][^>]*)>/i,
        '<div$1 aria-modal="true" role="dialog">',
      );
    }
    return out;
  });
  return { applied: touched > 0, filesTouched: touched, adapter: 'chrome_nav' };
}

/**
 * @param {{ repoRoot: string, findings?: object[] }} ctx
 */
export async function patchNavDedup(ctx) {
  const touched = await patchHtmlFiles(ctx.repoRoot, ctx.findings || [], (html) => {
    let out = html;
    out = out.replace(
      /<nav(\s+class=["'][^"']*ks-doc-breadcrumb[^"']*["'][^>]*)>/i,
      '<div$1>',
    );
    out = out.replace(/(<ol[^>]*class=["'][^"']*breadcrumb[^"']*["'][^>]*>[\s\S]*?<\/ol>)\s*<\/nav>/i, '$1</div>');
    return out;
  });
  return { applied: touched > 0, filesTouched: touched, adapter: 'chrome_nav' };
}
