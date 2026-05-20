/**
 * DET.PY.OPTIONAL_REGIONS — optional Python-rendered slots omit or collapse when
 * empty; no visible “ghost” headings without body content.
 */

/** Minimum non-heading characters required to treat a slot as populated. */
export const MIN_SLOT_BODY_CHARS = 3;

/** Minimum visible heading characters to count as a ghost-heading label. */
export const MIN_HEADING_CHARS = 2;

/** Slots shorter than this are treated as zero-height / collapsed (pass). */
export const MIN_VISIBLE_SLOT_HEIGHT = 8;

export const MAX_OPTIONAL_REGION_FINDINGS = 8;

export const OPTIONAL_SLOT_SELECTOR = [
  '[data-ks-optional="true"]',
  '[data-ks-optional]',
  '.fs-site-announcement',
  '.ks-doc-breadcrumb',
  '.fs-listing-shell__sidebar',
  '.fs-mega-footer__brand',
  '.fs-mega-footer__legal',
  '.fs-mega-footer__bottom',
].join(',');

export const HEADING_SELECTOR = [
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  '[role="heading"]',
  '.section-label',
  '.fs-listing-shell__sidebar-title',
  '.fs-mega-footer__col-title',
  '.fs-faq-section__title',
].join(',');

export const BODY_CONTENT_SELECTOR = [
  'p',
  'ul',
  'ol',
  'dl',
  'table',
  'pre',
  'blockquote',
  'img',
  'svg',
  'picture',
  'video',
  'iframe',
  'button',
  'input',
  'select',
  'textarea',
  'a[href]',
  '[role="list"]',
  '.accordion',
  '.forge-card',
  '.card',
  '.forge-diagram',
  'form',
  'details',
].join(',');

export const rule = {
  id: 'DET.PY.OPTIONAL_REGIONS',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'informationArchitecture',
  scoreDimension: 'informationArchitecture',
  defaultSeverity: 'warn',
  priorityWeight: 6,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-py-optional_regions',
};

/**
 * @param {{ headingChars?: number, bodyChars?: number, bodyNodes?: number, height?: number }} slot
 * @returns {'ghost-heading' | 'empty-visible-slot' | null}
 */
export function classifyOptionalSlotViolation(slot) {
  const headingChars = Number(slot?.headingChars || 0);
  const bodyChars = Number(slot?.bodyChars || 0);
  const bodyNodes = Number(slot?.bodyNodes || 0);
  const height = Number(slot?.height || 0);

  if (height <= MIN_VISIBLE_SLOT_HEIGHT) return null;

  if (
    headingChars >= MIN_HEADING_CHARS
    && bodyChars < MIN_SLOT_BODY_CHARS
    && bodyNodes === 0
  ) {
    return 'ghost-heading';
  }

  if (
    headingChars === 0
    && bodyChars < MIN_SLOT_BODY_CHARS
    && height >= MIN_VISIBLE_SLOT_HEIGHT
  ) {
    return 'empty-visible-slot';
  }

  return null;
}

/**
 * @param {{ violations?: Array<Record<string, unknown>> } | null | undefined} report
 * @param {string} [url]
 */
