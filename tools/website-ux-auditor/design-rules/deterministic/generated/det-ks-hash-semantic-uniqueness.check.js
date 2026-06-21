/**
 * DET.KS.HASH_SEMANTIC_UNIQUENESS — one hash must not map to unrelated data-ks-type/name anatomy.
 */

import {
  buildHashSemanticUniquenessReport,
  collectHashInstancesForSemantics,
  hasKsDomSignal,
  ksGovernanceEnabled,
} from '../../../lib/ks-governance.js';
import { ksVisualHashReportFromMetrics } from '../../../lib/visual-catalog.js';

export const MAX_KS_HASH_SEMANTIC_FINDINGS = 8;

export const rule = {
  id: 'DET.KS.HASH_SEMANTIC_UNIQUENESS',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'visual-catalog',
  scoreDimension: 'visualCatalogGovernance',
  defaultSeverity: 'warn',
  priorityWeight: 8,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-ks-hash-semantic-uniqueness',
};

/**
 * @param {{ violations?: Array<Record<string, unknown>> }} report
 * @param {string} [url]
 */
export function findingsFromHashSemanticReport(report, url = '') {
  const violations = Array.isArray(report?.violations) ? report.violations : [];
  if (!violations.length) return [];

  return violations.slice(0, MAX_KS_HASH_SEMANTIC_FINDINGS).map((v) => ({
    severity: 'warn',
    area: 'visual-catalog',
    hash: String(v.hash || ''),
    selector: v.hash ? `[data-ks-hash="${v.hash}"]` : undefined,
    message: `Hash ${v.hash} is reused for unrelated surface anatomy (${(v.semantics || []).join('; ')}).`,
    evidence: url ? `DOM on ${url}` : 'DOM/build output',
    remediation:
      'Allocate a distinct three-letter hash per visual surface, or document intentional reuse in the catalog contract.',
  }));
}

function instancesFromMetrics(metrics) {
  const rep = ksVisualHashReportFromMetrics(metrics);
  if (Array.isArray(rep.instances) && rep.instances.length) {
    return rep.instances.map((row) => ({
      hash: String(row?.hash || ''),
      dataKsType: String(row?.dataKsType || ''),
      dataKsName: String(row?.dataKsName || ''),
    }));
  }
  return [];
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

  let instances = metrics?.ksHashSemanticReport?.instances;
  if (!instances?.length) instances = instancesFromMetrics(metrics);
  if ((!instances || !instances.length) && page) {
    instances = await collectHashInstancesForSemantics(page);
  }
  if (!instances?.length && !hasKsDomSignal(metrics)) return [];

  const report = metrics?.ksHashSemanticReport?.violations
    ? metrics.ksHashSemanticReport
    : buildHashSemanticUniquenessReport(instances);

  return findingsFromHashSemanticReport(report, url || metrics?.url || '');
}
