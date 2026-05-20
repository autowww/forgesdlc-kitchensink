export const rule = {
  id: 'DET.PAGE.VIEWPORT',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'accessibility',
  scoreDimension: 'accessibilitySemanticsMeta',
  defaultSeverity: 'minor',
  priorityWeight: 8,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-page-viewport',
};

export function run({ metrics }) {
  const viewport = String(metrics?.metaViewport || '').trim();
  if (viewport) return [];
  return [
    {
      severity: 'minor',
      area: 'accessibility',
      message: 'Responsive viewport meta tag is missing.',
      evidence: '<meta name="viewport"> not found.',
      remediation: 'Add `<meta name="viewport" content="width=device-width, initial-scale=1">`.',
    },
  ];
}
