/**
 * DET.KS.VISUAL_FAMILY_COVERAGE — consumer-bound registry rows need contracts (own or family-covered).
 */

import { buildVisualFamilyCoverageReport, ksGovernanceEnabled } from '../../../lib/ks-governance.js';

export const MAX_KS_VISUAL_FAMILY_COVERAGE_FINDINGS = 12;

export const rule = {
  id: 'DET.KS.VISUAL_FAMILY_COVERAGE',
  lane: 'deterministic',
  phase: 'repo',
  area: 'visual-catalog',
  scoreDimension: 'visualCatalogGovernance',
  defaultSeverity: 'warn',
  priorityWeight: 8,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-ks-visual-family-coverage',
};

/**
 * @param {{ skipped?: boolean, violations?: Array<Record<string, unknown>> }} report
 */
export function findingsFromVisualFamilyCoverageReport(report) {
  if (!report || report.skipped) return [];
  const violations = Array.isArray(report.violations) ? report.violations : [];
  if (!violations.length) return [];

  return violations.slice(0, MAX_KS_VISUAL_FAMILY_COVERAGE_FINDINGS).map((v) => {
    const hash = String(v.hash || '');
    const kind = String(v.kind || '');
    let message = `Registry hash ${hash} lacks required visual-family contract coverage.`;
    if (kind === 'contract-file-missing') {
      message = `Hash ${hash} references missing contract file ${v.contract}.`;
    } else if (kind === 'missing-contract-path') {
      message = `Consumer-bound hash ${hash} (${v.type}) has no contract path and is not family-covered.`;
    }
    return {
      severity: 'warn',
      area: 'visual-catalog',
      hash: hash || undefined,
      message,
      evidence: `kind=${kind}`,
      remediation:
        'Add an own contract under docs/design/catalog/ or mark family-covered with a justified family contract in visual-registry.yaml.',
    };
  });
}

export async function run({ metrics, repoRoot, ctx }) {
  const root = String(repoRoot || ctx?.repoRoot || metrics?.repoRoot || '').trim();
  if (!root) return [];
  if (
    !ksGovernanceEnabled({
      rulesScopeResolved: ctx?.rulesScopeResolved,
      metrics,
      repoRoot: root,
    })
  ) {
    return [];
  }

  const report = metrics?.ksVisualFamilyCoverageReport || buildVisualFamilyCoverageReport(root);
  return findingsFromVisualFamilyCoverageReport(report);
}
