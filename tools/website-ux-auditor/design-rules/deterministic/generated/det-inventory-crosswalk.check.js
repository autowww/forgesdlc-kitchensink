/**
 * DET.INVENTORY.CROSSWALK — showcase-emitted hashes must be a subset of the visual registry;
 * no stray (invalid-format) hash tokens in showcase HTML/JS.
 *
 * Primary evidence: `docs/design/catalog/visual-inventory.generated.json` → `catalogCrosswalk`.
 */

import fs from 'node:fs';
import path from 'node:path';

import { loadGeneratedRegistry } from '../../../lib/visual-catalog.js';

export const INVENTORY_JSON = 'docs/design/catalog/visual-inventory.generated.json';

/** Cap findings per audit pass (repo-wide inventory crosswalk). */
export const MAX_INVENTORY_CROSSWALK_FINDINGS = 12;

const VALID_HASH = /^[A-Za-z]{3}$/;

export const rule = {
  id: 'DET.INVENTORY.CROSSWALK',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'visual-catalog',
  scoreDimension: 'visualCatalogGovernance',
  defaultSeverity: 'warn',
  priorityWeight: 8,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-inventory-crosswalk',
};

/**
 * @param {string} repoRoot
 * @returns {string}
 */
export function visualInventoryPath(repoRoot) {
  return path.join(repoRoot, INVENTORY_JSON);
}

/**
 * Same scan semantics as inventory-ks-visuals.mjs / check-visual-catalog.mjs.
 * @param {string} showcaseDir
 * @returns {Set<string>}
 */
export function collectEmittedHashes(showcaseDir) {
  const set = new Set();
  if (!fs.existsSync(showcaseDir)) return set;

  const scanText = (txt, isJs) => {
    const reAttr = /(?:hash|data-ks-hash)=["']([A-Za-z]{3})["']/g;
    let m;
    while ((m = reAttr.exec(txt)) !== null) set.add(m[1]);
    if (isJs) {
      const reLit = /hash:"([A-Za-z]{3})"/g;
      while ((m = reLit.exec(txt)) !== null) set.add(m[1]);
      const reQuoted = /"data-ks-hash":"([A-Za-z]{3})"/g;
      while ((m = reQuoted.exec(txt)) !== null) set.add(m[1]);
    }
  };

  for (const name of fs.readdirSync(showcaseDir)) {
    if (!name.endsWith('.html')) continue;
    scanText(fs.readFileSync(path.join(showcaseDir, name), 'utf8'), false);
  }

  const assetsDir = path.join(showcaseDir, 'assets');
  if (fs.existsSync(assetsDir) && fs.statSync(assetsDir).isDirectory()) {
    for (const name of fs.readdirSync(assetsDir)) {
      if (!name.endsWith('.js')) continue;
      scanText(fs.readFileSync(path.join(assetsDir, name), 'utf8'), true);
    }
  }

  return set;
}

/**
 * @param {string} text
 * @param {string} attr
 * @returns {string[]}
 */
export function extractQuotedAttrValues(text, attr) {
  const escaped = attr.replace(/-/g, '\\-');
  const re = new RegExp(`${escaped}\\s*=\\s*["']([^"']*)["']`, 'gi');
  /** @type {string[]} */
  const out = [];
  let m;
  while ((m = re.exec(String(text || ''))) !== null) out.push(m[1]);
  return out;
}

/**
 * @param {string} showcaseDir
 * @returns {{ hash: string[], dataKsHash: string[] }}
 */
export function collectShowcaseStrayTokens(showcaseDir) {
  /** @type {Set<string>} */
  const hashVals = new Set();
  /** @type {Set<string>} */
  const dataVals = new Set();

  const noteInvalid = (attr, value) => {
    const v = String(value || '').trim();
    if (!v || VALID_HASH.test(v)) return;
    if (attr === 'hash') hashVals.add(v);
    else dataVals.add(v);
  };

  const scanText = (txt, isJs) => {
    for (const v of extractQuotedAttrValues(txt, 'hash')) noteInvalid('hash', v);
    for (const v of extractQuotedAttrValues(txt, 'data-ks-hash')) noteInvalid('data-ks-hash', v);
    if (isJs) {
      const reLit = /hash:"([^"]+)"/g;
      let m;
      while ((m = reLit.exec(txt)) !== null) noteInvalid('hash', m[1]);
      const reQuoted = /"data-ks-hash":"([^"]+)"/g;
      while ((m = reQuoted.exec(txt)) !== null) noteInvalid('data-ks-hash', m[1]);
    }
  };

  if (!fs.existsSync(showcaseDir)) {
    return { hash: [], dataKsHash: [] };
  }

  for (const name of fs.readdirSync(showcaseDir)) {
    if (!name.endsWith('.html')) continue;
    scanText(fs.readFileSync(path.join(showcaseDir, name), 'utf8'), false);
  }

  const assetsDir = path.join(showcaseDir, 'assets');
  if (fs.existsSync(assetsDir) && fs.statSync(assetsDir).isDirectory()) {
    for (const name of fs.readdirSync(assetsDir)) {
      if (!name.endsWith('.js')) continue;
      scanText(fs.readFileSync(path.join(assetsDir, name), 'utf8'), true);
    }
  }

  return {
    hash: [...hashVals].sort(),
    dataKsHash: [...dataVals].sort(),
  };
}

