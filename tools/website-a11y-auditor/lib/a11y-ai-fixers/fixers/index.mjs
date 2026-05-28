import { runAiApplyAudioControlFixer } from './ai-apply-audio-control.mjs';
import { runAiApplyFormErrorFixer } from './ai-apply-form-error.mjs';
import { runPlanOnlyFixer } from './plan-only.mjs';
import { runRemediationNoteFixer } from './remediation-note.mjs';

const FIXERS = {
  plan_only: runPlanOnlyFixer,
  remediation_note: runRemediationNoteFixer,
  ai_apply_audio_control: runAiApplyAudioControlFixer,
  ai_apply_form_error: runAiApplyFormErrorFixer,
};

/**
 * @param {string} fixerId
 * @param {object} ctx
 */
export async function runAiFixerById(fixerId, ctx) {
  const fn = FIXERS[fixerId] || FIXERS.plan_only;
  return fn(ctx);
}
