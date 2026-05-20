/**
 * DET.CHART.ALT_SUMMARY — chart/graph exposes a text summary, aria-describedby, or nearby caption.
 */

/** Minimum characters for an accessible chart summary or caption. */
export const MIN_CHART_SUMMARY_CHARS = 8;

const CHART_ROOT_SELECTOR = [
  '[data-ks-chart]',
  '.ks-chart-mount',
  '[data-chart]',
  '.chart',
  '[class*="chart-container"]',
  '[class*="chart-mount"]',
].join(',');

const AMBIENT_EXCLUDE_SELECTOR = [
  '.forge-ambient-bg',
  '.ks-ambient-bg',
  '.forge-aurora',
  '.ks-living-scene__global',
  '[aria-hidden="true"]',
].join(',');

export const rule = {
  id: 'DET.CHART.ALT_SUMMARY',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'accessibility',
  scoreDimension: 'accessibilitySemanticsMeta',
  defaultSeverity: 'major',
  priorityWeight: 7,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-chart-alt-summary',
};

/**
 * @param {{ violations?: Array<Record<string, unknown>> } | null | undefined} report
 * @param {string} [url]
 */
export function findingsFromChartAltSummaryReport(report, url = '') {
  const violations = Array.isArray(report?.violations) ? report.violations : [];
  if (!violations.length) return [];

  const findings = [];
  const seen = new Set();

  for (const v of violations.slice(0, 8)) {
    const hint = String(v.selectorHint || v.kind || 'chart').slice(0, 120);
    if (seen.has(hint)) continue;
    seen.add(hint);

    findings.push({
      severity: 'major',
      area: 'accessibility',
      message:
        'A chart or graph lacks a text summary, aria-describedby target, or nearby caption for non-visual readers.',
      evidence: `missing_chart_alt_summary chart="${hint}"`,
      remediation:
        'Add a visible caption, figcaption, sr-only summary, or wire aria-label / aria-describedby on the chart root or rendered SVG/canvas.',
    });
  }

  if (url) {
    for (const finding of findings) {
      finding.evidence = `${finding.evidence} url=${url}`;
    }
  }

  return findings;
}

