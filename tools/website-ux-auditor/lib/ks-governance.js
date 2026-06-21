/**
 * Shared helpers for DET.KS.* governance rules (consumer bundles, hash semantics, contracts).
 */

import fs from 'node:fs';
import path from 'node:path';

import { ruleScopeEnabled } from './detect-ks-site.js';
import {
  entryByHash,
  ksVisualHashReportFromMetrics,
  loadGeneratedRegistry,
} from './visual-catalog.js';

const HASH_RE = /^[A-Za-z]{3}$/;
const PRIMITIVE_ROOT_SELECTOR = [
  '[data-ks-react-root="true"]',
  '[data-ks-type="react-primitive"][data-ks-hash]',
].join(',');

/**
 * @param {Record<string, unknown> | null | undefined} metrics
 */
export function hasKsDomSignal(metrics) {
  const rep = ksVisualHashReportFromMetrics(metrics);
  if (rep?.validUnique?.length) return true;
  if (rep?.instances?.length) return true;
  const counts = rep?.instanceCountByHash || {};
  return Object.keys(counts).length > 0;
}

/**
 * @param {{ rulesScopeResolved?: { effectiveScope?: string, ksDriven?: boolean }, metrics?: Record<string, unknown>, repoRoot?: string }} input
 */
export function ksGovernanceEnabled(input) {
  const resolved = input.rulesScopeResolved;
  if (resolved && !ruleScopeEnabled('ks', resolved)) return false;
  if (resolved?.ksDriven || resolved?.effectiveScope === 'ks' || resolved?.effectiveScope === 'all') {
    return true;
  }
  if (hasKsDomSignal(input.metrics)) return true;
  return false;
}

/**
 * @param {string} html
 * @returns {string[]}
 */
