import { runRemediationNoteFixer } from './remediation-note.mjs';

/**
 * Dashboard priority fixes are layout/copy-heavy; emit remediation note when sources resolve.
 * @param {object} ctx
 */
export async function runAiApplyDashboardPriorityFixer(ctx) {
  const note = await runRemediationNoteFixer(ctx);
  return { ...note, fixerId: 'ai_apply_dashboard_priority' };
}
