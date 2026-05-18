/**
 * Severity ladder for Forge Website UX Auditor (schema v2).
 * Blocker … Cosmetic — lower rank() = worse on the UX scale.
 */

export const SEVERITY_LEVELS = ['blocker', 'critical', 'major', 'warn', 'minor', 'trivial', 'cosmetic'];

/** Stable sort: worse severities first, then URL, message. */
export function severityRank(level) {
  const i = SEVERITY_LEVELS.indexOf(String(level || '').toLowerCase());
  return i >= 0 ? i : SEVERITY_LEVELS.length;
}

/** True if severity is Blocker, Critical, or Major (early-stop batch). */
export function isMajorPlus(level) {
  return severityRank(level) <= 2;
}

/**
 * Map schema v2 → legacy bucket for consumers still on high/medium/low.
 */
export function legacySeverityFrom(level) {
  const r = severityRank(level);
  if (r <= 1) return 'high';
  if (r <= 4) return 'medium';
  return 'low';
}

export const SCORE_WEIGHTS = {
  blocker: 55,
  critical: 34,
  major: 20,
  warn: 14,
  minor: 8,
  trivial: 4,
  cosmetic: 2,
};

/**
 * Add legacySeverity when creating a normalized finding entry.
 */
export function makeFinding(fields) {
  const sev = String(fields.severity || 'major').toLowerCase();
  return {
    ...fields,
    severity: sev,
    legacySeverity: legacySeverityFrom(sev),
  };
}

/** Compare findings for descending severity (worst first). */
export function compareFindingSeverity(a, b) {
  const d = severityRank(a.severity) - severityRank(b.severity);
  if (d !== 0) return d;
  return String(a.url || '').localeCompare(String(b.url || ''));
}

export function summarizeBySeverity(findingsFlat) {
  const bySeverity = {};
  for (const f of findingsFlat) {
    const k = f.severity || 'major';
    bySeverity[k] = (bySeverity[k] || 0) + 1;
  }
  return bySeverity;
}

/** Count blocker + critical + major. */
export function countMajorPlus(findings) {
  return (findings || []).filter((f) => isMajorPlus(f.severity)).length;
}

export function severityDefinitionsMarkdownTable() {
  return `| Level | Meaning |
|-------|---------|
| **Blocker** | Would likely block enterprise review on a key landing page — script uses sparingly when heuristics show a catastrophic miss (story/hero failure). |
| **Critical** | Severe deviation: first-screen/hero violations, dense technical content above fold, missing CTA hierarchy, absent trust framing. |
| **Major** | Clear standard violation: overcrowded nav, too many competing CTAs, weak ecosystem/trust cues, readability or visible a11y/metadata issues. |
| **Warn** | Catalog alignment, governance, or policy nits that should be fixed but are unlikely to block a release alone (e.g. unknown or mismatched KS visual hash markers). |
| **Minor** | Noticeable polish or IA friction without breaking comprehension. |
| **Trivial** | Low-impact inconsistency. |
| **Cosmetic** | Visual/spatial nits; usually deferred to human judgement. |
`;
}
