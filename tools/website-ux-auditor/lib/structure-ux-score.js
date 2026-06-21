/**
 * Roll up UX finding damage by structure node (signature, layout, page type, URL).
 */

import { AREA_TO_DESIGN_DIMENSION } from './design-dimensions.js';
import { SCORE_WEIGHTS } from './severity.js';

function damageForFinding(f) {
  const w = SCORE_WEIGHTS[String(f?.severity || '').toLowerCase()];
  const base = Number.isFinite(w) ? w : SCORE_WEIGHTS.minor;
  return base + Math.max(0, Number(f?.priorityWeight || 0));
}

function bumpBucket(map, key, finding) {
  if (!key) return;
  if (!map.has(key)) {
    map.set(key, { rawDamage: 0, findingCount: 0, bySeverity: {} });
  }
  const b = map.get(key);
  const sev = String(finding.severity || 'major').toLowerCase();
  b.rawDamage += damageForFinding(finding);
  b.findingCount += 1;
  b.bySeverity[sev] = (b.bySeverity[sev] || 0) + 1;
}

function mapToSortedObject(map, limit = 50) {
  return [...map.entries()]
    .sort((a, b) => b[1].rawDamage - a[1].rawDamage || b[1].findingCount - a[1].findingCount)
    .slice(0, limit)
    .map(([id, stats]) => ({ id, ...stats }));
}

/**
 * @param {Array<{ url?: string, findings?: object[], structure?: object }>} pages
 */
export function computeStructureScores(pages) {
  /** @type {Map<string, object>} */
  const bySignature = new Map();
  /** @type {Map<string, object>} */
  const byLayout = new Map();
  /** @type {Map<string, object>} */
  const byPageType = new Map();
  /** @type {Map<string, object>} */
  const byUrl = new Map();

  for (const page of pages || []) {
    const url = page?.url || '';
    const structure = page?.structure || {};
    const layoutId = structure.layout?.id || 'unknown';
    const pageTypeId = structure.pageType?.id || 'generic';

    for (const finding of page.findings || []) {
      const area = finding.area || '';
      if (area === 'inventory' || area === 'site-inspection') continue;

      const sig =
        finding.signatureId ||
        (finding.hash && /^[A-Za-z]{3}$/.test(String(finding.hash))
          ? `cmp:hash:${finding.hash}`
          : null);

      if (sig) bumpBucket(bySignature, sig, finding);
      bumpBucket(byLayout, layoutId, finding);
      bumpBucket(byPageType, pageTypeId, finding);
      if (url) bumpBucket(byUrl, url, finding);

      const dim = finding.scoreDimension || AREA_TO_DESIGN_DIMENSION[area];
      if (dim && sig) {
        const b = bySignature.get(sig);
        if (b) {
          b.mainDimension = b.mainDimension || dim;
        }
      }
    }
  }

  return {
    version: 1,
    bySignature: mapToSortedObject(bySignature, 40),
    byLayout: mapToSortedObject(byLayout, 20),
    byPageType: mapToSortedObject(byPageType, 15),
    byUrl: mapToSortedObject(byUrl, 30),
  };
}
