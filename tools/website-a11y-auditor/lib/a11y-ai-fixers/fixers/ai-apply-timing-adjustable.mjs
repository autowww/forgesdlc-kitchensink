import { patchTimingAdjustable } from '../../../../website-ux-auditor/lib/ux-deterministic-fixers/fixers/patches/dom-accessibility.mjs';

/**
 * DOM apply pilot: remove/adjust timing limits (pairs with AI.A11Y.GENERIC.TIMING_ADJUSTABLE).
 * @param {{ ruleId: string, findings: object[], repoRoot?: string }} ctx
 */
export async function runAiApplyTimingAdjustableFixer(ctx) {
  if (!ctx.repoRoot) {
    return { applied: false, fixerId: 'ai_apply_timing_adjustable', reason: 'missing_repo_root' };
  }
  if (!ctx.findings?.length) {
    return { applied: false, fixerId: 'ai_apply_timing_adjustable', reason: 'no_findings' };
  }
  const result = await patchTimingAdjustable({
    repoRoot: ctx.repoRoot,
    findings: ctx.findings,
  });
  return {
    ...result,
    fixerId: 'ai_apply_timing_adjustable',
    applied: Boolean(result.applied),
  };
}
