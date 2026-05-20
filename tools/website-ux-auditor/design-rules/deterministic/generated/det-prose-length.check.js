/**
 * DET.PROSE.LENGTH — paragraph word count and list item caps per Forge enterprise UX standard.
 */

import { pageContext } from '../../../checks/context.js';

/** Enterprise landing readability cap (aligns with legacy readability-structure check). */
export const MAX_PARAGRAPH_WORDS = 85;

/** Bullets per card — forge-enterprise-ai-website-standard.md. */
export const MAX_CARD_LIST_ITEMS = 3;

/** Direct items in a main-column prose list before scanability degrades. */
export const MAX_PROSE_LIST_ITEMS = 12;

export const rule = {
  id: 'DET.PROSE.LENGTH',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'readability',
  scoreDimension: 'depthAndTechnicalDisclosure',
  defaultSeverity: 'minor',
  priorityWeight: 7,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-prose-length',
};

/**
 * @param {Array<{ words?: number, top?: number, text?: string }>} paragraphs
 * @param {number} maxWords
 */
export function longParagraphViolations(paragraphs, maxWords = MAX_PARAGRAPH_WORDS) {
  const limit = Number.isFinite(maxWords) ? maxWords : MAX_PARAGRAPH_WORDS;
  return (Array.isArray(paragraphs) ? paragraphs : [])
    .filter((p) => typeof p?.words === 'number' && p.words > limit)
    .map((p) => ({
      kind: 'long-paragraph',
      words: p.words,
      top: typeof p.top === 'number' ? p.top : null,
      textStart: String(p.text || '').slice(0, 80),
    }));
}

/**
 * @param {{ violations?: Array<Record<string, unknown>> } | null | undefined} report
 * @param {string} [url]
 */
export function findingsFromListLengthReport(report, url = '') {
  const violations = Array.isArray(report?.violations) ? report.violations : [];
  if (!violations.length) return [];

  const findings = [];
  const seen = new Set();

  for (const v of violations.slice(0, 8)) {
    const kind = String(v.kind || 'long-list');
    const hint = String(v.selectorHint || v.context || 'list').slice(0, 120);
    const key = `${kind}:${hint}:${v.itemCount ?? ''}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const itemCount = Number(v.itemCount ?? 0);
    const maxItems = Number(v.maxItems ?? MAX_PROSE_LIST_ITEMS);
    const inCard = kind === 'card-list';

    findings.push({
      severity: inCard ? 'major' : 'minor',
      area: 'readability',
      message: inCard
        ? 'A card list exceeds the enterprise bullet cap (3 items per card).'
        : 'A main-column list exceeds the scannable list item cap.',
      evidence: `${kind} items=${itemCount} max=${maxItems} list="${hint}"`,
      remediation: inCard
        ? 'Trim card bullets to three outcome-led items or move reference detail to a linked docs page.'
        : 'Break long lists into grouped subsections, tables, or linked index pages.',
    });
  }

  if (url) {
    for (const finding of findings) {
      finding.evidence = `${finding.evidence} url=${url}`;
    }
  }

  return findings;
}

/**
 * @param {Array<{ words?: number, top?: number, text?: string }>} paragraphs
 * @param {number} maxWords
 * @param {string} [url]
 */
export function findingsFromLongParagraphs(paragraphs, maxWords = MAX_PARAGRAPH_WORDS, url = '') {
  const violations = longParagraphViolations(paragraphs, maxWords);
  if (!violations.length) return [];

  const worst = violations.reduce((max, v) => Math.max(max, v.words || 0), 0);
  const sample = violations.slice(0, 3).map((v) => `${v.words}w@${v.top ?? '?'}px`).join('; ');

  const finding = {
    severity: violations.length >= 4 || worst > maxWords + 35 ? 'major' : 'minor',
    area: 'readability',
    message: 'Some paragraphs exceed the readable prose length budget.',
    evidence: `long_paragraphs count=${violations.length} max_words=${worst} threshold=${maxWords} sample="${sample}"`,
    remediation:
      'Split long paragraphs into one- or two-sentence blocks, cards, or deeper docs per forge-enterprise-ai-website-standard.md.',
  };

  if (url) finding.evidence = `${finding.evidence} url=${url}`;
  return [finding];
}

/** @param {import('playwright').Page} page */
export async function collectProseLengthReport(
  page,
  maxCardListItems = MAX_CARD_LIST_ITEMS,
  maxProseListItems = MAX_PROSE_LIST_ITEMS,
) {
  return page.evaluate(
    ({ maxCardListItems, maxProseListItems }) => {
      const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();
      const words = (s) => norm(s).split(/\s+/).filter(Boolean);

      const visible = (el) => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        return rect.width > 1 && rect.height > 1 && style.visibility !== 'hidden'
          && style.display !== 'none' && Number(style.opacity || 1) > 0.05;
      };

      const isCardRoot = (el) => {
        if (!el || el.nodeType !== 1) return false;
        const cls = String(el.className || '').toLowerCase();
        if (el.hasAttribute('data-card')) return true;
        if (/\bcard\b/.test(cls) && !/\bcard-header\b|\bcard-body\b|\bcard-footer\b/.test(cls)) return true;
        if (/\bforge-card\b/.test(cls)) return true;
        return false;
      };

      const excludedList = (list) => {
        if (!list?.closest) return true;
        return Boolean(list.closest(
          'nav, [role="navigation"], .navbar, .pagination, .breadcrumb, .dropdown-menu, '
          + '[role="menu"], [role="tablist"], .forge-toc, .ks-doc-toc, aside.forge-sidebar, '
          + '#ks-sidebar-aside, .cookie, [class*="cookie"]',
        ));
      };

      const selectorHintFor = (el) => {
        const id = el.id ? `#${el.id}` : '';
        const cls = norm(el.className).split(' ').filter(Boolean).slice(0, 2).join('.');
        return `${el.tagName.toLowerCase()}${id}${cls ? `.${cls}` : ''}`;
      };

      const directVisibleItems = (list) => {
        let count = 0;
        for (const child of list.children) {
          if (child.tagName?.toLowerCase() !== 'li') continue;
          if (!visible(child)) continue;
          if (words(child.innerText || child.textContent || '').length < 1) continue;
          count += 1;
        }
        return count;
      };

      const root = document.querySelector('main#main') || document.querySelector('main') || document.body;
      /** @type {Array<Record<string, unknown>>} */
      const violations = [];
      const scanned = new Set();

      for (const list of root.querySelectorAll('ul, ol')) {
        if (!visible(list) || excludedList(list)) continue;
        const key = selectorHintFor(list);
        if (scanned.has(key)) continue;
        scanned.add(key);

        const itemCount = directVisibleItems(list);
        const card = list.closest('.card, .forge-card, [data-card]');
        const inCard = Boolean(card && isCardRoot(card));
        const maxItems = inCard ? maxCardListItems : maxProseListItems;
        if (itemCount <= maxItems) continue;

        violations.push({
          kind: inCard ? 'card-list' : 'prose-list',
          itemCount,
          maxItems,
          selectorHint: key,
          context: inCard ? 'card' : 'main',
        });
      }

      return {
        maxCardListItems,
        maxProseListItems,
        listCount: scanned.size,
        violations: violations.slice(0, 12),
      };
    },
    { maxCardListItems, maxProseListItems },
  );
}

