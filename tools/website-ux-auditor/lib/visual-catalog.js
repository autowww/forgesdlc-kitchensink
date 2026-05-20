/**
 * KS visual hash catalog helpers for the website UX auditor/scorer.
 * Reads only docs/design/catalog/visual-registry.generated.json (no YAML, no design-catalog runtime deps).
 */

import fs from 'node:fs';
import path from 'node:path';

/**
 * @param {object[]} entries
 * @returns {Map<string, object>}
 */
export function entryByHash(entries) {
  const map = new Map();
  for (const e of entries) {
    if (e?.hash) map.set(String(e.hash), e);
  }
  return map;
}

/**
 * @param {object | null | undefined} entry registry row
 * @returns {string}
 */
export function contractPathFromRegistryEntry(entry) {
  if (!entry || typeof entry !== 'object') return '';
  const c = entry.contract ?? entry.contract_path;
  return c && String(c).trim() ? String(c).trim() : '';
}

/**
 * Resolve design contract paths for 3-letter hashes using generated registry JSON only.
 * @param {string} repoRoot
 * @param {Iterable<string>} hashes
 * @returns {{ hash: string, contract: string, name: string }[]}
 */
export function resolveRegistryContractsForHashes(repoRoot, hashes) {
  const reg = loadGeneratedRegistry(repoRoot);
  const byHash = reg ? entryByHash(reg.entries || []) : new Map();
  const sorted = [...new Set([...hashes].map((h) => String(h || '').trim()).filter((h) => /^[A-Za-z]{3}$/.test(h)))].sort();
  return sorted.map((hash) => {
    const e = byHash.get(hash);
    const contract = e ? contractPathFromRegistryEntry(e) : '';
    const name = e?.name != null ? String(e.name) : '';
    return { hash, contract, name };
  });
}

/**
 * @param {object[] | null | undefined} entries
 * @returns {string[]}
 */
export function registryDuplicateHashes(entries) {
  const counts = new Map();
  for (const e of entries || []) {
    const h = e?.hash && String(e.hash);
    if (!h) continue;
    counts.set(h, (counts.get(h) || 0) + 1);
  }
  return [...counts.entries()].filter(([, n]) => n > 1).map(([h]) => h).sort();
}

/**
 * Metrics from static HTML/repo scan: best-effort hash discovery (no per-element mismatch pairing).
 * @param {string} blob
 * @returns {{
 *   validUnique: string[],
 *   invalidRaw: { value: string, source: string }[],
 *   mismatches: never[],
 *   incompleteMarkers: never[],
 *   instanceCountByHash: Record<string, number>,
 * }}
 */
export function ksVisualHashReportFromHtmlBlob(blob) {
  const text = String(blob || '');
  /** @type {Set<string>} */
  const seen = new Set();
  /** @type {Record<string, number>} */
  const instanceCountByHash = {};

  const bump = (raw) => {
    const v = String(raw || '').trim();
    if (!/^[A-Za-z]{3}$/.test(v)) return;
    seen.add(v);
    instanceCountByHash[v] = (instanceCountByHash[v] || 0) + 1;
  };

  let m;
  const reData = /data-ks-hash\s*=\s*["']([^"']*)["']/gi;
  while ((m = reData.exec(text)) !== null) bump(m[1]);
  const reHash = /(?<![\w-])hash\s*=\s*["']([^"']*)["']/gi;
  while ((m = reHash.exec(text)) !== null) bump(m[1]);

  return {
    validUnique: [...seen].sort(),
    invalidRaw: [],
    mismatches: [],
    incompleteMarkers: [],
    instanceCountByHash,
  };
}

/**
 * @param {Record<string, unknown> | null | undefined} metrics
 * @returns {{
 *   validUnique: string[],
 *   invalidRaw: { value: string, source: string }[],
 *   mismatches: unknown[],
 *   incompleteMarkers: unknown[],
 *   instanceCountByHash: Record<string, number>,
 * }}
 */
