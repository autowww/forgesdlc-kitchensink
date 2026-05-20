/**
 * DET.DATA.COLOR_ONLY — meaning is not conveyed by color alone where a legend/swatch is detectable.
 */

/** Minimum characters for a redundant text label beside a color swatch or encoded cell. */
export const MIN_COLOR_LABEL_CHARS = 2;

const DATA_CONTEXT_SELECTOR = [
  '[data-ks-chart]',
  '.ks-chart-mount',
  '[data-chart]',
  '.chart',
  '[class*="chart"]',
  '[class*="heatmap"]',
  '[class*="legend"]',
  '.ks-swatch',
  'figure',
  'table',
].join(',');

const SWATCH_SELECTOR = [
  '.ks-swatch-box',
  '.lenses-overview-donut-swatch',
  '[class*="swatch"]',
  '[class*="legend-mark"]',
  '[class*="series-color"]',
  '[class*="color-dot"]',
  '[class*="status-dot"]',
].join(',');

export const rule = {
  id: 'DET.DATA.COLOR_ONLY',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'accessibility',
  scoreDimension: 'accessibilitySemanticsMeta',
  defaultSeverity: 'major',
  priorityWeight: 7,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-data-color_only',
};

/**
 * @param {{ violations?: Array<Record<string, unknown>>, minLabelChars?: number } | null | undefined} report
 * @param {string} [url]
 */
