/**
 * DET.A11Y.GENERIC.IMAGES_ALT — visible images should have appropriate alt text.
 */

export const rule = {
  id: 'DET.A11Y.GENERIC.IMAGES_ALT',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'accessibility',
  scope: 'generic',
  defaultSeverity: 'major',
  priorityWeight: 10,
  source: 'docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-images-alt',
};

export function run({ metrics, url }) {
  const missing = Number(metrics?.imagesMissingAlt ?? 0);
  if (missing <= 0) return [];
  return [
    {
      severity: 'major',
      area: 'accessibility',
      message: 'Some visible images are missing alt text.',
      evidence: `${missing} visible images without alt text.${url ? ` url=${url}` : ''}`,
      remediation:
        'Add meaningful alt text for informative images and alt="" for decorative images.',
    },
  ];
}
