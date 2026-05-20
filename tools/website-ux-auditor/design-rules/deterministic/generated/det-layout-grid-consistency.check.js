/**
 * DET.LAYOUT.GRID_CONSISTENCY — body copy aligns to layout grid (max width, gutters);
 * no accidental full-bleed text rivers in main content.
 */

/** Minimum words for a paragraph to count as substantive prose. */
export const MIN_PROSE_WORDS = 32;

/** Paragraph width vs main column — at or above suggests a full-bleed river. */
export const MAIN_WIDTH_BLEED_RATIO = 0.88;

/** Paragraph width vs viewport — catches rivers when main itself is unconstrained. */
export const VIEWPORT_WIDTH_BLEED_RATIO = 0.82;

/** Max comfortable paragraph measure (px); aligns with KS doc-content ~56rem. */
export const MAX_PROSE_MEASURE_PX = 920;

/** Max left-edge spread (px) among prose in the same section before gutter drift fires. */
export const SECTION_LEFT_EDGE_TOLERANCE_PX = 56;

const GRID_CONTAINER_SELECTOR = [
  '.container',
  '.container-fluid',
  '.doc-content',
  '.mx-auto',
  '[class*="content-col"]',
  '.fs-main-inner',
  '.landing-section-inner',
  '.col',
  '.row > *',
].join(',');

const PROSE_EXCLUDE_SELECTOR = [
  '.landing-hero',
  '.landing-hero-wide',
  '.landing-hero-grid-wrap',
  '.product-hero',
  '[class*="hero-band"]',
  'pre',
  'code',
  'table',
  '.table',
  '.offcanvas',
  '.modal',
  '[role="dialog"]',
  '[aria-modal="true"]',
  '.diagram-modal',
  '[class*="full-bleed"]',
  '[class*="bleed-"]',
  '[data-full-bleed]',
].join(',');

/**
 * @param {{
 *   wordCount: number;
 *   inGridContainer: boolean;
 *   excludedRegion: boolean;
 *   paragraphWidthPx: number;
 *   mainWidthPx: number;
 *   viewportWidthPx: number;
 * }} sample
 */
export function isFullBleedProseRiver(sample) {
  if (sample.excludedRegion) return false;
  if (sample.inGridContainer) return false;
  if (sample.wordCount < MIN_PROSE_WORDS) return false;
  const { paragraphWidthPx, mainWidthPx, viewportWidthPx } = sample;
  if (!Number.isFinite(paragraphWidthPx) || paragraphWidthPx < 320) return false;
  const mainWide = Number.isFinite(mainWidthPx) && mainWidthPx > 0
    && paragraphWidthPx >= mainWidthPx * MAIN_WIDTH_BLEED_RATIO;
  const viewportWide = Number.isFinite(viewportWidthPx) && viewportWidthPx > 0
    && paragraphWidthPx >= viewportWidthPx * VIEWPORT_WIDTH_BLEED_RATIO;
  return mainWide || viewportWide;
}

/**
 * @param {number[]} leftEdgesPx
 * @param {number} [tolerancePx]
 */
export function sectionHasGutterDrift(leftEdgesPx, tolerancePx = SECTION_LEFT_EDGE_TOLERANCE_PX) {
  const edges = (leftEdgesPx || []).filter((n) => Number.isFinite(n));
  if (edges.length < 2) return false;
  const min = Math.min(...edges);
  const max = Math.max(...edges);
  return max - min > tolerancePx;
}

/**
 * @param {{ violations?: Array<Record<string, unknown>> } | null | undefined} report
 * @param {string} [url]
 */
