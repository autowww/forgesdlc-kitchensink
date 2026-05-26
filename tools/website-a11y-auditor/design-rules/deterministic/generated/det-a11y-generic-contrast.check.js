/**
 * DET.A11Y.GENERIC.CONTRAST — heuristic low-contrast text samples from DOM metrics.
 */

export const rule = {
  id: 'DET.A11Y.GENERIC.CONTRAST',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'accessibility',
  scope: 'generic',
  defaultSeverity: 'major',
  priorityWeight: 9,
  source: 'docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-contrast',
};

export function run({ metrics, url }) {
  const samples = Array.isArray(metrics?.lowContrast) ? metrics.lowContrast : [];
  if (!samples.length) return [];
  return [
    {
      severity: 'major',
      area: 'accessibility',
      message: 'Potential low-contrast text was detected.',
      evidence: `${samples.length} samples below expected contrast thresholds.${url ? ` url=${url}` : ''}`,
      remediation: 'Increase foreground/background contrast for text, links, and CTAs.',
    },
  ];
}