export function ksVisualHashReportFromMetrics(metrics) {
  const m = metrics && typeof metrics === 'object' ? metrics : {};
  if (m.ksVisualHashReport && typeof m.ksVisualHashReport === 'object') {
    const r = /** @type {Record<string, unknown>} */ (m.ksVisualHashReport);
    return {
      validUnique: Array.isArray(r.validUnique) ? r.validUnique.map(String) : [],
      invalidRaw: Array.isArray(r.invalidRaw) ? /** @type {{ value: string, source: string }[]} */ (r.invalidRaw) : [],
      mismatches: Array.isArray(r.mismatches) ? r.mismatches : [],
      incompleteMarkers: Array.isArray(r.incompleteMarkers) ? r.incompleteMarkers : [],
      instanceCountByHash:
        r.instanceCountByHash && typeof r.instanceCountByHash === 'object'
          ? /** @type {Record<string, number>} */ (r.instanceCountByHash)
          : {},
    };
  }
  const legacy = Array.isArray(m.ksVisualHashes) ? m.ksVisualHashes : [];
  const instanceCountByHash = {};
  for (const h of legacy) {
    const s = String(h || '');
    if (!/^[A-Za-z]{3}$/.test(s)) continue;
    instanceCountByHash[s] = (instanceCountByHash[s] || 0) + 1;
  }
  return {
    validUnique: [...new Set(Object.keys(instanceCountByHash))].sort(),
    invalidRaw: [],
    mismatches: [],
    incompleteMarkers: [],
    instanceCountByHash,
  };
}

/**
 * Sitewide rollup for scorer JSON/Markdown (uses page metrics only + generated registry).
 * @param {{ url?: string, pageUrl?: string, metrics?: Record<string, unknown> }[]} pages
 * @param {string} repoRoot
 */
export function summarizeVisualCatalogCoverage(pages, repoRoot) {
  const registryPath = generatedRegistryPath(repoRoot);
  const reg = loadGeneratedRegistry(repoRoot);
  const catalogPresent = Boolean(reg);
  const dupReg = catalogPresent ? registryDuplicateHashes(reg.entries || []) : [];
  const byHash = catalogPresent ? entryByHash(reg.entries || []) : new Map();

  /** @type {string[]} */
  const pageUrlsWithHashes = [];
  /** @type {Set<string>} */
  const allHashes = new Set();
  let invalidTotal = 0;
  let mismatchTotal = 0;
  let incompleteTotal = 0;
  /** @type {Set<string>} */
  const dupEmit = new Set();

  for (const p of pages || []) {
    const rep = ksVisualHashReportFromMetrics(p.metrics);
    const hashes = rep.validUnique || [];
    const noisy =
      hashes.length
      || (rep.invalidRaw && rep.invalidRaw.length)
      || (rep.mismatches && rep.mismatches.length)
      || (rep.incompleteMarkers && rep.incompleteMarkers.length);
    if (!noisy) continue;
    if (hashes.length) pageUrlsWithHashes.push(String(p.url || p.pageUrl || ''));
    for (const h of hashes) allHashes.add(h);
    invalidTotal += (rep.invalidRaw || []).length;
    mismatchTotal += (rep.mismatches || []).length;
    incompleteTotal += (rep.incompleteMarkers || []).length;
    for (const [h, c] of Object.entries(rep.instanceCountByHash || {})) {
      if (Number(c) > 1) dupEmit.add(h);
    }
  }

  /** @type {string[]} */
  const known = [];
  /** @type {string[]} */
  const unknown = [];
  /** @type {{ hash: string, contract: string }[]} */
  const knownHashContracts = [];
  for (const h of [...allHashes].sort()) {
    if (byHash.has(h)) {
      known.push(h);
      const e = byHash.get(h);
      const cp = e ? contractPathFromRegistryEntry(e) : '';
      if (cp) knownHashContracts.push({ hash: h, contract: cp });
    } else unknown.push(h);
  }

  const u = allHashes.size;
  return {
    catalogPresent,
    registryPath,
    registryDuplicateHashes: dupReg,
    pagesWithKsMarkers: pageUrlsWithHashes.length,
    uniqueHashesEmitted: u,
    knownHashesEmitted: known,
    knownHashContracts,
    unknownHashesEmitted: unknown,
    duplicateEmittedHashes: [...dupEmit].sort(),
    domInvalidMarkerCount: invalidTotal,
    domMismatchCount: mismatchTotal,
    incompleteMarkerCount: incompleteTotal,
    coverageRatio: u > 0 && catalogPresent ? known.length / u : null,
  };
}

/**
 * @param {string} repoRoot
 * @returns {string}
 */
export function generatedRegistryPath(repoRoot) {
  return path.join(repoRoot, 'docs/design/catalog/visual-registry.generated.json');
}

/**
 * @param {string} repoRoot
 * @returns {{ schemaVersion?: number, repoRoot?: string, entries?: object[] } | null}
 */
export function loadGeneratedRegistry(repoRoot) {
  const p = generatedRegistryPath(repoRoot);
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
}