/** @param {import('playwright').Page} page */
export async function collectChartAltSummaryReport(page, minSummaryChars = MIN_CHART_SUMMARY_CHARS) {
  return page.evaluate(
    ({ minSummaryChars, CHART_ROOT_SELECTOR, AMBIENT_EXCLUDE_SELECTOR }) => {
      const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();

      const visible = (el) => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        return rect.width > 8 && rect.height > 8 && style.visibility !== 'hidden'
          && style.display !== 'none' && Number(style.opacity || 1) > 0.05;
      };

      const isHiddenSubtree = (el) => {
        let node = el;
        while (node && node.nodeType === 1) {
          if (node.getAttribute('aria-hidden') === 'true') return true;
          const style = window.getComputedStyle(node);
          if (style.display === 'none' || style.visibility === 'hidden') return true;
          node = node.parentElement;
        }
        return false;
      };

      const excludedAmbient = (el) => Boolean(el.closest(AMBIENT_EXCLUDE_SELECTOR));

      const textLen = (el) => {
        if (!el || el.nodeType !== 1) return 0;
        return norm(el.innerText || el.textContent || el.getAttribute('aria-label') || '').length;
      };

      const idsHaveSummary = (idList) => {
        if (!idList) return false;
        for (const id of String(idList).split(/\s+/)) {
          const ref = id && document.getElementById(id);
          if (textLen(ref) >= minSummaryChars) return true;
        }
        return false;
      };

      const nearbyCaption = (el) => {
        const captionish = (node) => {
          if (!node || node.nodeType !== 1) return false;
          if (!node.matches(
            'figcaption, caption, p, .caption, [class*="caption"], [class*="chart-summary"], '
            + '[data-chart-summary], .forge-support, .chart-description',
          )) return false;
          return textLen(node) >= minSummaryChars;
        };

        const fig = el.closest('figure');
        if (fig) {
          const cap = fig.querySelector('figcaption');
          if (captionish(cap)) return true;
        }

        let prev = el.previousElementSibling;
        for (let i = 0; i < 2 && prev; i += 1) {
          if (captionish(prev)) return true;
          prev = prev.previousElementSibling;
        }

        let next = el.nextElementSibling;
        for (let i = 0; i < 2 && next; i += 1) {
          if (captionish(next)) return true;
          next = next.nextElementSibling;
        }

        return false;
      };

      const chartHasAccessibleSummary = (root) => {
        const targets = [root, ...root.querySelectorAll('svg, canvas, img, [role="img"]')];
        for (const el of targets) {
          if (!el || el.nodeType !== 1) continue;

          const ariaLabel = norm(el.getAttribute('aria-label') || el.getAttribute('alt') || '');
          if (ariaLabel.length >= minSummaryChars) return true;

          if (idsHaveSummary(el.getAttribute('aria-labelledby'))) return true;
          if (idsHaveSummary(el.getAttribute('aria-describedby'))) return true;

          const title = norm(el.getAttribute('title') || '');
          if (title.length >= minSummaryChars) return true;
        }

        const hidden = root.querySelector(
          '.sr-only, .visually-hidden, [class*="chart-summary"], [data-chart-summary]',
        );
        if (textLen(hidden) >= minSummaryChars) return true;

        if (nearbyCaption(root)) return true;

        const parent = root.parentElement;
        if (parent && idsHaveSummary(parent.getAttribute('aria-describedby'))) return true;

        return false;
      };

      const isChartRoot = (el) => {
        if (!el || el.nodeType !== 1 || !visible(el) || isHiddenSubtree(el) || excludedAmbient(el)) {
          return false;
        }

        if (el.matches('[data-ks-chart], .ks-chart-mount, [data-chart]')) return true;

        const tag = el.tagName.toLowerCase();
        const cls = String(el.className || '').toLowerCase();
        if (/\bchart\b|\bchart-container\b|\bchart-mount\b/.test(cls)) return true;

        if (tag === 'canvas') {
          const rect = el.getBoundingClientRect();
          if (rect.width < 48 || rect.height < 48) return false;
          const style = window.getComputedStyle(el);
          const z = Number.parseInt(String(style.zIndex || '0'), 10) || 0;
          if (style.pointerEvents === 'none' && z <= 1 && el.closest('.forge-ambient, .ks-has-ambient-bg')) {
            return false;
          }
          return Boolean(el.closest('[data-ks-chart], .ks-chart-mount, [data-chart], .chart, [class*="chart"]'));
        }

        if (tag === 'svg' && el.getAttribute('role') === 'img') {
          return Boolean(el.closest('[data-ks-chart], .ks-chart-mount, [data-chart], .chart, [class*="chart"]'));
        }

        return false;
      };

      const selectorHintFor = (el) => {
        const id = el.id ? `#${el.id}` : '';
        const cls = norm(el.className).split(' ').filter(Boolean).slice(0, 3).join('.');
        const kind = el.getAttribute('data-ks-chart-kind') || el.getAttribute('data-chart') || '';
        const hash = el.getAttribute('data-ks-hash') || el.getAttribute('hash') || '';
        return `${el.tagName.toLowerCase()}${id}${cls ? `.${cls}` : ''}${kind ? `[kind=${kind}]` : ''}${hash ? `[@${hash}]` : ''}`;
      };

      /** @type {Array<Record<string, unknown>>} */
      const violations = [];
      const scanned = new Set();

      for (const candidate of document.querySelectorAll(CHART_ROOT_SELECTOR)) {
        if (!isChartRoot(candidate)) continue;
        const key = selectorHintFor(candidate);
        if (scanned.has(key)) continue;
        scanned.add(key);
        if (chartHasAccessibleSummary(candidate)) continue;

        violations.push({
          kind: 'missing-chart-alt-summary',
          selectorHint: key,
          className: norm(candidate.className).slice(0, 120),
        });
      }

      for (const canvas of document.querySelectorAll('canvas')) {
        if (!isChartRoot(canvas)) continue;
        const key = selectorHintFor(canvas);
        if (scanned.has(key)) continue;
        scanned.add(key);
        if (chartHasAccessibleSummary(canvas)) continue;

        violations.push({
          kind: 'missing-chart-alt-summary',
          selectorHint: key,
          className: norm(canvas.className).slice(0, 120),
        });
      }

      for (const svg of document.querySelectorAll('svg[role="img"]')) {
        if (!isChartRoot(svg)) continue;
        const mount = svg.closest('[data-ks-chart], .ks-chart-mount, [data-chart], .chart, [class*="chart"]') || svg;
        const key = selectorHintFor(mount);
        if (scanned.has(key)) continue;
        scanned.add(key);
        if (chartHasAccessibleSummary(mount)) continue;

        violations.push({
          kind: 'missing-chart-alt-summary',
          selectorHint: key,
          className: norm(mount.className).slice(0, 120),
        });
      }

      return {
        minSummaryChars,
        chartCount: scanned.size,
        violations: violations.slice(0, 12),
      };
    },
    { minSummaryChars, CHART_ROOT_SELECTOR, AMBIENT_EXCLUDE_SELECTOR },
  );
}

export async function run({ metrics, page, url }) {
  const report = metrics?.chartAltSummaryReport
    ?? (page ? await collectChartAltSummaryReport(page) : null);
  if (!report || !(report.violations || []).length) return [];
  return findingsFromChartAltSummaryReport(report, url || metrics?.url || '');
}
