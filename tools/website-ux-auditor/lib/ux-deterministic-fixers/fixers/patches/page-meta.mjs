import { ensureMeta, patchHtmlFiles } from './shared.mjs';

/**
 * @param {{ repoRoot: string, findings?: object[] }} ctx
 */
export async function patchPageLang(ctx) {
  const touched = await patchHtmlFiles(ctx.repoRoot, ctx.findings || [], (html) => {
    if (/\blang=["'][a-z]/i.test(html)) return html;
    return html.replace(/<html\b/i, '<html lang="en"');
  });
  return { applied: touched > 0, filesTouched: touched, adapter: 'page_meta' };
}

/**
 * @param {{ repoRoot: string, findings?: object[] }} ctx
 */
export async function patchPageViewport(ctx) {
  const touched = await patchHtmlFiles(ctx.repoRoot, ctx.findings || [], (html) =>
    ensureMeta(html, 'viewport', 'width=device-width, initial-scale=1'),
  );
  return { applied: touched > 0, filesTouched: touched, adapter: 'page_meta' };
}

/**
 * @param {{ repoRoot: string, findings?: object[] }} ctx
 */
export async function patchPageMode(ctx) {
  const script = `<script>(function(){try{document.documentElement.setAttribute('data-bs-theme','dark');}catch(e){}})();</script>`;
  const touched = await patchHtmlFiles(ctx.repoRoot, ctx.findings || [], (html) => {
    if (/data-bs-theme/i.test(html)) return html;
    return html.replace(/<head([^>]*)>/i, `<head$1>\n  ${script}`);
  });
  return { applied: touched > 0, filesTouched: touched, adapter: 'page_meta' };
}
