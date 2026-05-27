/**
 * Shared helpers for A11Y deterministic page checks.
 */

/**
 * @param {{ page?: import('playwright').Page | null }} ctx
 */
export function requirePage(ctx) {
  return ctx?.page || null;
}

/**
 * @param {object[]} findings
 * @param {string} [url]
 */
export function withUrl(findings, url) {
  if (!url) return findings;
  return findings.map((f) => ({
    ...f,
    evidence: f.evidence ? `${f.evidence} url=${url}` : `url=${url}`,
  }));
}
