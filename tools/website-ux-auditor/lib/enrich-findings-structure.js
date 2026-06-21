/**
 * Attach signatureId / structureNodeId to findings from page structure + rule metadata.
 */

const HASH_RE = /^[A-Za-z]{3}$/;

/**
 * @param {object} finding
 * @param {object | null | undefined} pageStructure
 * @param {string} pageUrl
 */
export function enrichFindingStructure(finding, pageStructure, pageUrl) {
  if (!finding || typeof finding !== 'object') return finding;

  const hash =
    finding.hash != null && HASH_RE.test(String(finding.hash).trim())
      ? String(finding.hash).trim()
      : null;

  let signatureId = finding.signatureId || null;
  let structureNodeId = finding.structureNodeId || null;
  let taxonomyLevel = finding.taxonomyLevel || null;

  if (hash && pageStructure?.instances) {
    const match = pageStructure.instances.find((i) => i.hash === hash);
    if (match) {
      signatureId = signatureId || match.signatureId;
      structureNodeId = structureNodeId || match.nodeId;
      taxonomyLevel = taxonomyLevel || match.taxonomyLevel;
    }
  }

  if (!signatureId && hash) {
    signatureId = `cmp:hash:${hash}`;
  }

  if (!signatureId && pageStructure?.layout?.id && (finding.area === 'navigation' || finding.checkId?.includes('nav'))) {
    signatureId = `layout:${pageStructure.layout.id}`;
    taxonomyLevel = taxonomyLevel || 'chrome-regions';
  }

  if (!signatureId && pageStructure?.pageType?.id) {
    const pt = pageStructure.pageType.id;
    if (finding.checkId === 'homepage-shell' || finding.area === 'first-screen') {
      signatureId = `pageType:${pt}`;
      taxonomyLevel = taxonomyLevel || 'page-types';
    }
  }

  const out = { ...finding };
  if (signatureId) out.signatureId = signatureId;
  if (structureNodeId) out.structureNodeId = structureNodeId;
  if (taxonomyLevel) out.taxonomyLevel = taxonomyLevel;
  if (!out.url && pageUrl) out.url = pageUrl;
  return out;
}

/**
 * @param {Array<{ url?: string, structure?: object, findings?: object[] }>} pages
 */
export function enrichPagesFindingsStructure(pages) {
  return (pages || []).map((page) => ({
    ...page,
    findings: (page.findings || []).map((f) => enrichFindingStructure(f, page.structure, page.url)),
  }));
}
