/**
 * @param {string} evidence
 * @returns {Record<string, string>}
 */
export function parseEvidenceKv(evidence) {
  /** @type {Record<string, string>} */
  const out = {};
  const text = String(evidence || '');
  for (const part of text.split(/\s+/)) {
    const eq = part.indexOf('=');
    if (eq <= 0) continue;
    const key = part.slice(0, eq);
    let val = part.slice(eq + 1);
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    out[key] = val;
  }
  return out;
}

/**
 * @param {object} finding
 */
export function parseContractFromFinding(finding) {
  const kv = parseEvidenceKv(finding?.evidence || '');
  if (kv.contract) return kv.contract.replace(/\\/g, '/');
  const m = String(finding?.message || '').match(/contract\s+([^\s]+\.md)/i);
  return m ? m[1] : '';
}

/**
 * @param {object} finding
 */
export function parseHashFromFinding(finding) {
  const kv = parseEvidenceKv(finding?.evidence || '');
  if (kv.hash) return kv.hash;
  const m = String(finding?.message || '').match(/\b([A-Za-z]{3})\b/);
  return m ? m[1] : '';
}

/**
 * @param {object} finding
 */
export function parsePathFromFinding(finding) {
  const kv = parseEvidenceKv(finding?.evidence || '');
  if (kv.path) return kv.path.replace(/\\/g, '/');
  const m = String(finding?.message || '').match(/\b(components|generator|forge-autodoc|css)\/[^\s,)]+/);
  return m ? m[0] : '';
}

/**
 * @param {object} finding
 */
export function parseHexFromFinding(finding) {
  const kv = parseEvidenceKv(finding?.evidence || '');
  if (kv.hex) return kv.hex;
  const m = String(finding?.message || '').match(/#([0-9a-fA-F]{3,8})\b/);
  return m ? `#${m[1]}` : '';
}
