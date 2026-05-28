import { runAiApplyAudioControlFixer } from './ai-apply-audio-control.mjs';
import { runAiApplyErrorPreventionFixer } from './ai-apply-error-prevention.mjs';
import { runAiApplyFormErrorFixer } from './ai-apply-form-error.mjs';
import { runAiApplyReadingLevelFixer } from './ai-apply-reading-level.mjs';
import { runAiApplyRegionLabelingFixer } from './ai-apply-region-labeling.mjs';
import { runAiApplyTimingAdjustableFixer } from './ai-apply-timing-adjustable.mjs';
import { runPlanOnlyFixer } from './plan-only.mjs';
import { runRemediationNoteFixer } from './remediation-note.mjs';

const FIXERS = {
  plan_only: runPlanOnlyFixer,
  remediation_note: runRemediationNoteFixer,
  ai_apply_audio_control: runAiApplyAudioControlFixer,
  ai_apply_form_error: runAiApplyFormErrorFixer,
  ai_apply_timing_adjustable: runAiApplyTimingAdjustableFixer,
  ai_apply_reading_level: runAiApplyReadingLevelFixer,
  ai_apply_error_prevention: runAiApplyErrorPreventionFixer,
  ai_apply_region_labeling: runAiApplyRegionLabelingFixer,
};

/**
 * @param {string} fixerId
 * @param {object} ctx
 */
export async function runAiFixerById(fixerId, ctx) {
  const fn = FIXERS[fixerId] || FIXERS.plan_only;
  return fn(ctx);
}
