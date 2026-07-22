/**
 * DET.NAVLAYOUT.HASH_ROOT — nav-layout demo roots emit hash markers.
 */

import { ksVisualHashReportFromMetrics } from '../../../lib/visual-catalog.js';

export const rule = {
  id: 'DET.NAVLAYOUT.HASH_ROOT',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'visual-catalog',
  scoreDimension: 'visualCatalogGovernance',
  defaultSeverity: 'minor',
  priorityWeight: 7,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-navlayout-hash_root',
};

const NAVLAYOUT_HASHES = new Set([
  'Ssd', 'Stc', 'Cpb', 'Bdt', 'Mns', 'Mmg', 'Svc', 'Swz', 'Pgt', 'Fcs',
  'Gcb', 'Dst', 'Spr', 'Ajm', 'Tss', 'Sab', 'Cps', 'Bsc', 'Vth', 'Epr',
]);

/**
 * @param {import('../../../lib/metrics-types.js').PageMetrics | undefined} metrics
 */
export function check(metrics) {
  const rep = metrics?.ksVisualHashReport;
  if (!rep?.validUnique?.length) return [];

  const findings = [];
  for (const hash of rep.validUnique) {
    if (!NAVLAYOUT_HASHES.has(hash)) continue;
    const incomplete = (rep.incompleteMarkers || []).filter(
      (m) => m.hash === hash || m.dataKsHash === hash,
    );
    if (incomplete.length) {
      findings.push({
        ruleId: rule.id,
        severity: rule.defaultSeverity,
        message: `Nav-layout hash ${hash} has incomplete marker pairing on page.`,
        evidence: incomplete.slice(0, 3),
      });
    }
  }
  return findings;
}

export function findingsFromNavlayoutHashRoot(metrics, url = '') {
  return check(metrics).map((f) => ({ ...f, url }));
}
