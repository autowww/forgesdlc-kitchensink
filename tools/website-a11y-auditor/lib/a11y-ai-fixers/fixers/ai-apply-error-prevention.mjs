import { patchErrorPrevention } from '../../../../website-ux-auditor/lib/ux-deterministic-fixers/fixers/patches/a11y-supplemental.mjs';

/**
 * DOM apply pilot: confirm step on sensitive forms (pairs with AI.A11Y.GENERIC.ERROR_PREVENTION).
 * @param {{ ruleId: string, findings: object[], repoRoot?: string }} ctx
 */
export async function runAiApplyErrorPreventionFixer(ctx) {
  if (!ctx.repoRoot) {
    return { applied: false, fixerId: 'ai_apply_error_prevention', reason: 'missing_repo_root' };
  }
  if (!ctx.findings?.length) {
    return { applied: false, fixerId: 'ai_apply_error_prevention', reason: 'no_findings' };
  }
  const result = await patchErrorPrevention({
    repoRoot: ctx.repoRoot,
    findings: ctx.findings,
  });
  return {
    ...result,
    fixerId: 'ai_apply_error_prevention',
    applied: Boolean(result.applied),
  };
}
