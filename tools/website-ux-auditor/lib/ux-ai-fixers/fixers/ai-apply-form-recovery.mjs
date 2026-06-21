import { runHtmlPatchFixer } from './ai-apply-html-patch.mjs';

/**
 * @param {{ ruleId: string, findings: object[], repoRoot?: string }} ctx
 */
export async function runAiApplyFormRecoveryFixer(ctx) {
  return runHtmlPatchFixer({
    repoRoot: ctx.repoRoot,
    findings: ctx.findings,
    fixerId: 'ai_apply_form_recovery',
    transform: (html) => {
      let out = html;
      if (!/<form\b/i.test(out)) return out;
      if (!/\brole=["']alert["']/i.test(out) && /<form\b/i.test(out)) {
        out = out.replace(/<form\b/i, '<form novalidate ');
      }
      return out;
    },
  });
}