/**
 * @param {string} repoRoot
 * @param {string} showcaseDir
 * @returns {string[]}
 */
export function computeShowcaseHashesNotInRegistry(repoRoot, showcaseDir) {
  const reg = loadGeneratedRegistry(repoRoot);
  if (!reg?.entries?.length) return [];
  const registryHashes = new Set(
    reg.entries.map((e) => e?.hash).filter((h) => h && VALID_HASH.test(String(h))),
  );
  const emitted = collectEmittedHashes(showcaseDir);
  return [...emitted].filter((h) => !registryHashes.has(h)).sort();
}

/**
 * @param {string} repoRoot
 */
export function buildInventoryCrosswalkReport(repoRoot) {
  const invPath = visualInventoryPath(repoRoot);
  if (!fs.existsSync(invPath)) {
    return { skipped: true, reason: 'no-inventory', inventoryJson: INVENTORY_JSON, issues: [] };
  }

  /** @type {object | null} */
  let doc = null;
  try {
    doc = JSON.parse(fs.readFileSync(invPath, 'utf8'));
  } catch {
    return { skipped: true, reason: 'inventory-parse-error', inventoryJson: INVENTORY_JSON, issues: [] };
  }

  const xw = doc?.catalogCrosswalk;
  const showcaseRel =
    xw && typeof xw === 'object' && !xw.error && xw.showcase_dir
      ? String(xw.showcase_dir)
      : 'showcase';
  const showcaseDir = path.join(repoRoot, showcaseRel);

  /** @type {Array<{ kind: string, hash?: string, token?: string, attr?: string, message: string }>} */
  const issues = [];

  if (xw?.error) {
    issues.push({
      kind: 'crosswalk-error',
      message: `Visual inventory catalogCrosswalk failed: ${String(xw.error)}.`,
    });
  } else if (!xw) {
    issues.push({
      kind: 'crosswalk-missing',
      message:
        `${INVENTORY_JSON} has no catalogCrosswalk block — regenerate the inventory to refresh showcase ↔ registry alignment.`,
    });
  }

  let unregistered = [];
  if (xw && !xw.error && Array.isArray(xw.showcase_hashes_not_in_registry)) {
    unregistered = xw.showcase_hashes_not_in_registry
      .map((h) => String(h || '').trim())
      .filter((h) => VALID_HASH.test(h))
      .sort();
  } else if (!xw?.error) {
    unregistered = computeShowcaseHashesNotInRegistry(repoRoot, showcaseDir);
  }

  for (const hash of unregistered) {
    issues.push({
      kind: 'unregistered-emitted',
      hash,
      message: `Showcase emits hash ${hash} but it is not in visual-registry.generated.json.`,
    });
  }

  const stray = collectShowcaseStrayTokens(showcaseDir);
  for (const token of stray.hash) {
    issues.push({
      kind: 'stray-token',
      attr: 'hash',
      token,
      message: `Showcase has stray hash="${token}" — expected exactly three ASCII letters or remove the marker.`,
    });
  }
  for (const token of stray.dataKsHash) {
    issues.push({
      kind: 'stray-token',
      attr: 'data-ks-hash',
      token,
      message: `Showcase has stray data-ks-hash="${token}" — expected exactly three ASCII letters or remove the marker.`,
    });
  }

  issues.sort((a, b) => {
    const ka = `${a.kind}:${a.hash || ''}:${a.token || ''}:${a.attr || ''}`;
    const kb = `${b.kind}:${b.hash || ''}:${b.token || ''}:${b.attr || ''}`;
    return ka.localeCompare(kb);
  });

  return {
    skipped: false,
    inventoryJson: INVENTORY_JSON,
    showcaseDir: showcaseRel,
    emittedNotInRegistryCount: unregistered.length,
    strayTokenCount: stray.hash.length + stray.dataKsHash.length,
    issues,
  };
}