export function findingsFromLayoutGridReport(report, url = '') {
  const violations = Array.isArray(report?.violations) ? report.violations : [];
  if (!violations.length) return [];

  const findings = [];
  const seen = new Set();

  for (const v of violations.slice(0, 8)) {
    const kind = String(v.kind || 'grid');
    const hint = String(v.selectorHint || v.sectionHint || 'main').slice(0, 120);
    const key = `${kind}:${hint}`;
    if (seen.has(key)) continue;
    seen.add(key);

    if (kind === 'full-bleed-prose') {
      findings.push({
        severity: 'warn',
        area: 'readability',
        message:
          'Substantive body copy spans nearly the full main column without a layout grid container (accidental text river).',
        evidence: `full_bleed_prose hint="${hint}" width_px=${v.paragraphWidthPx ?? '?'} words=${v.wordCount ?? '?'}`,
        remediation:
          'Wrap long-form prose in `.container`, `.doc-content`, or a max-width column; use full-bleed only for heroes, diagrams, and intentional wide bands.',
      });
    } else if (kind === 'gutter-drift') {
      findings.push({
        severity: 'minor',
        area: 'readability',
        message:
          'Prose blocks in the same section use inconsistent horizontal inset (gutter/grid drift).',
        evidence: `gutter_drift section="${hint}" left_spread_px=${v.leftSpreadPx ?? '?'}`,
        remediation:
          'Align section copy to one grid track: shared `.container` / `.doc-content` padding and matching left edges for paragraphs and lists.',
      });
    } else if (kind === 'excessive-measure') {
      findings.push({
        severity: 'minor',
        area: 'readability',
        message:
          'Measured paragraph line length exceeds the layout grid reading measure.',
        evidence: `excessive_measure hint="${hint}" width_px=${v.paragraphWidthPx ?? '?'} max=${MAX_PROSE_MEASURE_PX}`,
        remediation:
          'Constrain body copy with the documented max-width token (e.g. `doc-content` / ~56rem) so line length stays within the layout grid.',
      });
    }
  }

  if (url) {
    for (const finding of findings) {
      finding.evidence = `${finding.evidence} url=${url}`;
    }
  }

  return findings;
}

