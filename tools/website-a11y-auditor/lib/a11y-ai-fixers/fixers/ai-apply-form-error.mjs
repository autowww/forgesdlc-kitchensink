import { patchHtmlFiles } from '../../../../website-ux-auditor/lib/ux-deterministic-fixers/fixers/patches/shared.mjs';

/**
 * DOM apply pilot: associate visible error text with inputs via aria-describedby.
 * @param {{ ruleId: string, findings: object[], repoRoot?: string }} ctx
 */
export async function runAiApplyFormErrorFixer(ctx) {
  if (!ctx.repoRoot) {
    return { applied: false, fixerId: 'ai_apply_form_error', reason: 'missing_repo_root' };
  }
  if (!ctx.findings?.length) {
    return { applied: false, fixerId: 'ai_apply_form_error', reason: 'no_findings' };
  }
  const touched = await patchHtmlFiles(ctx.repoRoot, ctx.findings, (html) => {
    let out = html;
    const errorRe =
      /<(?:p|div|span)[^>]*\b(?:class|role)=["'][^"']*(?:error|invalid|alert)[^"']*["'][^>]*id=["']([^"']+)["'][^>]*>/gi;
    let m;
    const errorIds = [];
    while ((m = errorRe.exec(html)) !== null) errorIds.push(m[1]);
    if (!errorIds.length) return out;
    const describedby = errorIds.slice(0, 3).join(' ');
    out = out.replace(
      /<input\b(?![^>]*\baria-describedby=)([^>]*)\/?>/gi,
      (tag, attrs) => `<input aria-describedby="${describedby}"${attrs}/>`,
    );
    return out;
  });
  return {
    applied: touched > 0,
    fixerId: 'ai_apply_form_error',
    filesTouched: touched,
  };
}
