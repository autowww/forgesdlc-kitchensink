export const rule = {
  id: 'DET.PAGE.LANG',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'accessibility',
  scoreDimension: 'accessibilitySemanticsMeta',
  defaultSeverity: 'minor',
  priorityWeight: 10,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-page-lang',
};

export function run({ metrics }) {
  if (metrics?.lang) return [];
  return [
    {
      severity: 'minor',
      area: 'accessibility',
      message: 'The document lang attribute is missing.',
      evidence: '<html lang> not found.',
      remediation: 'Set the root language, usually <html lang="en">.',
    },
  ];
}
