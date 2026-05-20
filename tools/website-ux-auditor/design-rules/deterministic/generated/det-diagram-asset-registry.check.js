/**
 * DET.DIAGRAM.ASSET_REGISTRY — diagram template keys and shipped SVG assets must be
 * registered under catalog diagram-family / diagram-asset-group rows when surfaced to consumers.
 */

import fs from 'node:fs';
import path from 'node:path';

import { loadGeneratedRegistry } from '../../../lib/visual-catalog.js';

/** Cap findings per audit pass. */
export const MAX_DIAGRAM_ASSET_REGISTRY_FINDINGS = 12;

const DIAGRAM_REGISTRY_TYPES = new Set(['diagram-family', 'diagram-asset-group']);

export const rule = {
  id: 'DET.DIAGRAM.ASSET_REGISTRY',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'visual-catalog',
  scoreDimension: 'visualCatalogGovernance',
  defaultSeverity: 'warn',
  priorityWeight: 7,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-diagram-asset-registry',
};

/**
 * @param {object[]} entries
 * @returns {Set<string>}
 */
export function diagramRegistrySvgPaths(entries) {
  const paths = new Set();
  for (const e of entries || []) {
    if (String(e?.status || '').toLowerCase() !== 'active') continue;
    if (!DIAGRAM_REGISTRY_TYPES.has(String(e?.type || ''))) continue;
    for (const p of e.source_paths || []) {
      paths.add(String(p).replace(/\\/g, '/'));
    }
  }
  return paths;
}

/**
 * @param {string} text
 * @returns {Set<string>}
 */
