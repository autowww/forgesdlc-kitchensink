/**
 * DET.SPATIAL.HASH_ROOT — spatial demo roots on showcase emit hash markers.
 */

import { ksVisualHashReportFromMetrics } from '../../../lib/visual-catalog.js';

export const rule = {
  id: 'DET.SPATIAL.HASH_ROOT',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'visual-catalog',
  scoreDimension: 'visualCatalogGovernance',
  defaultSeverity: 'minor',
  priorityWeight: 7,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-spatial-hash_root',
};

const SPATIAL_HASHES = new Set([
  'Flp', 'Tlz', 'Hol', 'Zzg', 'Dpt', 'Cgb', 'Vsw', 'Rng', 'Fch', 'Hbd',
  'Mpx', 'Cbg', 'Dcb', 'Tun', 'Pst', 'Iso', 'Flh', 'Dil', 'Nsw', 'Srl',
]);

/**
 * @param {import('../../../lib/metrics-types.js').PageMetrics | undefined} metrics
 */
export function check(metrics) {
  const rep = metrics?.ksVisualHashReport;
  if (!rep?.validUnique?.length) return [];

  const findings = [];
  for (const hash of rep.validUnique) {
    if (!SPATIAL_HASHES.has(hash)) continue;
    const incomplete = (rep.incompleteMarkers || []).filter((m) => m.hash === hash || m.dataKsHash === hash);
    if (incomplete.length) {
      findings.push({
        ruleId: rule.id,
        severity: rule.defaultSeverity,
        message: `Spatial hash ${hash} has incomplete marker pairing on page.`,
        evidence: incomplete.slice(0, 3),
      });
    }
  }
  return findings;
}

export function findingsFromSpatialHashRoot(metrics, url = '') {
  return check(metrics).map((f) => ({ ...f, url }));
}
