/**
 * DET.APP.CONTROL_A11Y — ARIA role/state fixes on react primitives require source edits.
 * @param {{ ruleId: string, repoRoot: string, findings?: object[] }} ctx
 */
export async function runAppControlA11yFixer(ctx) {
  const { findings = [] } = ctx;
  if (!findings.length) {
    return { applied: false, error: 'no DET.APP.CONTROL_A11Y findings' };
  }
  return {
    applied: false,
    error:
      'ARIA role/state violations on react primitives need manual or agent edits in react/*.tsx (aria-expanded, accessible names, live regions).',
    adapter: 'app_control_a11y_agent',
  };
}