/**
 * @param {{
 *   skipped?: boolean,
 *   issues?: Array<{ kind: string, hash?: string, token?: string, attr?: string, message: string }>,
 * }} report
 */
export function findingsFromInventoryCrosswalkReport(report) {
  if (!report || report.skipped) return [];
  const issues = Array.isArray(report.issues) ? report.issues : [];
  if (!issues.length) return [];

  const findings = [];
  const seen = new Set();

  for (const issue of issues.slice(0, MAX_INVENTORY_CROSSWALK_FINDINGS)) {
    const key = `${issue.kind}:${issue.hash || ''}:${issue.token || ''}:${issue.attr || ''}`;
    if (seen.has(key)) continue;
    seen.add(key);

    let severity = 'warn';
    let remediation =
      'Run `node tools/design-catalog/inventory-ks-visuals.mjs --repo . --out docs/design/catalog/visual-inventory.generated.json`, then `node tools/design-catalog/check-visual-catalog.mjs --repo .` for the full catalog report.';

    if (issue.kind === 'crosswalk-missing' || issue.kind === 'crosswalk-error') {
      severity = 'minor';
    } else if (issue.kind === 'stray-token') {
      severity = 'minor';
      remediation =
        'Use a registered three-letter KS hash in both `hash="XYZ"` and `data-ks-hash="XYZ"`, or remove invalid markers from showcase HTML/JS.';
    } else if (issue.kind === 'unregistered-emitted') {
      remediation =
        'Register the surface in docs/design/catalog/visual-registry.yaml (regenerate JSON), or remove the stray showcase marker if it is not governed.';
    }

    findings.push({
      severity,
      area: 'visual-catalog',
      hash: issue.hash || undefined,
      message: issue.message,
      evidence: issue.hash
        ? `hash=${issue.hash}; inventory=${report.inventoryJson || INVENTORY_JSON}`
        : issue.token
          ? `attr=${issue.attr}; token=${issue.token}; showcase=${report.showcaseDir || 'showcase'}`
          : `inventory=${report.inventoryJson || INVENTORY_JSON}`,
      remediation,
    });
  }

  if (issues.length > MAX_INVENTORY_CROSSWALK_FINDINGS) {
    findings.push({
      severity: 'minor',
      area: 'visual-catalog',
      message: `Additional inventory crosswalk issues omitted (${issues.length - MAX_INVENTORY_CROSSWALK_FINDINGS} more).`,
      evidence: `inventory_crosswalk_total=${issues.length}`,
      remediation:
        'Run `node tools/design-catalog/check-visual-catalog.mjs --repo . --refresh-inventory` for the full showcase ↔ registry report.',
    });
  }

  return findings;
}

export async function run({ metrics, repoRoot, ctx }) {
  const root = String(repoRoot || ctx?.repoRoot || metrics?.repoRoot || '').trim();
  if (!root) return [];

  const report = metrics?.inventoryCrosswalkReport ?? buildInventoryCrosswalkReport(root);
  return findingsFromInventoryCrosswalkReport(report);
}
