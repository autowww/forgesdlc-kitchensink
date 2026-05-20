/**
 * DET.DIAGRAM.LABELS — SVG/diagram text nodes include readable labels aligned with
 * catalog legend keys (ks-diagram-catalog `items[].node`).
 */

import fs from 'node:fs';
import path from 'node:path';

import {
  loadDiagramCatalogKeys,
  parseDiagramGalleryKeyToSvg,
} from './det-diagram-asset-registry.check.js';

/** Minimum characters for a diagram label token. */
export const MIN_DIAGRAM_LABEL_CHARS = 2;

/** Minimum legend nodes that must appear in SVG text for a catalog-linked diagram. */
export const MIN_LEGEND_NODE_MATCHES = 2;

/** Fraction of catalog legend nodes that must match when the legend is longer. */
export const LEGEND_COVERAGE_RATIO = 0.5;

export const MAX_DIAGRAM_LABELS_FINDINGS = 12;

const DIAGRAM_ROOT_SELECTOR = [
  '.forge-diagram',
  '.ks-diagram-tile',
  '[data-diagram-key]',
  'figure.forge-diagram',
  'figure.forge-diagram-ascii',
].join(',');

const CHART_EXCLUDE_SELECTOR = [
  '[data-ks-chart]',
  '.ks-chart-mount',
  '[data-chart]',
  '.chart',
].join(',');

export const rule = {
  id: 'DET.DIAGRAM.LABELS',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'visual-catalog',
  scoreDimension: 'visualCatalogGovernance',
  defaultSeverity: 'warn',
  priorityWeight: 7,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-diagram-labels',
};

/**
 * @param {string} text
 */
export function normalizeDiagramLabel(text) {
  return String(text || '').replace(/\s+/g, ' ').trim().toLowerCase();
}

/**
 * @param {string} text
 */
export function isReadableDiagramLabel(text) {
  const raw = String(text || '').replace(/\s+/g, ' ').trim();
  if (raw.length < MIN_DIAGRAM_LABEL_CHARS) return false;
  if (/^\[[^\]]*\]$/.test(raw) && /subtitle|footer|note|title\s*-/i.test(raw)) return false;
  return true;
}

/**
 * @param {string} svgText
 * @returns {string[]}
 */
export function extractSvgTextNodes(svgText) {
  const out = [];
  const re = /<tspan[^>]*>([^<]*)<\/tspan>|<text[^>]*>([^<]*)<\/text>/gi;
  let m;
  while ((m = re.exec(String(svgText || ''))) !== null) {
    const t = (m[1] || m[2] || '').replace(/\s+/g, ' ').trim();
    if (t) out.push(t);
  }
  return out;
}

/**
 * @param {string} catalogText
 * @param {string} key
 * @returns {string[]}
 */
export function extractLegendNodesForKey(catalogText, key) {
  const re = new RegExp(
    `\\b${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*:\\s*\\{[\\s\\S]*?items\\s*:\\s*\\[([\\s\\S]*?)\\]\\s*\\}`,
    'm',
  );
  const m = String(catalogText || '').match(re);
  if (!m) return [];
  const nodes = [];
  const nodeRe = /node:\s*['"]([^'"]+)['"]/g;
  let nm;
  while ((nm = nodeRe.exec(m[1])) !== null) nodes.push(nm[1]);
  return nodes;
}

/**
 * @param {string[]} legendNodes
 * @param {string[]} labelTexts
 */
export function countLegendNodeMatches(legendNodes, labelTexts) {
  const labelNorm = new Set(
    labelTexts.map(normalizeDiagramLabel).filter((t) => t.length >= MIN_DIAGRAM_LABEL_CHARS),
  );
  let matched = 0;
  for (const node of legendNodes) {
    const n = normalizeDiagramLabel(node);
    if (n.length < MIN_DIAGRAM_LABEL_CHARS) continue;
    if (labelNorm.has(n)) {
      matched += 1;
      continue;
    }
    for (const label of labelNorm) {
      if (label.includes(n) || n.includes(label)) {
        matched += 1;
        break;
      }
    }
  }
  return matched;
}

/**
 * @param {number} legendCount
 */
export function requiredLegendMatches(legendCount) {
  if (legendCount <= 0) return 0;
  return Math.max(
    MIN_LEGEND_NODE_MATCHES,
    Math.ceil(legendCount * LEGEND_COVERAGE_RATIO),
  );
}