export function parseDiagramCatalogKeysFromJs(text) {
  const keys = new Set();
  const re = /^\s{4}([a-z][a-z0-9]*)\s*:\s*\{/gm;
  let m;
  while ((m = re.exec(String(text || ''))) !== null) keys.add(m[1]);
  return keys;
}

/**
 * @param {string} text
 * @returns {Map<string, string>}
 */
export function parseDiagramGalleryKeyToSvg(text) {
  const map = new Map();
  const re = /"key":\s*"([^"]+)"[\s\S]*?"svg":\s*"([^"]+)"/g;
  let m;
  while ((m = re.exec(String(text || ''))) !== null) map.set(m[1], m[2]);
  return map;
}

/**
 * @param {string} repoRoot
 * @returns {Set<string> | null}
 */
export function loadDiagramCatalogKeys(repoRoot) {
  const p = path.join(repoRoot, 'js/ks-diagram-catalog.js');
  if (!fs.existsSync(p)) return null;
  try {
    return parseDiagramCatalogKeysFromJs(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
}

/**
 * @param {string} repoRoot
 * @returns {Map<string, string> | null}
 */
export function loadDiagramGalleryKeyToSvg(repoRoot) {
  const p = path.join(repoRoot, 'generator/pages/_diagram_gallery.py');
  if (!fs.existsSync(p)) return null;
  try {
    return parseDiagramGalleryKeyToSvg(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
}

/**
 * Normalize a shipped diagram SVG path for registry comparison.
 * @param {string} src
 * @returns {string}
 */
export function normalizeShippedSvgPath(src) {
  let raw = String(src || '').trim();
  if (!raw || raw.startsWith('data:')) return '';
  if (/^https?:/i.test(raw)) {
    try {
      raw = new URL(raw).pathname;
    } catch {
      return '';
    }
  }
  raw = raw.replace(/^\/+/, '');
  if (!raw.includes('assets/svg/') && !raw.startsWith('assets/svg/')) {
    const idx = raw.indexOf('assets/svg/');
    if (idx >= 0) raw = raw.slice(idx);
    else return '';
  }
  if (!raw.startsWith('assets/')) return '';
  return raw.replace(/\\/g, '/');
}

/**
 * Repo scan: catalog keys and gallery SVGs vs visual-registry diagram rows.
 * @param {string} repoRoot
 */
export function scanRepoDiagramAssetRegistry(repoRoot) {
  const reg = loadGeneratedRegistry(repoRoot);
  if (!reg?.entries?.length) {
    return { skipped: true, reason: 'no-registry', issues: [] };
  }

  const entries = reg.entries;
  const svgPaths = diagramRegistrySvgPaths(entries);
  const hasFamily = entries.some(
    (e) => String(e?.status || '').toLowerCase() === 'active' && String(e?.type || '') === 'diagram-family',
  );

  /** @type {Array<Record<string, unknown>>} */
  const issues = [];

  if (!hasFamily) {
    issues.push({
      kind: 'missing-diagram-family',
      message:
        'Visual registry has no active diagram-family row — diagram assets shipped to consumers must roll up under a catalog diagram family (e.g. Ksv).',
    });
  }

  const catalogKeys = loadDiagramCatalogKeys(repoRoot);
  const galleryMap = loadDiagramGalleryKeyToSvg(repoRoot);

  if (catalogKeys && galleryMap) {
    for (const key of [...catalogKeys].sort()) {
      if (!galleryMap.has(key)) {
        issues.push({
          kind: 'catalog-key-unmapped',
          key,
          message: `Diagram catalog key "${key}" in js/ks-diagram-catalog.js is not mapped to a template SVG in generator/pages/_diagram_gallery.py.`,
        });
      }
    }

    for (const [key, filename] of [...galleryMap.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
      const rel = `assets/svg/${filename}`;
      if (!svgPaths.has(rel)) {
        issues.push({
          kind: 'gallery-svg-not-registered',
          key,
          svg: rel,
          message: `Template SVG ${rel} for catalog key "${key}" is not listed on any active diagram-family or diagram-asset-group registry source_paths row.`,
        });
      }
    }
  }

  issues.sort((a, b) => String(a.message).localeCompare(String(b.message)));

  return {
    skipped: false,
    diagramFamilyPresent: hasFamily,
    registeredSvgPathCount: svgPaths.size,
    catalogKeyCount: catalogKeys ? catalogKeys.size : null,
    galleryItemCount: galleryMap ? galleryMap.size : null,
    issues,
  };
}

/**
 * @param {{
 *   diagramKeys?: string[],
 *   svgPaths?: string[],
 *   pageCatalogKeys?: string[],
 * }} domReport
 * @param {{ validKeys?: Set<string> | null, registeredSvgs?: Set<string> | null }} baseline
 */
export function analyzeDomDiagramAssets(domReport, baseline = {}) {
  const { validKeys = null, registeredSvgs = null } = baseline;
  const keysOnPage = Array.isArray(domReport?.diagramKeys) ? domReport.diagramKeys : [];
  const svgsOnPage = Array.isArray(domReport?.svgPaths) ? domReport.svgPaths : [];
  const pageCatalog = new Set(
    Array.isArray(domReport?.pageCatalogKeys) ? domReport.pageCatalogKeys.map(String) : [],
  );

  const keyBaseline = validKeys || (pageCatalog.size ? pageCatalog : null);
  const svgBaseline = registeredSvgs;

  /** @type {Array<Record<string, unknown>>} */
  const issues = [];

  if (keyBaseline) {
    for (const key of keysOnPage) {
      const k = String(key || '').trim();
      if (!k) continue;
      if (!keyBaseline.has(k)) {
        issues.push({
          kind: 'unknown-diagram-key',
          key: k,
          message: `Rendered diagram uses data-diagram-key="${k}" but that key is not in the Kitchen Sink diagram catalog.`,
        });
      }
    }
  }

  if (svgBaseline) {
    for (const rel of svgsOnPage) {
      const p = String(rel || '').trim();
      if (!p || svgBaseline.has(p)) continue;
      issues.push({
        kind: 'unregistered-diagram-svg',
        svg: p,
        message: `Shipped diagram asset ${p} is not covered by any active diagram-family or diagram-asset-group source_paths row in the visual registry.`,
      });
    }
  }

  return issues;
}

/**
 * @param {{
 *   skipped?: boolean,
 *   issues?: Array<Record<string, unknown>>,
 * }} report
 * @param {{ url?: string }} [opts]
 */
export function findingsFromDiagramAssetRegistryReport(report, opts = {}) {
  if (!report || report.skipped) return [];
  const issues = Array.isArray(report.issues) ? report.issues : [];
  if (!issues.length) return [];

  const url = opts.url ? String(opts.url) : '';
  const findings = [];
  const seen = new Set();

  for (const issue of issues.slice(0, MAX_DIAGRAM_ASSET_REGISTRY_FINDINGS)) {
    const kind = String(issue.kind || 'diagram-asset-registry');
    const key = `${kind}:${issue.key || ''}:${issue.svg || ''}:${issue.message}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const remediationByKind = {
      'missing-diagram-family':
        'Add an active diagram-family row in docs/design/catalog/visual-registry.yaml (parent for diagram-asset-group children) and regenerate visual-registry.generated.json.',
      'catalog-key-unmapped':
        'Add the key to generator/pages/_diagram_gallery.py with a template-*.svg file, or remove the stale entry from js/ks-diagram-catalog.js.',
      'gallery-svg-not-registered':
        'Register the SVG path on the appropriate diagram-asset-group row (e.g. Zxd templates) under the Ksv diagram family, then regenerate the catalog JSON.',
      'unknown-diagram-key':
        'Use a valid ks-diagram catalog key or register a new template in the gallery + visual registry before shipping data-diagram-key to consumers.',
      'unregistered-diagram-svg':
        'Add the asset path to diagram-family/diagram-asset-group source_paths in visual-registry.yaml, or stop shipping unregistered SVG paths on consumer pages.',
    };

    findings.push({
      severity: 'warn',
      area: 'visual-catalog',
      message: String(issue.message || 'Diagram asset registry governance issue.'),
      evidence: [
        kind,
        issue.key ? `key=${issue.key}` : '',
        issue.svg ? `svg=${issue.svg}` : '',
        url ? `url=${url}` : '',
      ]
        .filter(Boolean)
        .join(' '),
      remediation:
        remediationByKind[kind]
        || 'Align diagram catalog keys and assets/svg paths with docs/design/catalog/visual-registry.generated.json diagram-family rows.',
    });
  }

  if (issues.length > MAX_DIAGRAM_ASSET_REGISTRY_FINDINGS) {
    findings.push({
      severity: 'minor',
      area: 'visual-catalog',
      message: `Additional diagram asset registry issues omitted (${issues.length - MAX_DIAGRAM_ASSET_REGISTRY_FINDINGS} more).`,
      evidence: `diagram_asset_registry_total=${issues.length}`,
      remediation:
        'Run `node tools/design-catalog/check-visual-catalog.mjs --repo . --strict-inventory` for the full diagram coverage report.',
    });
  }

  return findings;
}

/** @param {import('playwright').Page} page */
export async function collectDiagramAssetRegistryReport(page) {
  return page.evaluate(() => {
    const normSrc = (src) => {
      let raw = String(src || '').trim();
      if (!raw || raw.startsWith('data:')) return '';
      if (/^https?:/i.test(raw)) {
        try {
          raw = new URL(raw).pathname;
        } catch {
          return '';
        }
      }
      raw = raw.replace(/^\/+/, '');
      const idx = raw.indexOf('assets/svg/');
      if (idx < 0) return '';
      return raw.slice(idx).replace(/\\/g, '/');
    };

    /** @type {Set<string>} */
    const diagramKeys = new Set();
    for (const el of document.querySelectorAll('[data-diagram-key]')) {
      const k = (el.getAttribute('data-diagram-key') || '').trim();
      if (k) diagramKeys.add(k);
    }

    /** @type {Set<string>} */
    const svgPaths = new Set();
    const imgSelector = [
      '.forge-diagram img',
      '.ks-diagram-tile img',
      '[data-diagram-key] img',
      'img[src*="assets/svg/"]',
    ].join(',');
    for (const img of document.querySelectorAll(imgSelector)) {
      const rel = normSrc(img.getAttribute('src') || '');
      if (rel) svgPaths.add(rel);
    }

    const pageCatalog =
      window.__FORGE_KS_DIAGRAM_CATALOG && typeof window.__FORGE_KS_DIAGRAM_CATALOG === 'object'
        ? Object.keys(window.__FORGE_KS_DIAGRAM_CATALOG)
        : [];

    return {
      diagramKeys: [...diagramKeys].sort(),
      svgPaths: [...svgPaths].sort(),
      pageCatalogKeys: [...pageCatalog].sort(),
    };
  });
}

export async function run({ metrics, page, url, repoRoot, ctx }) {
  const root = String(repoRoot || ctx?.repoRoot || metrics?.repoRoot || '').trim();
  const pageUrl = url || metrics?.url || '';
  /** @type {object[]} */
  const findings = [];

  if (root) {
    const repoReport = metrics?.diagramAssetRegistryRepoReport ?? scanRepoDiagramAssetRegistry(root);
    findings.push(...findingsFromDiagramAssetRegistryReport(repoReport));
  }

  const domReport =
    metrics?.diagramAssetRegistryReport ?? (page ? await collectDiagramAssetRegistryReport(page) : null);

  if (domReport) {
    const hasDomSignal =
      (domReport.diagramKeys && domReport.diagramKeys.length)
      || (domReport.svgPaths && domReport.svgPaths.length);
    if (hasDomSignal) {
      const validKeys = root ? loadDiagramCatalogKeys(root) : null;
      const registeredSvgs = root
        ? diagramRegistrySvgPaths(loadGeneratedRegistry(root)?.entries || [])
        : null;
      const domIssues = analyzeDomDiagramAssets(domReport, { validKeys, registeredSvgs });
      findings.push(...findingsFromDiagramAssetRegistryReport({ issues: domIssues }, { url: pageUrl }));
    }
  }

  return findings;
}
