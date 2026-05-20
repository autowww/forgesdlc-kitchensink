/**
 * DET.VISUAL.RHYTHM — repeated vertical spacing between sections uses shared rhythm
 * (CSS variables / spacing utilities / 8px grid), not ad hoc arbitrary gaps.
 */

/** Minimum visible sections before rhythm heuristics apply. */
export const MIN_SECTIONS_FOR_RHYTHM = 4;

/** Enterprise section stack median gap (px); aligns with first-screen cramped threshold. */
export const MIN_MEDIAN_GAP_PX = 32;

/** Relative spread (max−min)/median above which gaps look token-inconsistent. */
export const GAP_SPREAD_RATIO_MAX = 0.55;

/** Minimum median gap (px) before spread ratio is evaluated (avoids noise on tiny stacks). */
export const MIN_MEDIAN_FOR_SPREAD_CHECK_PX = 24;

/** Max ad hoc spacing findings per pass. */
export const MAX_ADHOC_SPACING_FINDINGS = 6;

const SECTION_SELECTOR = [
  'section',
  'article',
  '.landing-section',
  '.fs-landing-section',
  '[class*="section-"]',
].join(',');

const SECTION_EXCLUDE_SELECTOR = [
  '.offcanvas',
  '.modal',
  '[role="dialog"]',
  '[aria-modal="true"]',
  'nav',
  'header',
  'footer',
  'aside',
].join(',');

const SPACING_UTILITY_CLASS_RX =
  /\b(?:py-|pt-|pb-|my-|mt-|mb-|gap-|gapy-|section-padding|landing-section|fs-landing-section|forge-section|ks-section)\b/i;

/**
 * @param {number[]} values
 */