/**
 * @param {string[]} legendNodes
 * @param {string[]} labelTexts
 */
export function analyzeLegendLabelCoverage(legendNodes, labelTexts) {
  const legend = (legendNodes || []).map((n) => String(n || '').trim()).filter(Boolean);
  const readable = (labelTexts || []).filter(isReadableDiagramLabel);
  const required = requiredLegendMatches(legend.length);

  if (!readable.length) {
    return {
      ok: false,
      kind: 'diagram-labels-no-readable-text',
      matched: 0,
      required,
      legendCount: legend.length,
    };
  }

  const matched = countLegendNodeMatches(legend, readable);
  if (legend.length && matched < required) {
    return {
      ok: false,
      kind: 'diagram-labels-legend-gap',
      matched,
      required,
      legendCount: legend.length,
    };
  }

  return { ok: true, matched, required, legendCount: legend.length };
}

/**
 * @param {string} repoRoot
 */
export function scanRepoDiagramLabels(repoRoot) {
  const catalogPath = path.join(repoRoot, 'js/ks-diagram-catalog.js');
  const galleryPath = path.join(repoRoot, 'generator/pages/_diagram_gallery.py');
  if (!fs.existsSync(catalogPath) || !fs.existsSync(galleryPath)) {
    return { skipped: true, reason: 'no-catalog', issues: [] };
  }

  const catalogText = fs.readFileSync(catalogPath, 'utf8');
  const galleryMap = parseDiagramGalleryKeyToSvg(fs.readFileSync(galleryPath, 'utf8'));
  const catalogKeys = loadDiagramCatalogKeys(repoRoot);
  if (!galleryMap || !catalogKeys) {
    return { skipped: true, reason: 'parse-failed', issues: [] };
  }

  /** @type {Array<Record<string, unknown>>} */
  const issues = [];

  for (const key of [...catalogKeys].sort()) {
    const filename = galleryMap.get(key);
    if (!filename) continue;
    const svgPath = path.join(repoRoot, 'assets/svg', filename);
    if (!fs.existsSync(svgPath)) continue;

    const legendNodes = extractLegendNodesForKey(catalogText, key);
    if (!legendNodes.length) continue;

    const svgLabels = extractSvgTextNodes(fs.readFileSync(svgPath, 'utf8'));
    const analysis = analyzeLegendLabelCoverage(legendNodes, svgLabels);
    if (analysis.ok) continue;

    issues.push({
      kind: analysis.kind,
      key,
      svg: `assets/svg/${filename}`,
      matched: analysis.matched,
      required: analysis.required,
      legendCount: analysis.legendCount,
      message:
        analysis.kind === 'diagram-labels-no-readable-text'
          ? `Template SVG assets/svg/${filename} for catalog key "${key}" has no readable text labels in SVG <text>/<tspan> nodes.`
          : `Template SVG assets/svg/${filename} for "${key}" matches only ${analysis.matched}/${analysis.required} required catalog legend node labels (of ${analysis.legendCount} legend entries).`,
    });
  }

  issues.sort((a, b) => String(a.message).localeCompare(String(b.message)));
  return { skipped: false, templateCount: galleryMap.size, issues };
}

/**
 * @param {{
 *   violations?: Array<Record<string, unknown>>,
 * }} report
 * @param {{ url?: string }} [opts]
 */
