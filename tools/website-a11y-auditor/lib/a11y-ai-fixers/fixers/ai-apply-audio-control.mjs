import { patchMotionNoAutoplay } from '../../../../website-ux-auditor/lib/ux-deterministic-fixers/fixers/patches/dom-accessibility.mjs';

/**
 * DOM apply pilot: mute/pause autoplay media (pairs with AI.A11Y.GENERIC.AUDIO_CONTROL).
 * @param {{ ruleId: string, findings: object[], repoRoot?: string, outDir?: string }} ctx
 */
export async function runAiApplyAudioControlFixer(ctx) {
  if (!ctx.repoRoot) {
    return { applied: false, fixerId: 'ai_apply_audio_control', reason: 'missing_repo_root' };
  }
  if (!ctx.findings?.length) {
    return { applied: false, fixerId: 'ai_apply_audio_control', reason: 'no_findings' };
  }
  const result = await patchMotionNoAutoplay({
    repoRoot: ctx.repoRoot,
    findings: ctx.findings,
  });
  return {
    ...result,
    fixerId: 'ai_apply_audio_control',
    applied: Boolean(result.applied),
  };
}
