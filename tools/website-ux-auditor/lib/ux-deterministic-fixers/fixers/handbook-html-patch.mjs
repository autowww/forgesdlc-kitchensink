import { runProductionFixerForRule } from './patch-registry.mjs';

/**
 * Default production lane for handbook_after pilot rules.
 * @param {{ ruleId: string, repoRoot: string, findings?: object[], afterHtml?: string }} ctx
 */
export async function runHandbookHtmlPatchFixer(ctx) {
  const { ruleId } = ctx;
  const result = await runProductionFixerForRule(ruleId, ctx);
  return { ...result, adapter: result.adapter || 'handbook_html_patch' };
}