export function findingsFromDiagramLabelsReport(report, opts = {}) {
  const violations = Array.isArray(report?.violations) ? report.violations : [];
  const repoIssues = Array.isArray(report?.repoIssues) ? report.repoIssues : [];
  const issues = [...violations, ...repoIssues];
  if (!issues.length) return [];

  const url = opts.url ? String(opts.url) : '';
  const findings = [];
  const seen = new Set();

  for (const issue of issues.slice(0, MAX_DIAGRAM_LABELS_FINDINGS)) {
    const kind = String(issue.kind || 'diagram-labels');
    const hint = String(issue.selectorHint || issue.key || issue.svg || '').slice(0, 120);
    const dedupe = `${kind}:${hint}`;
    if (seen.has(dedupe)) continue;
    seen.add(dedupe);

    const remediationByKind = {
      'diagram-labels-no-readable-text':
        'Add readable <text>/<tspan> labels to the diagram SVG (or ASCII art body) so legend keys from js/ks-diagram-catalog.js appear on the rendered surface.',
      'diagram-labels-legend-gap':
        'Align SVG text nodes with catalog legend `items[].node` strings for the data-diagram-key, or update the catalog legend when labels were intentionally renamed.',
    };

    findings.push({
      severity: 'warn',
      area: 'visual-catalog',
      message: String(
        issue.message
          || 'Diagram surface lacks readable labels tied to catalog legend keys.',
      ),
      evidence: [
        kind,
        issue.key ? `key=${issue.key}` : '',
        issue.svg ? `svg=${issue.svg}` : '',
        issue.selectorHint ? `diagram=${issue.selectorHint}` : '',
        Number.isFinite(issue.matched) ? `matched=${issue.matched}` : '',
        Number.isFinite(issue.required) ? `required=${issue.required}` : '',
        url ? `url=${url}` : '',
      ]
        .filter(Boolean)
        .join(' '),
      remediation:
        remediationByKind[kind]
        || 'Ensure diagram SVG text nodes include catalog legend node labels for each data-diagram-key tile.',
    });
  }

  if (issues.length > MAX_DIAGRAM_LABELS_FINDINGS) {
    findings.push({
      severity: 'minor',
      area: 'visual-catalog',
      message: `Additional diagram label issues omitted (${issues.length - MAX_DIAGRAM_LABELS_FINDINGS} more).`,
      evidence: `diagram_labels_total=${issues.length}`,
      remediation: 'Open the diagram catalog modal and compare legend nodes to visible SVG/ASCII labels on the tile.',
    });
  }

  return findings;
}