/**
 * @param {Record<string, unknown>} [metrics]
 * @param {string} [url]
 * @param {{ siteKind?: string, maxParagraphWords?: number, maxCardListItems?: number, maxProseListItems?: number }} [ctx]
 */
export function findingsFromProseLengthMetrics(metrics, url = '', ctx = {}) {
  const pageUrl = url || String(metrics?.url || '');
  const burdenCtx = pageContext(pageUrl, ctx.siteKind || 'generic');
  if (burdenCtx.isPlatformHandbookInner) return [];

  const maxParagraphWords = Number.isFinite(ctx.maxParagraphWords)
    ? ctx.maxParagraphWords
    : MAX_PARAGRAPH_WORDS;

  const findings = [
    ...findingsFromLongParagraphs(metrics?.paragraphs, maxParagraphWords, pageUrl),
  ];

  const listReport = metrics?.proseLengthReport;
  if (listReport) {
    findings.push(...findingsFromListLengthReport(listReport, pageUrl));
  }

  return findings;
}

export async function run({ metrics, page, url, ctx = {} }) {
  const pageUrl = url || String(metrics?.url || '');
  const burdenCtx = pageContext(pageUrl, ctx.siteKind || 'generic');
  if (burdenCtx.isPlatformHandbookInner) return [];

  const maxCardListItems = Number.isFinite(ctx.maxCardListItems)
    ? ctx.maxCardListItems
    : MAX_CARD_LIST_ITEMS;
  const maxProseListItems = Number.isFinite(ctx.maxProseListItems)
    ? ctx.maxProseListItems
    : MAX_PROSE_LIST_ITEMS;

  let listReport = metrics?.proseLengthReport;
  if (!listReport && page) {
    listReport = await collectProseLengthReport(page, maxCardListItems, maxProseListItems);
  }

  const mergedMetrics = {
    ...(metrics || {}),
    url: pageUrl,
    proseLengthReport: listReport,
  };

  return findingsFromProseLengthMetrics(mergedMetrics, pageUrl, ctx);
}
