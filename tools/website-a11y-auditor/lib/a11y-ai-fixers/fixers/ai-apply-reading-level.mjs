import { patchReadingLevel } from '../../../../website-ux-auditor/lib/ux-deterministic-fixers/fixers/patches/a11y-supplemental.mjs';

/**
 * DOM apply pilot: split long paragraphs (pairs with AI.A11Y.GENERIC.READING_LEVEL).
 * @param {{ ruleId: string, findings: object[], repoRoot?: string }} ctx
 */
export async function runAiApplyReadingLevelFixer(ctx) {
  if (!ctx.repoRoot) {
    return { applied: false, fixerId: 'ai_apply_reading_level', reason: 'missing_repo_root' };
  }
  if (!ctx.findings?.length) {
    return { applied: false, fixerId: 'ai_apply_reading_level', reason: 'no_findings' };
  }
  const result = await patchReadingLevel({
    repoRoot: ctx.repoRoot,
    findings: ctx.findings,
  });
  return {
    ...result,
    fixerId: 'ai_apply_reading_level',
    applied: Boolean(result.applied),
  };
}
