export const rule = {
  id: 'DET.A11Y.GENERIC.CONSISTENT_LABELS',
  lane: 'deterministic',
  area: 'accessibility',
  defaultSeverity: 'warn',
  priorityWeight: 8,
  source: 'docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-consistent-labels',
};

/**
 * Sitewide rule — invoked via runSitewide, not per-page run().
 * @param {{ pages?: Array<{ url?: string, labelSamples?: Array<{ key: string, label: string }> }> }} ctx
 */
export async function runSitewide(ctx) {
  const pages = ctx.pages || [];
  if (pages.length < 2) return [];

  /** @type {Map<string, Map<string, string>>} */
  const byKey = new Map();

  for (const p of pages) {
    const url = p.url || '';
    for (const { key, label } of p.labelSamples || []) {
      if (!byKey.has(key)) byKey.set(key, new Map());
      byKey.get(key).set(url, label);
    }
  }

  const findings = [];
  for (const [key, urlLabels] of byKey) {
    const labels = [...new Set(urlLabels.values())];
    if (labels.length <= 1) continue;
    const examples = [...urlLabels.entries()]
      .slice(0, 4)
      .map(([u, l]) => `${u}="${l}"`)
      .join('; ');
    findings.push({
      severity: 'warn',
      area: 'accessibility',
      message:
        'The same functional component uses different labels across pages — verify WCAG 3.2.4 consistent identification.',
      evidence: `key=${key} labels=${labels.join(' | ')} ${examples}`,
      remediation:
        'Use the same visible name or aria-label for components that perform the same function across pages.',
    });
    if (findings.length >= 8) break;
  }

  return findings;
}

/** Per-page run is a no-op; crawl invokes runSitewide. */
export async function run() {
  return [];
}
