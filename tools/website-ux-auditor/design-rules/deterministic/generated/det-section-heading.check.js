/**
 * DET.SECTION.HEADING — each major content section exposes one primary heading;
 * document heading levels follow a coherent outline (no skipped ranks).
 */

import { pageContext } from '../../../checks/context.js';

/** Minimum visible words in a section/article before it counts as a major section. */
export const MIN_MAJOR_SECTION_WORDS = 45;

/** Minimum visible height (px) for a major section shell. */
export const MIN_MAJOR_SECTION_HEIGHT_PX = 48;

export const MAX_SECTION_HEADING_FINDINGS = 8;

const EXCLUDED_OUTLINE_SELECTOR = [
  'nav',
  '[role="navigation"]',
  '.navbar',
  '.forge-toc',
  '.ks-doc-toc',
  'aside.forge-sidebar',
  '#ks-sidebar-aside',
  '.fs-sidebar',
  'footer',
  '.cookie',
  '[class*="cookie"]',
].join(',');

const HEADING_SELECTOR = [
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  '[role="heading"]',
].join(',');

export const rule = {
  id: 'DET.SECTION.HEADING',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'semantics',
  scoreDimension: 'narrativeHero',
  defaultSeverity: 'minor',
  priorityWeight: 10,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-section-heading',
};

/**
 * @param {string} tag
 * @param {number | string | null | undefined} ariaLevel
 */
export function headingLevelFromTag(tag, ariaLevel) {
  const t = String(tag || '').toLowerCase();
  if (/^h[1-6]$/.test(t)) return Number.parseInt(t.slice(1), 10);
  const parsed = Number.parseInt(String(ariaLevel ?? ''), 10);
  if (Number.isFinite(parsed) && parsed >= 1 && parsed <= 6) return parsed;
  return 2;
}

/**
 * @param {Array<{ level?: number, text?: string, top?: number }>} outlineHeadings
 * @returns {Array<Record<string, unknown>>}
 */
export function violationsFromHeadingOutline(outlineHeadings) {
  const headings = (Array.isArray(outlineHeadings) ? outlineHeadings : [])
    .filter((h) => Number.isFinite(h?.level) && h.level >= 1 && h.level <= 6);
  if (headings.length < 2) return [];

  /** @type {Array<Record<string, unknown>>} */
  const violations = [];
  let lastLevel = 0;

  for (const h of headings) {
    const level = Number(h.level);
    if (lastLevel > 0 && level > lastLevel + 1) {
      violations.push({
        kind: 'skipped-heading-level',
        fromLevel: lastLevel,
        toLevel: level,
        text: String(h.text || '').slice(0, 80),
        top: typeof h.top === 'number' ? h.top : null,
      });
    }
    lastLevel = level;
  }

  return violations;
}

/**
 * @param {{
 *   sections?: Array<{ selectorHint?: string, primaryHeadingCount?: number, wordCount?: number }>,
 *   outlineHeadings?: Array<{ level?: number, text?: string, top?: number }>,
 * }} snapshot
 */
export function violationsFromSectionHeadingSnapshot(snapshot) {
  /** @type {Array<Record<string, unknown>>} */
  const violations = [];

  for (const section of Array.isArray(snapshot?.sections) ? snapshot.sections : []) {
    const count = Number(section?.primaryHeadingCount ?? 0);
    const words = Number(section?.wordCount ?? 0);
    if (words < MIN_MAJOR_SECTION_WORDS) continue;

    const hint = String(section?.selectorHint || 'section').slice(0, 120);
    if (count === 0) {
      violations.push({
        kind: 'missing-section-heading',
        selectorHint: hint,
        wordCount: words,
      });
    } else if (count > 1) {
      violations.push({
        kind: 'duplicate-section-heading',
        selectorHint: hint,
        primaryHeadingCount: count,
        wordCount: words,
      });
    }
  }

  violations.push(...violationsFromHeadingOutline(snapshot?.outlineHeadings));

  return violations;
}

/**
 * @param {{ violations?: Array<Record<string, unknown>> } | null | undefined} report
 * @param {string} [url]
 */