/** @param {import('playwright').Page} page */
export async function collectDiagramLabelsReport(page) {
  return page.evaluate(
    async ({
      MIN_DIAGRAM_LABEL_CHARS,
      MIN_LEGEND_NODE_MATCHES,
      LEGEND_COVERAGE_RATIO,
      DIAGRAM_ROOT_SELECTOR,
      CHART_EXCLUDE_SELECTOR,
    }) => {
      const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();
      const normKey = (s) => norm(s).toLowerCase();

      const isReadable = (text) => {
        const raw = norm(text);
        if (raw.length < MIN_DIAGRAM_LABEL_CHARS) return false;
        if (/^\[[^\]]*\]$/.test(raw) && /subtitle|footer|note|title\s*-/i.test(raw)) return false;
        return true;
      };

      const requiredMatches = (legendCount) => {
        if (legendCount <= 0) return 0;
        return Math.max(
          MIN_LEGEND_NODE_MATCHES,
          Math.ceil(legendCount * LEGEND_COVERAGE_RATIO),
        );
      };

      const parseSvgText = (svgText) => {
        const out = [];
        const re = /<tspan[^>]*>([^<]*)<\/tspan>|<text[^>]*>([^<]*)<\/text>/gi;
        let m;
        while ((m = re.exec(String(svgText || ''))) !== null) {
          const t = norm(m[1] || m[2] || '');
          if (t) out.push(t);
        }
        return out;
      };

      const collectSvgElementTexts = (svg) => {
        const out = [];
        for (const node of svg.querySelectorAll('text, tspan')) {
          const t = norm(node.textContent || '');
          if (t) out.push(t);
        }
        return out;
      };

      const countMatches = (legendNodes, labelTexts) => {
        const labelNorm = new Set(
          labelTexts.map(normKey).filter((t) => t.length >= MIN_DIAGRAM_LABEL_CHARS),
        );
        let matched = 0;
        for (const node of legendNodes) {
          const n = normKey(node);
          if (n.length < MIN_DIAGRAM_LABEL_CHARS) continue;
          if (labelNorm.has(n)) {
            matched += 1;
            continue;
          }
          for (const label of labelNorm) {
            if (label.includes(n) || n.includes(label)) {
              matched += 1;
              break;
            }
          }
        }
        return matched;
      };

      const visible = (el) => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        return rect.width > 8 && rect.height > 8 && style.visibility !== 'hidden'
          && style.display !== 'none' && Number(style.opacity || 1) > 0.05;
      };

      const isHiddenSubtree = (el) => {
        let node = el;
        while (node && node.nodeType === 1) {
          if (node.hasAttribute('hidden')) return true;
          if (node.getAttribute('aria-hidden') === 'true') return true;
          const style = window.getComputedStyle(node);
          if (style.display === 'none' || style.visibility === 'hidden') return true;
          node = node.parentElement;
        }
        return false;
      };

      const catalog =
        window.__FORGE_KS_DIAGRAM_CATALOG && typeof window.__FORGE_KS_DIAGRAM_CATALOG === 'object'
          ? window.__FORGE_KS_DIAGRAM_CATALOG
          : null;

      const legendForKey = (key) => {
        if (!catalog || !key) return [];
        const entry = catalog[key];
        if (!entry || !Array.isArray(entry.items)) return [];
        return entry.items
          .map((item) => norm(item?.node || ''))
          .filter(Boolean);
      };

      const selectorHintFor = (el) => {
        const id = el.id ? `#${el.id}` : '';
        const cls = norm(el.className).split(' ').filter(Boolean).slice(0, 3).join('.');
        const key = el.getAttribute('data-diagram-key') || '';
        return `${el.tagName.toLowerCase()}${id}${cls ? `.${cls}` : ''}${key ? `[key=${key}]` : ''}`;
      };

      const textsFromRoot = async (root) => {
        const inline = root.querySelector('svg');
        if (inline) return collectSvgElementTexts(inline);

        const pre = root.querySelector('.forge-diagram-ascii-pre, pre');
        if (pre) {
          return norm(pre.textContent || '')
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => line.length >= MIN_DIAGRAM_LABEL_CHARS);
        }

        const img = root.querySelector('img[src]');
        if (!img) return [];
        try {
          const resp = await fetch(img.src);
          if (!resp.ok) return [];
          return parseSvgText(await resp.text());
        } catch {
          return [];
        }
      };

      /** @type {Array<Record<string, unknown>>} */
      const violations = [];
      const scanned = new Set();

      for (const root of document.querySelectorAll(DIAGRAM_ROOT_SELECTOR)) {
        if (!visible(root) || isHiddenSubtree(root)) continue;
        if (root.closest(CHART_EXCLUDE_SELECTOR)) continue;
        if (root.getAttribute('aria-hidden') === 'true' || root.getAttribute('role') === 'presentation') {
          continue;
        }

        const diagramKey = norm(root.getAttribute('data-diagram-key') || '');
        if (!diagramKey) continue;

        const hint = selectorHintFor(root);
        if (scanned.has(hint)) continue;
        scanned.add(hint);

        const legendNodes = legendForKey(diagramKey);
        if (!legendNodes.length) continue;

        // eslint-disable-next-line no-await-in-loop
        const labelTexts = await textsFromRoot(root);
        const readable = labelTexts.filter(isReadable);
        const required = requiredMatches(legendNodes.length);

        if (!readable.length) {
          violations.push({
            kind: 'diagram-labels-no-readable-text',
            selectorHint: hint,
            key: diagramKey,
            message: `Diagram "${diagramKey}" has no readable labels in SVG text or ASCII art tied to the catalog legend.`,
          });
          continue;
        }

        const matched = countMatches(legendNodes, readable);
        if (matched < required) {
          violations.push({
            kind: 'diagram-labels-legend-gap',
            selectorHint: hint,
            key: diagramKey,
            matched,
            required,
            legendCount: legendNodes.length,
            message: `Diagram "${diagramKey}" shows ${matched}/${required} required catalog legend node labels (${legendNodes.length} legend entries).`,
          });
        }
      }

      return {
        diagramCount: scanned.size,
        violations: violations.slice(0, 12),
      };
    },
    {
      MIN_DIAGRAM_LABEL_CHARS,
      MIN_LEGEND_NODE_MATCHES,
      LEGEND_COVERAGE_RATIO,
      DIAGRAM_ROOT_SELECTOR,
      CHART_EXCLUDE_SELECTOR,
    },
  );
}

export async function run({ metrics, page, url, repoRoot, ctx }) {
  const root = String(repoRoot || ctx?.repoRoot || metrics?.repoRoot || '').trim();
  const pageUrl = url || metrics?.url || '';

  const repoReport = root
    ? metrics?.diagramLabelsRepoReport ?? scanRepoDiagramLabels(root)
    : null;

  const domReport =
    metrics?.diagramLabelsReport ?? (page ? await collectDiagramLabelsReport(page) : null);

  const combined = {
    violations: [
      ...(domReport?.violations || []),
    ],
    repoIssues: repoReport && !repoReport.skipped ? repoReport.issues || [] : [],
  };

  if (!combined.violations.length && !combined.repoIssues.length) return [];
  return findingsFromDiagramLabelsReport(combined, { url: pageUrl });
}