export function findingsFromOptionalRegionsReport(report, url = '') {
  const violations = Array.isArray(report?.violations) ? report.violations : [];
  if (!violations.length) return [];

  const findings = [];
  const seen = new Set();

  for (const v of violations.slice(0, MAX_OPTIONAL_REGION_FINDINGS)) {
    const hint = String(v.selectorHint || v.slot || 'optional-slot').slice(0, 120);
    const kind = String(v.kind || 'ghost-heading');
    const key = `${kind}:${hint}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const isGhost = kind === 'ghost-heading';
    findings.push({
      severity: 'warn',
      area: 'informationArchitecture',
      message: isGhost
        ? 'An optional Python-rendered slot shows a heading or label but no substantive body content.'
        : 'An optional Python-rendered slot is visible on the page but empty—omit the wrapper or collapse it to zero height.',
      evidence: `optional_region_${kind} slot=${String(v.slot || '?')} hint="${hint}" headingChars=${v.headingChars ?? 0} bodyChars=${v.bodyChars ?? 0}`,
      remediation: isGhost
        ? 'Guard optional slot renderers: when inner HTML is empty, omit the section wrapper and its heading (see `enterprise_marketing.render_listing_shell`, `layouts.*` announcement/breadcrumb guards).'
        : 'When an optional slot has no content, return an empty string from the Python renderer or hide the wrapper with zero height instead of emitting an empty visible region.',
    });
  }

  if (violations.length > MAX_OPTIONAL_REGION_FINDINGS) {
    findings.push({
      severity: 'warn',
      area: 'informationArchitecture',
      message: `Additional optional-region issues omitted (${violations.length - MAX_OPTIONAL_REGION_FINDINGS} more).`,
      evidence: `optional_region_total=${violations.length}`,
      remediation: 'Audit Python HTML modules for optional slots (`announcement_html`, breadcrumbs, sidebars, footer strips) and omit wrappers when content is blank.',
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
export async function collectOptionalRegionsReport(
  page,
  {
    minBodyChars = MIN_SLOT_BODY_CHARS,
    minHeadingChars = MIN_HEADING_CHARS,
    minVisibleHeight = MIN_VISIBLE_SLOT_HEIGHT,
  } = {},
) {
  return page.evaluate(
    ({
      OPTIONAL_SLOT_SELECTOR,
      HEADING_SELECTOR,
      BODY_CONTENT_SELECTOR,
      minBodyChars,
      minHeadingChars,
      minVisibleHeight,
    }) => {
      const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();

      const visible = (el) => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        return rect.width > 1 && rect.height > 1 && style.visibility !== 'hidden'
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

      const textOf = (el) => norm(el.innerText || el.textContent || '');

      const selectorHintFor = (el, slot) => {
        const id = el.id ? `#${el.id}` : '';
        const cls = norm(el.className).split(' ').filter(Boolean).slice(0, 3).join('.');
        const hash = el.getAttribute('data-ks-hash') || el.getAttribute('hash') || '';
        return `${slot || el.tagName.toLowerCase()}${id}${cls ? `.${cls}` : ''}${hash ? `[@${hash}]` : ''}`;
      };

      const slotKindFor = (el) => {
        if (el.matches('[data-ks-optional], [data-ks-optional="true"]')) {
          return el.getAttribute('data-ks-optional') || 'data-ks-optional';
        }
        if (el.matches('.fs-site-announcement')) return 'site-announcement';
        if (el.matches('.ks-doc-breadcrumb')) return 'doc-breadcrumb';
        if (el.matches('.fs-listing-shell__sidebar')) return 'listing-sidebar';
        if (el.matches('.fs-mega-footer__brand')) return 'mega-footer-brand';
        if (el.matches('.fs-mega-footer__legal')) return 'mega-footer-legal';
        if (el.matches('.fs-mega-footer__bottom')) return 'mega-footer-bottom';
        return 'optional-slot';
      };

      const classify = ({ headingChars, bodyChars, bodyNodes, height }) => {
        if (height <= minVisibleHeight) return null;
        if (headingChars >= minHeadingChars && bodyChars < minBodyChars && bodyNodes === 0) {
          return 'ghost-heading';
        }
        if (headingChars === 0 && bodyChars < minBodyChars && height >= minVisibleHeight) {
          return 'empty-visible-slot';
        }
        return null;
      };

      const analyzeSlot = (el, slot) => {
        if (!(el instanceof HTMLElement) || !visible(el) || isHiddenSubtree(el)) return null;
        const rect = el.getBoundingClientRect();
        const height = Math.round(rect.height);
        const headingEls = [...el.querySelectorAll(HEADING_SELECTOR)].filter(
          (node) => visible(node) && !isHiddenSubtree(node),
        );
        const headingChars = headingEls.reduce((acc, node) => acc + textOf(node).length, 0);
        const headingText = headingEls.map(textOf).join(' ');
        const fullText = textOf(el);
        let bodyText = fullText;
        if (headingText && fullText.startsWith(headingText)) {
          bodyText = norm(fullText.slice(headingText.length));
        } else if (headingText) {
          bodyText = norm(fullText.replace(headingText, ''));
        }
        const bodyNodes = [...el.querySelectorAll(BODY_CONTENT_SELECTOR)].filter(
          (node) => visible(node) && !isHiddenSubtree(node) && textOf(node).length >= minBodyChars,
        ).length;
        const kind = classify({
          headingChars,
          bodyChars: bodyText.length,
          bodyNodes,
          height,
        });
        if (!kind) return null;
        return {
          kind,
          slot,
          selectorHint: selectorHintFor(el, slot),
          headingChars,
          bodyChars: bodyText.length,
          bodyNodes,
          height,
        };
      };

      /** @type {Array<Record<string, unknown>>} */
      const violations = [];
      const seen = new Set();

      const pushViolation = (entry) => {
        const key = `${entry.kind}:${entry.selectorHint}`;
        if (seen.has(key)) return;
        seen.add(key);
        violations.push(entry);
      };

      for (const el of document.querySelectorAll(OPTIONAL_SLOT_SELECTOR)) {
        const slot = slotKindFor(el);
        const hit = analyzeSlot(el, slot);
        if (hit) pushViolation(hit);
      }

      for (const col of document.querySelectorAll('.fs-mega-footer__grid > [class*="col-"]')) {
        if (!(col instanceof HTMLElement) || !visible(col) || isHiddenSubtree(col)) continue;
        const title = col.querySelector('.fs-mega-footer__col-title');
        const links = [...col.querySelectorAll('.fs-mega-footer__list a[href]')].filter(
          (a) => visible(a) && norm(a.getAttribute('href') || '').length > 0,
        );
        const titleText = title && visible(title) ? textOf(title) : '';
        if (titleText.length >= minHeadingChars && links.length === 0) {
          pushViolation({
            kind: 'ghost-heading',
            slot: 'mega-footer-column',
            selectorHint: selectorHintFor(col, 'mega-footer-column'),
            headingChars: titleText.length,
            bodyChars: 0,
            bodyNodes: 0,
            height: Math.round(col.getBoundingClientRect().height),
          });
        }
      }

      return {
        optionalSlotCount: document.querySelectorAll(OPTIONAL_SLOT_SELECTOR).length,
        violations: violations.slice(0, 12),
      };
    },
    {
      OPTIONAL_SLOT_SELECTOR,
      HEADING_SELECTOR,
      BODY_CONTENT_SELECTOR,
      minBodyChars,
      minHeadingChars,
      minVisibleHeight,
    },
  );
}

export async function run({ metrics, page, url }) {
  const report = metrics?.optionalRegionsReport
    ?? (page ? await collectOptionalRegionsReport(page) : null);
  if (!report || !(report.violations || []).length) return [];
  return findingsFromOptionalRegionsReport(report, url || metrics?.url || '');
}