export function medianOf(values) {
  const nums = (values || []).filter((n) => Number.isFinite(n));
  if (!nums.length) return null;
  const sorted = [...nums].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

/**
 * @param {number | null | undefined} medianGapPx
 * @param {number} sectionCount
 */
export function isCrampedSectionRhythm(medianGapPx, sectionCount) {
  if (sectionCount < MIN_SECTIONS_FOR_RHYTHM) return false;
  if (typeof medianGapPx !== 'number' || medianGapPx <= 0) return false;
  return medianGapPx < MIN_MEDIAN_GAP_PX;
}

/**
 * @param {number[]} gapsPx
 * @param {number | null | undefined} medianGapPx
 */
export function hasInconsistentSectionGaps(gapsPx, medianGapPx) {
  const gaps = (gapsPx || []).filter((n) => Number.isFinite(n) && n > 8);
  if (gaps.length < MIN_SECTIONS_FOR_RHYTHM - 1) return false;
  const median = typeof medianGapPx === 'number' && medianGapPx > 0
    ? medianGapPx
    : medianOf(gaps);
  if (median == null || median < MIN_MEDIAN_FOR_SPREAD_CHECK_PX) return false;
  const min = Math.min(...gaps);
  const max = Math.max(...gaps);
  return (max - min) / median > GAP_SPREAD_RATIO_MAX;
}

/**
 * @param {string} computed
 */
export function isTokenizedSpacingValue(computed) {
  const raw = String(computed || '').trim().toLowerCase();
  if (!raw || raw === '0' || raw === '0px') return true;
  if (/\bvar\s*\(/i.test(raw)) return true;
  if (/^calc\s*\(/i.test(raw) && /\bvar\s*\(/i.test(raw)) return true;
  if (/^[\d.]+rem$/.test(raw) || /^[\d.]+em$/.test(raw)) return true;
  const pxMatch = raw.match(/^([\d.]+)px$/);
  if (pxMatch) {
    const px = Number.parseFloat(pxMatch[1]);
    return Number.isFinite(px) && px % 4 === 0;
  }
  return false;
}

/**
 * @param {{
 *   sectionMedianGapPx?: number | null;
 *   sectionGapSpreadPx?: number | null;
 *   sectionCount?: number;
 *   sectionGapsPx?: number[];
 *   adhocSpacingHints?: string[];
 * }} snapshot
 */
export function buildVisualRhythmViolations(snapshot) {
  const violations = [];
  const sectionCount = Number(snapshot?.sectionCount || 0);
  const median = typeof snapshot?.sectionMedianGapPx === 'number'
    ? snapshot.sectionMedianGapPx
    : medianOf(snapshot?.sectionGapsPx || []);
  const gaps = Array.isArray(snapshot?.sectionGapsPx) ? snapshot.sectionGapsPx : [];

  if (isCrampedSectionRhythm(median, sectionCount)) {
    violations.push({
      kind: 'cramped-median-gap',
      sectionMedianGapPx: median,
      sectionCount,
    });
  }

  const spread = typeof snapshot?.sectionGapSpreadPx === 'number'
    ? snapshot.sectionGapSpreadPx
    : (gaps.length >= 2 ? Math.max(...gaps) - Math.min(...gaps) : null);

  if (hasInconsistentSectionGaps(gaps, median)) {
    violations.push({
      kind: 'gap-inconsistency',
      sectionMedianGapPx: median,
      sectionGapSpreadPx: spread,
      sectionCount,
    });
  }

  for (const hint of (snapshot?.adhocSpacingHints || []).slice(0, MAX_ADHOC_SPACING_FINDINGS)) {
    violations.push({
      kind: 'adhoc-section-spacing',
      selectorHint: hint,
    });
  }

  return violations;
}

/**
 * @param {Record<string, unknown> | null | undefined} metrics
 * @param {{ sectionGapsPx?: number[]; adhocSpacingHints?: string[] } | null | undefined} report
 */
export function buildVisualRhythmSnapshot(metrics, report = null) {
  const m = metrics || {};
  const gaps = Array.isArray(report?.sectionGapsPx) ? report.sectionGapsPx : [];
  const sectionCount = typeof m.sections?.length === 'number'
    ? m.sections.length
    : (report?.sectionCount ?? gaps.length + 1);

  const medianFromGaps = medianOf(gaps);
  const medianFromMetrics = typeof m.sectionMedianGapPx === 'number' ? m.sectionMedianGapPx : null;
  const medianGapPx = medianFromGaps ?? medianFromMetrics;
  const sectionGapSpreadPx = gaps.length >= 2 ? Math.max(...gaps) - Math.min(...gaps) : null;

  return {
    sectionCount,
    sectionMedianGapPx: medianGapPx,
    sectionGapSpreadPx,
    sectionGapsPx: gaps.length ? gaps : undefined,
    adhocSpacingHints: Array.isArray(report?.adhocSpacingHints) ? report.adhocSpacingHints : [],
  };
}

/**
 * @param {{ violations?: Array<Record<string, unknown>> } | null | undefined} report
 * @param {string} [url]
 */
export function findingsFromVisualRhythmReport(report, url = '') {
  const violations = Array.isArray(report?.violations) ? report.violations : [];
  if (!violations.length) return [];

  const findings = [];
  const seen = new Set();

  for (const v of violations.slice(0, 8)) {
    const kind = String(v.kind || 'rhythm');
    const hint = String(v.selectorHint || kind).slice(0, 120);
    const key = `${kind}:${hint}`;
    if (seen.has(key)) continue;
    seen.add(key);

    if (kind === 'cramped-median-gap') {
      findings.push({
        severity: 'major',
        area: 'first-screen',
        message:
          'Vertical spacing between sections is tighter than the shared rhythm scale (cramped section stack).',
        evidence:
          `cramped_median_gap section_median_gap_px=${v.sectionMedianGapPx ?? '?'} sections=${v.sectionCount ?? '?'}`,
        remediation:
          'Apply shared section spacing tokens (e.g. `.fs-landing-section`, `py-*` utilities, or `var(--*)` block padding) instead of micro-gaps between many sections.',
      });
    } else if (kind === 'gap-inconsistency') {
      findings.push({
        severity: 'warn',
        area: 'readability',
        message:
          'Adjacent section vertical gaps vary beyond rhythm tolerance (ad hoc spacing between blocks).',
        evidence:
          `gap_inconsistency median_gap_px=${v.sectionMedianGapPx ?? '?'} spread_px=${v.sectionGapSpreadPx ?? '?'}`,
        remediation:
          'Normalize section margins/padding to one spacing scale (CSS variables or shared utility classes) so gaps repeat predictably down the page.',
      });
    } else if (kind === 'adhoc-section-spacing') {
      findings.push({
        severity: 'minor',
        area: 'readability',
        message:
          'A section uses non-token vertical spacing (raw pixel margin/padding or inline style) outside the 8px rhythm grid.',
        evidence: `adhoc_section_spacing hint="${hint}"`,
        remediation:
          'Replace inline or arbitrary px margins with theme spacing tokens (`var(--*)`) or documented section utility classes.',
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
export async function collectVisualRhythmReport(page) {
  return page.evaluate(
    ({
      SECTION_SELECTOR,
      SECTION_EXCLUDE_SELECTOR,
      SPACING_UTILITY_CLASS_SOURCE,
    }) => {
      const spacingUtilityRx = new RegExp(SPACING_UTILITY_CLASS_SOURCE, 'i');
      const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();

      const visible = (el) => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        return rect.width > 40 && rect.height > 12 && style.visibility !== 'hidden'
          && style.display !== 'none' && Number(style.opacity || 1) > 0.05;
      };

      const isTokenizedSpacingValue = (computed) => {
        const raw = String(computed || '').trim().toLowerCase();
        if (!raw || raw === '0' || raw === '0px') return true;
        if (/\bvar\s*\(/i.test(raw)) return true;
        if (/^calc\s*\(/i.test(raw) && /\bvar\s*\(/i.test(raw)) return true;
        if (/^[\d.]+rem$/.test(raw) || /^[\d.]+em$/.test(raw)) return true;
        const pxMatch = raw.match(/^([\d.]+)px$/);
        if (pxMatch) {
          const px = Number.parseFloat(pxMatch[1]);
          return Number.isFinite(px) && px % 4 === 0;
        }
        return false;
      };

      const main = document.querySelector('main#main') || document.querySelector('main');
      if (!main || !visible(main)) {
        return { sectionCount: 0, sectionGapsPx: [], adhocSpacingHints: [] };
      }

      const sections = [];
      for (const el of main.querySelectorAll(SECTION_SELECTOR)) {
        if (!visible(el) || el.closest(SECTION_EXCLUDE_SELECTOR)) continue;
        const rect = el.getBoundingClientRect();
        sections.push({
          top: Math.round(rect.top),
          height: Math.round(rect.height),
          el,
        });
      }

      sections.sort((a, b) => a.top - b.top);

      const tops = sections.map((s) => s.top).filter((t) => Number.isFinite(t) && t >= -4);
      const sectionGapsPx = [];
      for (let i = 1; i < tops.length; i += 1) {
        sectionGapsPx.push(tops[i] - tops[i - 1]);
      }

      const adhocSpacingHints = [];
      const seenAdhoc = new Set();

      for (const { el } of sections) {
        if (el.hasAttribute('style') && /\b(margin|padding)/i.test(el.getAttribute('style') || '')) {
          const id = el.id ? `#${el.id}` : '';
          const cls = norm(el.className).split(' ').filter(Boolean).slice(0, 2).join('.');
          const hint = `${el.tagName.toLowerCase()}${id}${cls ? `.${cls}` : ''}[inline]`;
          if (!seenAdhoc.has(hint)) {
            seenAdhoc.add(hint);
            adhocSpacingHints.push(hint);
          }
          continue;
        }

        const cls = String(el.className || '');
        if (spacingUtilityRx.test(cls)) continue;

        const style = window.getComputedStyle(el);
        const edges = ['marginTop', 'marginBottom', 'paddingTop', 'paddingBottom'];
        let bad = false;
        for (const prop of edges) {
          const val = style[prop];
          if (!val || val === '0px') continue;
          if (!isTokenizedSpacingValue(val)) {
            bad = true;
            break;
          }
        }
        if (!bad) continue;

        const id = el.id ? `#${el.id}` : '';
        const clsHint = norm(el.className).split(' ').filter(Boolean).slice(0, 2).join('.');
        const hash = el.getAttribute('data-ks-hash') || el.getAttribute('hash') || '';
        const hint = `${el.tagName.toLowerCase()}${id}${clsHint ? `.${clsHint}` : ''}${hash ? `[@${hash}]` : ''}`;
        if (!seenAdhoc.has(hint)) {
          seenAdhoc.add(hint);
          adhocSpacingHints.push(hint);
        }
      }

      return {
        sectionCount: sections.length,
        sectionGapsPx,
        adhocSpacingHints: adhocSpacingHints.slice(0, 6),
      };
    },
    {
      SECTION_SELECTOR,
      SECTION_EXCLUDE_SELECTOR,
      SPACING_UTILITY_CLASS_SOURCE: SPACING_UTILITY_CLASS_RX.source,
    },
  );
}

export const rule = {
  id: 'DET.VISUAL.RHYTHM',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'readability',
  scoreDimension: 'visualRhythmFirstScreen',
  defaultSeverity: 'warn',
  priorityWeight: 7,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-visual-rhythm',
};

export async function run({ metrics, page, url }) {
  const pageUrl = url || String(metrics?.url || '');

  let reportExtras = null;
  if (page) {
    reportExtras = await collectVisualRhythmReport(page);
  }

  const snapshot = buildVisualRhythmSnapshot(metrics || {}, reportExtras);
  const hasGapSignals = snapshot.sectionCount >= MIN_SECTIONS_FOR_RHYTHM
    || (snapshot.sectionGapsPx?.length ?? 0) > 0;
  const hasAdhoc = (snapshot.adhocSpacingHints?.length ?? 0) > 0;

  if (!hasGapSignals && !hasAdhoc) return [];

  const violations = buildVisualRhythmViolations(snapshot);
  if (!violations.length) return [];

  return findingsFromVisualRhythmReport({ violations }, pageUrl);
}
