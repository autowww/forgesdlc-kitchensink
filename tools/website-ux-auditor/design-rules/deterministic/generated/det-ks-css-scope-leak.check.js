/**
 * DET.KS.CSS_SCOPE_LEAK — KS theme CSS must not break host app controls outside governed roots (live).
 */

import {
  collectCssScopeLeakReport,
  hasKsDomSignal,
  ksGovernanceEnabled,
} from '../../../lib/ks-governance.js';

export const MAX_KS_CSS_SCOPE_LEAK_FINDINGS = 5;

export const rule = {
  id: 'DET.KS.CSS_SCOPE_LEAK',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'visual-catalog',
  scoreDimension: 'visualCatalogGovernance',
  defaultSeverity: 'warn',
  priorityWeight: 7,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-ks-css-scope-leak',
};

/**
 * @param {{ skipped?: boolean, skipReason?: string, violations?: Array<Record<string, unknown>> }} report
 * @param {string} [url]
 */
export function findingsFromCssScopeLeakReport(report, url = '') {
  if (!report) return [];
  if (report.skipped && report.skipReason === 'static-mode') {
    return [];
  }
  const violations = Array.isArray(report.violations) ? report.violations : [];
  if (!violations.length) return [];

  return violations.slice(0, MAX_KS_CSS_SCOPE_LEAK_FINDINGS).map((v) => ({
    severity: 'warn',
    area: 'visual-catalog',
    message:
      v.kind === 'host-control-faded'
        ? 'KS theme styles appear to fade a host-app control outside KS roots.'
        : 'KS theme background styles appear on a host-app control outside KS roots.',
    evidence: `probe=${v.probe} url=${url || ''}`,
    remediation:
      'Scope KS theme imports to KS mount roots or use shadow DOM/CSS layers so host native controls keep their own design system.',
  }));
}

export async function run({ metrics, url, page, repoRoot, ctx }) {
  if (
    !ksGovernanceEnabled({
      rulesScopeResolved: ctx?.rulesScopeResolved,
      metrics,
      repoRoot: String(repoRoot || ctx?.repoRoot || ''),
    })
  ) {
    return [];
  }

  if (!page) {
    if (!hasKsDomSignal(metrics)) return [];
    return [];
  }

  const report = metrics?.ksCssScopeLeakReport || (await collectCssScopeLeakReport(page));
  return findingsFromCssScopeLeakReport(report, url || metrics?.url || '');
}