/** @param {import('playwright').Page} page */
export async function collectLayoutGridConsistencyReport(page) {
  return page.evaluate(
    ({
      MIN_PROSE_WORDS,
      MAIN_WIDTH_BLEED_RATIO,
      VIEWPORT_WIDTH_BLEED_RATIO,
      MAX_PROSE_MEASURE_PX,
      SECTION_LEFT_EDGE_TOLERANCE_PX,
      GRID_CONTAINER_SELECTOR,
      PROSE_EXCLUDE_SELECTOR,
    }) => {
      const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();
      const words = (s) => norm(s).split(/\s+/).filter(Boolean);

      const visible = (el) => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        return rect.width > 40 && rect.height > 8 && style.visibility !== 'hidden'
          && style.display !== 'none' && Number(style.opacity || 1) > 0.05;
      };

      const textOf = (el) => norm(el.innerText || el.textContent || '');

      const main = document.querySelector('main#main') || document.querySelector('main');
      if (!main || !visible(main)) {
        return { proseSampleCount: 0, violations: [] };
      }

      const mainRect = main.getBoundingClientRect();
      const mainWidthPx = Math.round(mainRect.width);
      const viewportWidthPx = window.innerWidth;

      const excludedSubtree = (el) => !!el.closest(PROSE_EXCLUDE_SELECTOR);

      const hasGridAncestor = (el) => {
        let node = el.parentElement;
        while (node && node !== main && main.contains(node)) {
          if (node.matches(GRID_CONTAINER_SELECTOR)) return true;
          const cls = String(node.className || '').toLowerCase();
          if (/\b(container|doc-content|content-col|reading|prose|narrow)\b/.test(cls)) return true;
          const style = window.getComputedStyle(node);
          const mw = style.maxWidth;
          if (mw && mw !== 'none') {
            const px = Number.parseFloat(mw);
            if (Number.isFinite(px) && px >= 280 && px < viewportWidthPx * 0.92) return true;
          }
          node = node.parentElement;
        }
        return false;
      };

      const sectionKeyFor = (el) => {
        const section = el.closest('section, article, [class*="section"], .landing-section');
        if (section && main.contains(section)) {
          const id = section.id ? `#${section.id}` : '';
          const cls = norm(section.className).split(' ').filter(Boolean).slice(0, 2).join('.');
          return `${section.tagName.toLowerCase()}${id}${cls ? `.${cls}` : ''}`;
        }
        return 'main';
      };

      const selectorHintFor = (el) => {
        const id = el.id ? `#${el.id}` : '';
        const cls = norm(el.className).split(' ').filter(Boolean).slice(0, 2).join('.');
        const hash = el.getAttribute('data-ks-hash') || el.getAttribute('hash') || '';
        return `p${id}${cls ? `.${cls}` : ''}${hash ? `[@${hash}]` : ''}`;
      };

      /** @type {Array<Record<string, unknown>>} */
      const violations = [];
      const seenRiver = new Set();

      /** @type {Map<string, number[]>} */
      const sectionLeftEdges = new Map();

      for (const el of main.querySelectorAll('p')) {
        if (!visible(el) || excludedSubtree(el)) continue;
        const wordCount = words(textOf(el)).length;
        if (wordCount < MIN_PROSE_WORDS) continue;

        const rect = el.getBoundingClientRect();
        const paragraphWidthPx = Math.round(rect.width);
        const inGridContainer = hasGridAncestor(el);
        const excludedRegion = excludedSubtree(el);

        const river = (() => {
          if (excludedRegion || inGridContainer) return false;
          const mainWide = paragraphWidthPx >= mainWidthPx * MAIN_WIDTH_BLEED_RATIO;
          const viewportWide = paragraphWidthPx >= viewportWidthPx * VIEWPORT_WIDTH_BLEED_RATIO;
          return mainWide || viewportWide;
        })();

        if (river) {
          const hint = selectorHintFor(el);
          if (!seenRiver.has(hint)) {
            seenRiver.add(hint);
            violations.push({
              kind: 'full-bleed-prose',
              selectorHint: hint,
              paragraphWidthPx,
              wordCount,
              mainWidthPx,
            });
          }
        }

        if (inGridContainer && paragraphWidthPx > MAX_PROSE_MEASURE_PX) {
          const hint = selectorHintFor(el);
          const key = `measure:${hint}`;
          if (!seenRiver.has(key)) {
            seenRiver.add(key);
            violations.push({
              kind: 'excessive-measure',
              selectorHint: hint,
              paragraphWidthPx,
              wordCount,
            });
          }
        }

        const sec = sectionKeyFor(el);
        const left = Math.round(rect.left);
        if (!sectionLeftEdges.has(sec)) sectionLeftEdges.set(sec, []);
        sectionLeftEdges.get(sec).push(left);
      }

      for (const [sectionHint, edges] of sectionLeftEdges.entries()) {
        if (edges.length < 2) continue;
        const min = Math.min(...edges);
        const max = Math.max(...edges);
        const leftSpreadPx = max - min;
        if (leftSpreadPx > SECTION_LEFT_EDGE_TOLERANCE_PX) {
          violations.push({
            kind: 'gutter-drift',
            sectionHint,
            leftSpreadPx,
            leftEdgeMinPx: min,
            leftEdgeMaxPx: max,
          });
        }
      }

      return {
        proseSampleCount: sectionLeftEdges.size,
        violations: violations.slice(0, 10),
      };
    },
    {
      MIN_PROSE_WORDS,
      MAIN_WIDTH_BLEED_RATIO,
      VIEWPORT_WIDTH_BLEED_RATIO,
      MAX_PROSE_MEASURE_PX,
      SECTION_LEFT_EDGE_TOLERANCE_PX,
      GRID_CONTAINER_SELECTOR,
      PROSE_EXCLUDE_SELECTOR,
    },
  );
}

export const rule = {
  id: 'DET.LAYOUT.GRID_CONSISTENCY',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'readability',
  scoreDimension: 'visualRhythmFirstScreen',
  defaultSeverity: 'warn',
  priorityWeight: 7,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-layout-grid_consistency',
};

export async function run({ metrics, page, url }) {
  const report = metrics?.layoutGridConsistencyReport
    ?? (page ? await collectLayoutGridConsistencyReport(page) : null);
  if (!report || !(report.violations || []).length) return [];
  return findingsFromLayoutGridReport(report, url || metrics?.url || '');
}
