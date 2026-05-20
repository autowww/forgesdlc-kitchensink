export const rule = {
  id: 'DET.PAGE.TITLE',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'metadata',
  scoreDimension: 'accessibilitySemanticsMeta',
  defaultSeverity: 'minor',
  priorityWeight: 8,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-page-title',
};

const GENERIC_TITLES = new Set(['index', 'home', 'document', 'page']);

export function run({ metrics }) {
  const title = String(metrics?.title || '').trim();
  if (!title) {
    return [
      {
        severity: 'major',
        area: 'metadata',
        message: 'Page title is missing.',
        evidence: '<title> is empty or absent.',
        remediation: 'Set a specific <title> for the page.',
      },
    ];
  }
  if (GENERIC_TITLES.has(title.toLowerCase())) {
    return [
      {
        severity: 'minor',
        area: 'metadata',
        message: 'Page title is too generic.',
        evidence: `Title: "${title}"`,
        remediation: 'Use a descriptive, non-placeholder title.',
      },
    ];
  }
  return [];
}