export function findingsFromSectionHeadingReport(report, url = '') {
  const violations = Array.isArray(report?.violations) ? report.violations : [];
  if (!violations.length) return [];

  const findings = [];
  const seen = new Set();

  for (const v of violations.slice(0, MAX_SECTION_HEADING_FINDINGS)) {
    const kind = String(v.kind || 'section-heading');
    const hint = String(v.selectorHint || v.text || 'main').slice(0, 120);
    const key = `${kind}:${hint}:${v.fromLevel ?? ''}:${v.toLevel ?? ''}`;
    if (seen.has(key)) continue;
    seen.add(key);

    if (kind === 'missing-section-heading') {
      findings.push({
        severity: 'minor',
        area: 'semantics',
        message: 'A major content section has no primary section heading.',
        evidence: `missing_section_heading section="${hint}" words=${v.wordCount ?? '?'}`,
        remediation:
          'Add one visible section title (h2–h4) at the top of the section, or associate the region with aria-labelledby pointing at visible title text.',
      });
    } else if (kind === 'duplicate-section-heading') {
      findings.push({
        severity: 'major',
        area: 'semantics',
        message: 'A major content section exposes more than one primary section heading.',
        evidence: `duplicate_section_heading section="${hint}" primary_headings=${v.primaryHeadingCount ?? '?'}`,
        remediation:
          'Keep one primary heading per major section; demote secondary labels to h3+ inside nested blocks or split into separate sections.',
      });
    } else if (kind === 'skipped-heading-level') {
      findings.push({
        severity: 'major',
        area: 'semantics',
        message: 'Heading levels skip a rank in the document outline (e.g. h2 followed by h4).',
        evidence: `skipped_heading_level h${v.fromLevel ?? '?'}→h${v.toLevel ?? '?'} text="${hint}" top=${v.top ?? '?'}`,
        remediation:
          'Use sequential heading ranks (h2 then h3) so the outline matches visual hierarchy and assistive tech navigation.',
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

/**
 * @param {Array<{ tag?: string, top?: number, text?: string }>} metricsHeadings
 */
export function outlineHeadingsFromMetrics(metricsHeadings) {
  return (Array.isArray(metricsHeadings) ? metricsHeadings : [])
    .map((h) => ({
      level: headingLevelFromTag(h.tag, null),
      top: typeof h.top === 'number' ? h.top : null,
      text: String(h.text || '').slice(0, 80),
    }))
    .sort((a, b) => (a.top ?? 0) - (b.top ?? 0));
}

/** @param {import('playwright').Page} page */
export async function collectSectionHeadingReport(page) {
  return page.evaluate(
    ({
      minWords,
      minHeight,
      excludedOutlineSelector,
      headingSelector,
    }) => {
      const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();
      const words = (s) => norm(s).split(/\s+/).filter(Boolean);
      const textOf = (el) => norm(el.innerText || el.textContent || el.getAttribute('aria-label') || '');

      const visible = (el) => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        return rect.width > 1 && rect.height > 1 && style.visibility !== 'hidden'
          && style.display !== 'none' && Number(style.opacity || 1) > 0.05;
      };

      const headingLevel = (el) => {
        const tag = el.tagName.toLowerCase();
        if (/^h[1-6]$/.test(tag)) return Number.parseInt(tag.slice(1), 10);
        const aria = Number.parseInt(el.getAttribute('aria-level') || '', 10);
        if (Number.isFinite(aria) && aria >= 1 && aria <= 6) return aria;
        return 2;
      };

      const selectorHintFor = (el) => {
        const id = el.id ? `#${el.id}` : '';
        const cls = norm(el.className).split(' ').filter(Boolean).slice(0, 2).join('.');
        return `${el.tagName.toLowerCase()}${id}${cls ? `.${cls}` : ''}`;
      };

      const main = document.querySelector('main#main') || document.querySelector('main') || document.body;
      const root = main || document.body;

      const primaryHeadingsInSection = (sectionEl) => {
        /** @type {Array<{ level: number, text: string, top: number }>} */
        const found = [];
        for (const el of sectionEl.querySelectorAll(headingSelector)) {
          if (!visible(el)) continue;
          const owner = el.closest('section, article');
          if (owner && owner !== sectionEl) continue;
          found.push({
            level: headingLevel(el),
            text: textOf(el).slice(0, 80),
            top: Math.round(el.getBoundingClientRect().top),
          });
        }

        if (!found.length) {
          const labelledBy = norm(sectionEl.getAttribute('aria-labelledby') || '');
          for (const id of labelledBy.split(/\s+/).filter(Boolean)) {
            const label = document.getElementById(id);
            if (label && visible(label) && textOf(label).length >= 2) {
              found.push({
                level: 2,
                text: textOf(label).slice(0, 80),
                top: Math.round(label.getBoundingClientRect().top),
              });
              break;
            }
          }
        }

        return found;
      };

      /** @type {Array<Record<string, unknown>>} */
      const sections = [];
      for (const sectionEl of root.querySelectorAll('section, article')) {
        if (!visible(sectionEl)) continue;
        if (sectionEl.closest(excludedOutlineSelector)) continue;
        const bodyText = textOf(sectionEl);
        const wordCount = words(bodyText).length;
        const height = Math.round(sectionEl.getBoundingClientRect().height);
        if (wordCount < minWords && height < minHeight) continue;

        const primary = primaryHeadingsInSection(sectionEl);
        sections.push({
          selectorHint: selectorHintFor(sectionEl),
          wordCount,
          height,
          primaryHeadingCount: primary.length,
        });
      }

      /** @type {Array<{ level: number, text: string, top: number, domIndex: number }>} */
      const outlineHeadings = [];
      let domIndex = 0;
      for (const el of root.querySelectorAll(headingSelector)) {
        if (!visible(el)) continue;
        if (el.closest(excludedOutlineSelector)) continue;
        outlineHeadings.push({
          level: headingLevel(el),
          text: textOf(el).slice(0, 80),
          top: Math.round(el.getBoundingClientRect().top),
          domIndex: domIndex++,
        });
      }

      return {
        minMajorSectionWords: minWords,
        sectionCount: sections.length,
        sections,
        outlineHeadings,
      };
    },
    {
      minWords: MIN_MAJOR_SECTION_WORDS,
      minHeight: MIN_MAJOR_SECTION_HEIGHT_PX,
      excludedOutlineSelector: EXCLUDED_OUTLINE_SELECTOR,
      headingSelector: HEADING_SELECTOR,
    },
  );
}

/**
 * @param {Record<string, unknown>} [metrics]
 * @param {string} [url]
 * @param {{ siteKind?: string }} [ctx]
 */
export function findingsFromSectionHeadingMetrics(metrics, url = '', ctx = {}) {
  const pageUrl = url || String(metrics?.url || '');
  const burdenCtx = pageContext(pageUrl, ctx.siteKind || 'generic');
  if (burdenCtx.isPlatformHandbookInner) return [];

  const report = metrics?.sectionHeadingReport;
  if (report) {
    const violations = violationsFromSectionHeadingSnapshot(report);
    return findingsFromSectionHeadingReport({ violations }, pageUrl);
  }

  const outline = outlineHeadingsFromMetrics(metrics?.headings);
  if (!outline.length) return [];

  const violations = violationsFromHeadingOutline(outline);
  return findingsFromSectionHeadingReport({ violations }, pageUrl);
}

export async function run({ metrics, page, url, ctx = {} }) {
  const pageUrl = url || String(metrics?.url || '');
  const burdenCtx = pageContext(pageUrl, ctx.siteKind || 'generic');
  if (burdenCtx.isPlatformHandbookInner) return [];

  let report = metrics?.sectionHeadingReport;
  if (!report && page) {
    report = await collectSectionHeadingReport(page);
  }

  if (report) {
    const violations = violationsFromSectionHeadingSnapshot(report);
    return findingsFromSectionHeadingReport({ violations }, pageUrl);
  }

  return findingsFromSectionHeadingMetrics(metrics, pageUrl, ctx);
}
