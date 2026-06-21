import { runHtmlPatchFixer } from './ai-apply-html-patch.mjs';

/**
 * @param {{ ruleId: string, findings: object[], repoRoot?: string }} ctx
 */
export async function runAiApplyEmptyStateFixer(ctx) {
  return runHtmlPatchFixer({
    repoRoot: ctx.repoRoot,
    findings: ctx.findings,
    fixerId: 'ai_apply_empty_state',
    transform: (html) => {
      if (/\bclass=["'][^"']*empty-state/i.test(html)) return html;
      if (!/\bNo data\b/i.test(html) && !/\bEmpty\b/i.test(html)) return html;
      return html.replace(
        /<(p|div)([^>]*)>\s*(No data|Empty)\s*<\/\1>/gi,
        '<$1$2 class="empty-state"><span class="empty-state__title">$3</span><span class="empty-state__hint">Add items or adjust filters to see results.</span></$1>',
      );
    },
  });
}
