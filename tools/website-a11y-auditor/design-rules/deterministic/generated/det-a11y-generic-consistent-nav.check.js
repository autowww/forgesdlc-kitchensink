export const rule = {
  id: 'DET.A11Y.GENERIC.CONSISTENT_NAV',
  lane: 'deterministic',
  area: 'accessibility',
  defaultSeverity: 'warn',
  priorityWeight: 8,
  source: 'docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-consistent-nav',
};

/**
 * @param {{ pages?: Array<{ url?: string, navSample?: { navLabel?: string, linkPaths?: string[] } }> }} ctx
 */
export async function runSitewide(ctx) {
  const pages = (ctx.pages || []).filter((p) => (p.navSample?.linkPaths || []).length > 0);
  if (pages.length < 2) return [];

  const findings = [];
  const labelByUrl = new Map();
  const pathSets = [];

  for (const p of pages) {
    const sample = p.navSample || {};
    labelByUrl.set(p.url || '', sample.navLabel || '');
    pathSets.push({ url: p.url, paths: (sample.linkPaths || []).join('|') });
  }

  const labels = [...new Set(labelByUrl.values())].filter(Boolean);
  if (labels.length > 1) {
    findings.push({
      severity: 'warn',
      area: 'accessibility',
      message:
        'Primary navigation landmark uses different labels across pages (WCAG 3.2.3 heuristic).',
      evidence: [...labelByUrl.entries()]
        .slice(0, 4)
        .map(([u, l]) => `${u}="${l}"`)
        .join('; '),
      remediation: 'Use the same aria-label or visible title for the main nav on every page.',
    });
  }

  const baseline = pathSets[0].paths;
  const mismatches = pathSets.filter((s) => s.paths !== baseline);
  if (mismatches.length > 0 && mismatches.length < pathSets.length) {
    findings.push({
      severity: 'warn',
      area: 'accessibility',
      message:
        'Primary navigation link sets differ across pages — verify consistent navigation (3.2.3).',
      evidence: `baseline=${pathSets[0].url} differs on ${mismatches.length} page(s)`,
      remediation: 'Keep main nav items and order consistent unless the user is in a step flow.',
    });
  }

  return findings.slice(0, 4);
}

export async function run() {
  return [];
}