export function findingsFromColorOnlyReport(report, url = '') {
  const violations = Array.isArray(report?.violations) ? report.violations : [];
  if (!violations.length) return [];

  const findings = [];
  const seen = new Set();

  for (const v of violations.slice(0, 10)) {
    const kind = String(v.kind || 'color-only-encoding');
    const hint = String(v.selectorHint || v.region || 'data').slice(0, 120);
    const key = `${kind}:${hint}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const region = String(v.region || 'data visualization');
    findings.push({
      severity: kind === 'ks-swatch-missing-label' ? 'major' : 'warn',
      area: 'accessibility',
      message:
        `A ${region} relies on color alone; add a text label, pattern, or icon beside each color swatch or encoded value.`,
      evidence: `color_only_encoding kind=${kind} target="${hint}"`,
      remediation:
        'Pair each color swatch with visible text (legend row, .ks-swatch-label, aria-label), or add non-color cues such as patterns, icons, or value labels in table cells.',
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
export async function collectColorOnlyReport(page, minLabelChars = MIN_COLOR_LABEL_CHARS) {
  return page.evaluate(
    ({ minLabelChars, DATA_CONTEXT_SELECTOR, SWATCH_SELECTOR }) => {
      const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();

      const visible = (el) => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        return rect.width > 2 && rect.height > 2 && style.visibility !== 'hidden'
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

      const textLen = (el) => {
        if (!el || el.nodeType !== 1) return 0;
        return norm(
          el.innerText || el.textContent || el.getAttribute('aria-label') || el.getAttribute('title') || '',
        ).length;
      };

      const parseRgb = (value) => {
        const m = String(value || '').match(/rgba?\(([^)]+)\)/i);
        if (!m) return null;
        const parts = m[1].split(',').map((p) => Number.parseFloat(p.trim()));
        if (parts.length < 3 || parts.some((p, idx) => idx < 3 && !Number.isFinite(p))) return null;
        if (parts.length >= 4 && parts[3] === 0) return null;
        return parts.slice(0, 3);
      };

      const hasMeaningfulBackground = (el) => {
        const style = window.getComputedStyle(el);
        const bg = parseRgb(style.backgroundColor);
        if (bg) return true;
        const inline = String(el.getAttribute('style') || '').toLowerCase();
        return /background(-color)?\s*:/.test(inline);
      };

      const selectorHintFor = (el) => {
        const id = el.id ? `#${el.id}` : '';
        const cls = norm(el.className).split(' ').filter(Boolean).slice(0, 3).join('.');
        const hash = el.getAttribute('data-ks-hash') || el.getAttribute('hash') || '';
        return `${el.tagName.toLowerCase()}${id}${cls ? `.${cls}` : ''}${hash ? `[@${hash}]` : ''}`;
      };

      const inDataContext = (el) => Boolean(el.closest(DATA_CONTEXT_SELECTOR));

      const rowContainerFor = (swatch) => swatch.closest(
        'li, tr, .ks-swatch, .d-flex, .legend-item, [class*="legend-item"], '
        + '[class*="legend-row"], [class*="donut-legend"] > div',
      ) || swatch.parentElement;

      const rowHasNonColorLabel = (swatch) => {
        const direct = norm(
          swatch.getAttribute('aria-label') || swatch.getAttribute('title') || '',
        );
        if (direct.length >= minLabelChars) return true;

        const row = rowContainerFor(swatch);
        if (!row) return false;

        const rowAria = norm(row.getAttribute('aria-label') || row.getAttribute('title') || '');
        if (rowAria.length >= minLabelChars) return true;

        const ksLabel = row.querySelector('.ks-swatch-label');
        if (textLen(ksLabel) >= minLabelChars) return true;

        for (const child of row.children) {
          if (child === swatch || swatch.contains(child)) continue;
          if (child.matches(SWATCH_SELECTOR) || child.querySelector(SWATCH_SELECTOR)) continue;
          if (textLen(child) >= minLabelChars) return true;
        }

        const title = swatch.querySelector('title');
        if (textLen(title) >= minLabelChars) return true;

        return false;
      };

      const isColorSwatch = (el) => {
        if (!el || el.nodeType !== 1 || !visible(el) || isHiddenSubtree(el)) return false;
        if (!inDataContext(el)) return false;

        const cls = String(el.className || '').toLowerCase();
        if (el.matches(SWATCH_SELECTOR)) return true;
        if (/\bswatch\b|\bseries-?color\b|\bcolor-?dot\b|\bstatus-?dot\b|\blegend-?mark\b/.test(cls)) {
          return true;
        }

        const rect = el.getBoundingClientRect();
        if (rect.width > 28 || rect.height > 28) return false;
        if (textLen(el) >= minLabelChars) return false;
        if (!hasMeaningfulBackground(el)) return false;
        return rect.width >= 4 && rect.height >= 4;
      };

      const ksSwatchMissingLabel = (root) => {
        if (!root.matches?.('.ks-swatch') || !visible(root) || isHiddenSubtree(root)) return false;
        const label = root.querySelector('.ks-swatch-label');
        return textLen(label) < minLabelChars;
      };

      const tableCellColorOnly = (cell) => {
        if (!cell || cell.nodeType !== 1 || !visible(cell) || isHiddenSubtree(cell)) return false;
        if (textLen(cell) >= minLabelChars) return false;
        const aria = norm(cell.getAttribute('aria-label') || '');
        if (aria.length >= minLabelChars) return false;
        if (!hasMeaningfulBackground(cell)) return false;

        const table = cell.closest('table');
        if (!table || !inDataContext(table)) return false;
        const headerRow = table.querySelector('thead tr, tr:first-child');
        const headers = headerRow
          ? Array.from(headerRow.querySelectorAll('th, td')).map((h) => textLen(h)).filter((n) => n >= minLabelChars)
          : [];
        if (!headers.length) return false;
        return true;
      };

      /** @type {Array<Record<string, unknown>>} */
      const violations = [];
      const scanned = new Set();

      const pushViolation = (kind, el, region) => {
        const hint = selectorHintFor(el);
        const key = `${kind}:${hint}`;
        if (scanned.has(key)) return;
        scanned.add(key);
        violations.push({
          kind,
          region,
          selectorHint: hint,
          className: norm(el.className).slice(0, 120),
        });
      };

      for (const swatchRoot of document.querySelectorAll('.ks-swatch')) {
        if (!ksSwatchMissingLabel(swatchRoot)) continue;
        pushViolation('ks-swatch-missing-label', swatchRoot, 'token swatch');
      }

      for (const swatch of document.querySelectorAll(SWATCH_SELECTOR)) {
        if (swatch.closest('.ks-swatch')) continue;
        if (!isColorSwatch(swatch)) continue;
        if (rowHasNonColorLabel(swatch)) continue;
        pushViolation('legend-swatch-without-label', swatch, 'chart or legend row');
      }

      for (const cell of document.querySelectorAll('td, th')) {
        if (!tableCellColorOnly(cell)) continue;
        pushViolation('table-cell-color-only', cell, 'data table cell');
      }

      return {
        minLabelChars,
        scannedSwatches: scanned.size,
        violations: violations.slice(0, 12),
      };
    },
    { minLabelChars, DATA_CONTEXT_SELECTOR, SWATCH_SELECTOR },
  );
}

export async function run({ metrics, page, url }) {
  const report = metrics?.colorOnlyReport
    ?? (page ? await collectColorOnlyReport(page) : null);
  if (!report || !(report.violations || []).length) return [];
  return findingsFromColorOnlyReport(report, url || metrics?.url || '');
}
