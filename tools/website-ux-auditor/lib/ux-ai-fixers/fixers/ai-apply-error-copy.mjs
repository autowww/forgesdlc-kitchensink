import { runHtmlPatchFixer } from './ai-apply-html-patch.mjs';

/**
 * @param {{ ruleId: string, findings: object[], repoRoot?: string }} ctx
 */
export async function runAiApplyErrorCopyFixer(ctx) {
  return runHtmlPatchFixer({
    repoRoot: ctx.repoRoot,
    findings: ctx.findings,
    fixerId: 'ai_apply_error_copy',
    transform: (html) =>
      html.replace(
        /\b(Error|Failed):\s*([^<]{3,120})/gi,
        (m, label, msg) => {
          if (/try again|contact|refresh/i.test(msg)) return m;
          return `${label}: ${msg.trim()} You can retry or go back without losing your place.`;
        },
      ),
  });
}
