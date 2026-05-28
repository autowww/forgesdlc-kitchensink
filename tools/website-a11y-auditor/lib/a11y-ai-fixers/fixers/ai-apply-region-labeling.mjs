import { patchRegionLabeling } from '../../../../website-ux-auditor/lib/ux-deterministic-fixers/fixers/patches/dom-accessibility.mjs';

/**
 * DOM apply pilot: aria-label on landmarks (pairs with AI.A11Y.KS.REGION_LABELING).
 * @param {{ ruleId: string, findings: object[], repoRoot?: string }} ctx
 */
export async function runAiApplyRegionLabelingFixer(ctx) {
  if (!ctx.repoRoot) {
    return { applied: false, fixerId: 'ai_apply_region_labeling', reason: 'missing_repo_root' };
  }
  if (!ctx.findings?.length) {
    return { applied: false, fixerId: 'ai_apply_region_labeling', reason: 'no_findings' };
  }
  const result = await patchRegionLabeling({
    repoRoot: ctx.repoRoot,
    findings: ctx.findings,
  });
  return {
    ...result,
    fixerId: 'ai_apply_region_labeling',
    applied: Boolean(result.applied),
  };
}
