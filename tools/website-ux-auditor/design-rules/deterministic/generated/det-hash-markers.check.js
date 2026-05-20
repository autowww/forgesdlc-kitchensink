/**
 * DET.HASH.MARKERS — each emitted visual root has hash="XYZ" and data-ks-hash="XYZ"
 * (three ASCII letters). Registry crosswalk is DET.HASH.REGISTRY_ROW.
 */

import { ksVisualHashReportFromMetrics } from '../../../lib/visual-catalog.js';

/** Cap findings per page pass (DOM marker scan). */
export const MAX_HASH_MARKER_FINDINGS = 10;

export const rule = {
  id: 'DET.HASH.MARKERS',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'visual-catalog',
  scoreDimension: 'visualCatalogGovernance',
  defaultSeverity: 'minor',
  priorityWeight: 9,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-hash-markers',
};

/**
 * @param {{
 *   validUnique?: string[],
 *   invalidRaw?: { value: string, source: string }[],
 *   mismatches?: { hashAttr: string, dataKsHash: string, tag: string }[],
 *   incompleteMarkers?: { side: string, tag: string, hash?: string, dataKsHash?: string }[],
 *   instanceCountByHash?: Record<string, number>,
 * } | null | undefined} rep
 * @param {string} [url]
 */
export function findingsFromHashMarkersReport(rep, url = '') {
  if (!rep) return [];

  const hasDomSignal =
    (rep.validUnique && rep.validUnique.length)
    || (rep.invalidRaw && rep.invalidRaw.length)
    || (rep.mismatches && rep.mismatches.length)
    || (rep.incompleteMarkers && rep.incompleteMarkers.length);

  if (!hasDomSignal) return [];

  /** @type {object[]} */
  const findings = [];
  const seen = new Set();

  const push = (finding) => {
    const key = `${finding.severity}:${finding.message}:${finding.evidence}`;
    if (seen.has(key)) return;
    seen.add(key);
    if (findings.length >= MAX_HASH_MARKER_FINDINGS) return;
    findings.push(finding);
  };

  for (const inv of rep.invalidRaw || []) {
    push({
      severity: 'minor',
      area: 'visual-catalog',
      message: `Invalid KS visual hash marker value "${inv.value}" (${inv.source}) — expected exactly three ASCII letters.`,
      evidence: url
        ? `${inv.source} attribute on rendered DOM (${url})`
        : `${inv.source} attribute on rendered DOM`,
      remediation:
        'Use a three-letter Forge Kitchen Sink hash registered in the design catalog, or remove stray markers.',
    });
  }

  for (const mm of rep.mismatches || []) {
    push({
      severity: 'minor',
      area: 'visual-catalog',
      hash: mm.dataKsHash,
      selector: `[data-ks-hash="${mm.dataKsHash}"]`,
      message: `hash="${mm.hashAttr}" and data-ks-hash="${mm.dataKsHash}" disagree on the same <${mm.tag}> node.`,
      evidence: 'Mismatched governed hash attributes on one element',
      remediation:
        'Emit the same three-letter hash in both `hash="XYZ"` and `data-ks-hash="XYZ"` on each visual root.',
    });
  }

  for (const inc of rep.incompleteMarkers || []) {
    const h = inc.hash || inc.dataKsHash || '';
    push({
      severity: 'warn',
      area: 'visual-catalog',
      hash: String(h),
      selector: h ? `[data-ks-hash="${h}"]` : undefined,
      message:
        inc.side === 'hash-missing'
          ? `data-ks-hash present without matching hash= on <${inc.tag}> (expected both attributes).`
          : `hash= present without data-ks-hash on <${inc.tag}> (expected both attributes).`,
      evidence: url ? `Partial KS marker pair on ${url}` : 'Partial KS marker pair on rendered DOM',
      remediation:
        'Add both `hash="XYZ"` and `data-ks-hash="XYZ"` on governed visual roots per KS visual catalog rules.',
    });
  }

  for (const [h, c] of Object.entries(rep.instanceCountByHash || {})) {
    if (Number(c) <= 1) continue;
    push({
      severity: 'warn',
      area: 'visual-catalog',
      hash: h,
      selector: `[data-ks-hash="${h}"]`,
      message: `KS visual hash ${h} appears on ${c} elements — verify this is intentional for reusable surfaces.`,
      evidence: `instanceCountByHash[${h}]=${c} in DOM scan`,
      remediation:
        'If multiple instances are unintended duplicates, dedupe visual roots; otherwise document repeated use in the catalog contract.',
    });
  }

  const totalIssues =
    (rep.invalidRaw?.length || 0)
    + (rep.mismatches?.length || 0)
    + (rep.incompleteMarkers?.length || 0)
    + Object.values(rep.instanceCountByHash || {}).filter((c) => Number(c) > 1).length;

  if (totalIssues > MAX_HASH_MARKER_FINDINGS && findings.length >= MAX_HASH_MARKER_FINDINGS) {
    findings.push({
      severity: 'minor',
      area: 'visual-catalog',
      message: `Additional hash marker issues omitted (${totalIssues - MAX_HASH_MARKER_FINDINGS} more).`,
      evidence: `hash_marker_issue_total=${totalIssues}`,
      remediation: 'Re-run analyze with verbose DOM metrics or inspect raw HTML for every [data-ks-hash] / [hash] node.',
    });
  }

  return findings;
}

export async function run({ metrics, url }) {
  const rep = ksVisualHashReportFromMetrics(metrics);
  const pageUrl = url || metrics?.url || '';
  return findingsFromHashMarkersReport(rep, pageUrl);
}