export function extractThreeLetterHashesFromHtml(html) {
  const text = String(html || '');
  const out = new Set();
  for (const re of [
    /data-ks-hash\s*=\s*["']([A-Za-z]{3})["']/gi,
    /(?<![\w-])hash\s*=\s*["']([A-Za-z]{3})["']/gi,
  ]) {
    let m;
    while ((m = re.exec(text)) !== null) out.add(m[1]);
  }
  return [...out].sort();
}

/**
 * @param {string} text
 * @returns {string}
 */
export function parsePrimitiveVersionFromText(text) {
  const src = String(text || '');
  const m =
    src.match(/data-ks-primitive-version\s*=\s*["']([^"']+)["']/i)
    || src.match(/Primitive\s+version:\s*([^\s\n]+)/i)
    || src.match(/primitive_version:\s*([^\s\n]+)/i);
  return m ? String(m[1]).trim() : '';
}

/**
 * @param {object | null | undefined} entry
 */
export function registryPrimitiveVersion(entry) {
  if (!entry || typeof entry !== 'object') return '';
  const v = entry.primitive_version ?? entry.primitiveVersion;
  return v != null ? String(v).trim() : '';
}

/**
 * @param {string} repoRoot
 * @param {string} contractRel
 */
export function readContractPrimitiveVersion(repoRoot, contractRel) {
  const rel = String(contractRel || '').replace(/\\/g, '/').trim();
  if (!rel) return '';
  const abs = path.join(repoRoot, rel);
  try {
    return parsePrimitiveVersionFromText(fs.readFileSync(abs, 'utf8'));
  } catch {
    return '';
  }
}

/**
 * @param {string} repoRoot
 * @param {{ hash: string, dataKsType: string, dataKsName: string, tag: string, primitiveVersion?: string }[]} instances
 */
export function buildPrimitiveVersionMatchReport(repoRoot, instances) {
  const reg = loadGeneratedRegistry(repoRoot);
  if (!reg?.entries?.length) {
    return { skipped: true, reason: 'no-registry', violations: [] };
  }
  const byHash = entryByHash(reg.entries);
  /** @type {Array<Record<string, unknown>>} */
  const violations = [];

  for (const inst of instances) {
    const hash = String(inst.hash || '').trim();
    if (!HASH_RE.test(hash)) continue;
    const domVer = String(inst.primitiveVersion || '').trim();
    const entry = byHash.get(hash);
    const regVer = registryPrimitiveVersion(entry);
    const contractVer = entry ? readContractPrimitiveVersion(repoRoot, entry.contract) : '';
    const expected = regVer || contractVer;
    if (!domVer && !expected) continue;
    if (domVer && expected && domVer !== expected) {
      violations.push({
        kind: 'version-mismatch',
        hash,
        domVersion: domVer,
        expectedVersion: expected,
        ksName: inst.dataKsName || '',
      });
    } else if (domVer && !expected) {
      violations.push({
        kind: 'undeclared-runtime-version',
        hash,
        domVersion: domVer,
        ksName: inst.dataKsName || '',
      });
    } else if (!domVer && expected) {
      violations.push({
        kind: 'missing-runtime-version',
        hash,
        expectedVersion: expected,
        ksName: inst.dataKsName || '',
      });
    }
  }

  return { skipped: false, violations: violations.slice(0, 10) };
}

/**
 * @param {import('playwright').Page} page
 */
export async function collectPrimitiveVersionInstances(page) {
  return page.evaluate(({ PRIMITIVE_ROOT_SELECTOR }) => {
    const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();
    const visible = (el) => {
      if (!el || el.nodeType !== 1) return false;
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return rect.width > 1 && rect.height > 1 && style.visibility !== 'hidden'
        && style.display !== 'none' && Number(style.opacity || 1) > 0.05;
    };
    return [...document.querySelectorAll(PRIMITIVE_ROOT_SELECTOR)]
      .filter(visible)
      .map((el) => ({
        hash: norm(el.getAttribute('data-ks-hash') || el.getAttribute('hash') || ''),
        dataKsType: norm(el.getAttribute('data-ks-type') || ''),
        dataKsName: norm(el.getAttribute('data-ks-name') || ''),
        tag: el.tagName.toLowerCase(),
        primitiveVersion: norm(el.getAttribute('data-ks-primitive-version') || ''),
      }));
  }, { PRIMITIVE_ROOT_SELECTOR });
}

/**
 * @param {{ hash: string, dataKsType: string, dataKsName: string }[]} instances
 */
export function buildHashSemanticUniquenessReport(instances) {
  /** @type {Map<string, Set<string>>} */
  const semanticsByHash = new Map();
  for (const inst of instances) {
    const hash = String(inst.hash || '').trim();
    if (!HASH_RE.test(hash)) continue;
    const key = `${inst.dataKsType || ''}|${inst.dataKsName || ''}`;
    if (!semanticsByHash.has(hash)) semanticsByHash.set(hash, new Set());
    semanticsByHash.get(hash).add(key);
  }
  /** @type {Array<Record<string, unknown>>} */
  const violations = [];
  for (const [hash, semantics] of semanticsByHash) {
    if (semantics.size <= 1) continue;
    violations.push({
      kind: 'hash-semantic-collision',
      hash,
      semantics: [...semantics].filter((s) => s !== '|'),
    });
  }
  return { violations: violations.slice(0, 10) };
}

/**
 * @param {import('playwright').Page} page
 */
export async function collectHashInstancesForSemantics(page) {
  return page.evaluate(() => {
    const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();
    const out = [];
    for (const el of document.querySelectorAll('[data-ks-hash], [hash]')) {
      const d = norm(el.getAttribute('data-ks-hash') || '');
      const h = norm(el.getAttribute('hash') || '');
      const canon = /^[A-Za-z]{3}$/.test(d) ? d : (/^[A-Za-z]{3}$/.test(h) ? h : '');
      if (!canon) continue;
      if (d && h && d !== h) continue;
      out.push({
        hash: canon,
        dataKsType: norm(el.getAttribute('data-ks-type') || ''),
        dataKsName: norm(el.getAttribute('data-ks-name') || ''),
      });
    }
    return out;
  });
}

const THEME_CSS_HINTS = ['forge-theme', 'forgesdlc-theme', 'docs-theme'];
const PRIMITIVE_CSS_HINT = 'forge-react-primitives';

/**
 * @param {import('playwright').Page} page
 */
export async function collectConsumerAssetBundleReport(page, baseUrl) {
  const evalResult = await page.evaluate(({ PRIMITIVE_ROOT_SELECTOR, THEME_CSS_HINTS, PRIMITIVE_CSS_HINT }) => {
    const norm = (s) => String(s || '').trim();
    const roots = document.querySelectorAll(PRIMITIVE_ROOT_SELECTOR);
    const hasPrimitiveRoots = roots.length > 0;
    const hasKsMarkers = document.querySelectorAll('[data-ks-hash]').length > 0;
    if (!hasPrimitiveRoots && !hasKsMarkers) {
      return { skipped: true, primitiveRootCount: 0, assets: [], missingPatterns: [] };
    }

    /** @type {{ kind: string, href: string }[]} */
    const assets = [];
    for (const link of document.querySelectorAll('link[rel="stylesheet"]')) {
      assets.push({ kind: 'stylesheet', href: norm(link.getAttribute('href') || '') });
    }
    for (const script of document.querySelectorAll('script[src]')) {
      assets.push({ kind: 'script', href: norm(script.getAttribute('src') || '') });
    }

    const hrefBlob = assets.map((a) => a.href).join(' ');
    /** @type {string[]} */
    const missingPatterns = [];
    if (hasKsMarkers && !THEME_CSS_HINTS.some((p) => hrefBlob.includes(p))) {
      missingPatterns.push('ks-theme-stylesheet');
    }
    if (hasPrimitiveRoots && !hrefBlob.includes(PRIMITIVE_CSS_HINT)) {
      missingPatterns.push('forge-react-primitives-stylesheet');
    }

    return {
      skipped: false,
      primitiveRootCount: roots.length,
      assets,
      missingPatterns,
    };
  }, { PRIMITIVE_ROOT_SELECTOR, THEME_CSS_HINTS, PRIMITIVE_CSS_HINT });

  if (evalResult.skipped) return evalResult;

  /** @type {Array<Record<string, unknown>>} */
  const brokenAssets = [];
  const origin = (() => {
    try {
      return new URL(baseUrl).origin;
    } catch {
      return '';
    }
  })();

  for (const asset of evalResult.assets || []) {
    const href = String(asset.href || '');
    if (!href || href.startsWith('data:')) continue;
    let resolved = href;
    try {
      resolved = new URL(href, baseUrl).href;
    } catch {
      continue;
    }
    if (origin && !resolved.startsWith(origin) && !href.startsWith('/')) continue;
    try {
      const resp = await page.request.get(resolved, { timeout: 8000 });
      if (resp.status() >= 400) {
        brokenAssets.push({ href, status: resp.status(), kind: asset.kind });
      }
    } catch (err) {
      brokenAssets.push({ href, status: 0, kind: asset.kind, error: String(err?.message || err) });
    }
    if (brokenAssets.length >= 8) break;
  }

  return {
    ...evalResult,
    brokenAssets,
  };
}

/**
 * Static HTML scan for bundle hints (no HTTP).
 * @param {string} html
 */
export function buildConsumerAssetBundleReportFromHtml(html) {
  const text = String(html || '');
  const hasPrimitive = /data-ks-react-root\s*=\s*["']true["']/i.test(text)
    || /data-ks-type\s*=\s*["']react-primitive["']/i.test(text);
  const hasKsMarkers = /data-ks-hash\s*=/i.test(text);
  if (!hasPrimitive && !hasKsMarkers) {
    return { skipped: true, mode: 'static', missingPatterns: [], brokenAssets: [] };
  }
  const hrefBlob = text;
  /** @type {string[]} */
  const missingPatterns = [];
  if (hasKsMarkers && !THEME_CSS_HINTS.some((p) => hrefBlob.includes(p))) {
    missingPatterns.push('ks-theme-stylesheet');
  }
  if (hasPrimitive && !hrefBlob.includes(PRIMITIVE_CSS_HINT)) {
    missingPatterns.push('forge-react-primitives-stylesheet');
  }
  return {
    skipped: false,
    mode: 'static',
    missingPatterns,
    brokenAssets: [],
  };
}

/**
 * @param {string} repoRoot
 * @param {string} ruleId
 */
export function kebabFromRuleId(ruleId) {
  return String(ruleId || '')
    .toLowerCase()
    .replaceAll('.', '-')
    .replaceAll('_', '-');
}

/**
 * @param {string} repoRoot
 */
export function buildContractExampleSyncReport(repoRoot) {
  const rulePagesDir = path.join(repoRoot, 'docs/design/ux-audit/rule-pages');
  if (!fs.existsSync(rulePagesDir)) {
    return { skipped: true, reason: 'no-rule-pages', issues: [] };
  }

  /** @type {Array<Record<string, unknown>>} */
  const issues = [];
  const files = fs.readdirSync(rulePagesDir).filter((f) => f.startsWith('det-') && f.endsWith('.md'));

  for (const file of files.slice(0, 200)) {
    const abs = path.join(rulePagesDir, file);
    const text = fs.readFileSync(abs, 'utf8');
    const fm = text.match(/^rule_id:\s*(DET\.[A-Z0-9_.]+)/m);
    const ruleId = fm ? fm[1] : '';
    if (!ruleId.startsWith('DET.')) continue;

    const beforeMatch = text.match(/## Before example[\s\S]*?```html\n([\s\S]*?)```/);
    const beforeHashes = beforeMatch ? extractThreeLetterHashesFromHtml(beforeMatch[1]) : [];
    if (beforeHashes.length === 1) {
      const hash = beforeHashes[0];
      const bodyOutsideBefore = text.replace(/## Before example[\s\S]*?```[\s\S]*?```/, '');
      if (!bodyOutsideBefore.includes(hash)) {
        issues.push({
          kind: 'hash-not-referenced-outside-before',
          ruleId,
          hash,
          file: `docs/design/ux-audit/rule-pages/${file}`,
        });
      }
    }

    const detChecks = text.match(/## Deterministic checks[\s\S]*?(?=## |$)/);
    if (detChecks && ruleId && !detChecks[0].includes(ruleId)) {
      issues.push({
        kind: 'rule-id-missing-in-deterministic-checks',
        ruleId,
        file: `docs/design/ux-audit/rule-pages/${file}`,
      });
    }
  }

  return { skipped: false, issues: issues.slice(0, 12) };
}

/**
 * Live-mode CSS scope leak: KS global selectors affecting host controls outside KS roots.
 * @param {import('playwright').Page} page
 */
export async function collectCssScopeLeakReport(page) {
  return page.evaluate(() => {
    const ksRootSel = [
      '[data-ks-hash]',
      '[data-ks-react-root="true"]',
      '.forge-card',
      '.forge-section',
      '.ks-fe-status-banner',
      'main.doc-main',
    ].join(',');

    const hostProbe = document.querySelector(
      'input:not([data-ks-hash] *), select:not([data-ks-hash] *), textarea:not([data-ks-hash] *)',
    );
    if (!hostProbe) return { skipped: true, violations: [] };

    const insideKs = hostProbe.closest(ksRootSel);
    if (insideKs) return { skipped: true, violations: [] };

    const style = window.getComputedStyle(hostProbe);
    const violations = [];
    const bg = style.backgroundColor || '';
    const color = style.color || '';
    if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
      const rgb = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (rgb) {
        const lum = (Number(rgb[1]) + Number(rgb[2]) + Number(rgb[3])) / 3;
        if (lum < 40 || lum > 240) {
          violations.push({ kind: 'host-control-themed-bg', probe: hostProbe.tagName.toLowerCase(), bg });
        }
      }
    }
    if (parseFloat(style.opacity || '1') < 0.5) {
      violations.push({ kind: 'host-control-faded', probe: hostProbe.tagName.toLowerCase() });
    }
    return { skipped: false, violations: violations.slice(0, 5) };
  });
}

/**
 * @param {string} repoRoot
 */
export function buildVisualFamilyCoverageReport(repoRoot) {
  const reg = loadGeneratedRegistry(repoRoot);
  if (!reg?.entries?.length) {
    return { skipped: true, reason: 'no-registry', violations: [] };
  }

  /** @type {Array<Record<string, unknown>>} */
  const violations = [];
  for (const entry of reg.entries) {
    const hash = String(entry.hash || '').trim();
    if (!HASH_RE.test(hash)) continue;
    const type = String(entry.type || '').toLowerCase();
    const emits = entry.emits_html === true;
    const consumerBound =
      emits
      || type === 'react-primitive'
      || (Array.isArray(entry.source_paths) && entry.source_paths.some((p) => /^(components|react|assets\/svg)\//.test(String(p))));
    if (!consumerBound) continue;

    const status = String(entry.contract_status || '').toLowerCase();
    const contract = String(entry.contract || '').trim();
    if (!status || status === 'missing') {
      violations.push({ kind: 'missing-contract-status', hash, type });
      continue;
    }
    if (status === 'own' && contract) {
      const abs = path.join(repoRoot, contract.replace(/\\/g, '/'));
      if (!fs.existsSync(abs)) {
        violations.push({ kind: 'contract-file-missing', hash, contract });
      }
    }
    if (!contract && status !== 'family-covered') {
      violations.push({ kind: 'missing-contract-path', hash, type, contractStatus: status });
    }
  }

  return { skipped: false, violations: violations.slice(0, 12) };
}

/**
 * @param {Array<Record<string, unknown>>} violations
 * @param {string} ruleId
 * @param {(v: Record<string, unknown>) => object} mapFinding
 */
export function findingsFromViolations(violations, ruleId, mapFinding) {
  if (!violations?.length) return [];
  return violations.map((v) => ({
    severity: 'minor',
    area: 'visual-catalog',
    ruleId,
    ...mapFinding(v),
  }));
}
