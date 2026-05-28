/**
 * DET.CARD.TITLE — each card exposes a visible title or aria-labelledby (or aria-label).
 */

/** Minimum visible characters for an accessible card name. */
export const MIN_CARD_TITLE_CHARS = 2;

const CARD_ROOT_SELECTOR = [
  '.card',
  '.forge-card',
  '[data-card]',
  '[class*="preview-card"]',
  '[class*="-card"]:not([class*="card-header"]):not([class*="card-body"]):not([class*="card-footer"])',
].join(',');

export const rule = {
  id: 'DET.CARD.TITLE',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'accessibility',
  scoreDimension: 'accessibilitySemanticsMeta',
  defaultSeverity: 'major',
  priorityWeight: 7,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-card-title',
};

/**
 * @param {{ violations?: Array<Record<string, unknown>> } | null | undefined} report
 * @param {string} [url]
 */
export function findingsFromCardTitleReport(report, url = '') {
  const violations = Array.isArray(report?.violations) ? report.violations : [];
  if (!violations.length) return [];

  const findings = [];
  const seen = new Set();

  for (const v of violations.slice(0, 8)) {
    const hint = String(v.selectorHint || v.className || 'card').slice(0, 120);
    if (seen.has(hint)) continue;
    seen.add(hint);

    findings.push({
      severity: 'major',
      area: 'accessibility',
      message:
        'A card is missing a visible title; add a heading, .card-title, or wire aria-labelledby / aria-label.',
      evidence: `missing_card_title card="${hint}"`,
      remediation:
        'Add a visible heading (h2–h6 or .card-title), a .card-label + title pair, or associate the card with aria-labelledby pointing at visible title text.',
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
export async function collectCardTitleReport(page, minTitleChars = MIN_CARD_TITLE_CHARS) {
  return page.evaluate(
    ({ minTitleChars, CARD_ROOT_SELECTOR }) => {
      const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();

      const visible = (el) => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        return rect.width > 8 && rect.height > 8 && style.visibility !== 'hidden'
          && style.display !== 'none' && Number(style.opacity || 1) > 0.05;
      };

      const textOf = (el) => norm(
        el.innerText || el.textContent || el.getAttribute('aria-label') || el.getAttribute('title') || '',
      );

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

      const hasTitleText = (el) => {
        if (!el || el.nodeType !== 1 || !visible(el) || isHiddenSubtree(el)) return false;
        return textOf(el).length >= minTitleChars;
      };

      const isCardRoot = (el) => {
        if (!el || el.nodeType !== 1 || !visible(el) || isHiddenSubtree(el)) return false;
        const tag = el.tagName.toLowerCase();
        const cls = String(el.className || '').toLowerCase();
        if (/\bcard-grid\b|\bartifact-card-grid\b/.test(cls)) return false;
        if (el.hasAttribute('data-card')) return true;
        if (/\bcard\b/.test(cls) && !/\bcard-header\b|\bcard-body\b|\bcard-footer\b|\bcard-title\b/.test(cls)) {
          if (tag === 'a' || tag === 'article' || tag === 'div' || tag === 'section') {
            return true;
          }
        }
        if (/\bforge-card\b/.test(cls)) return true;
        if (/\bpreview-card\b/.test(cls)) return true;
        return false;
      };

      const nestedCardAncestor = (el, card) => {
        let node = el.parentElement;
        while (node && node !== card) {
          if (isCardRoot(node)) return node;
          node = node.parentElement;
        }
        return null;
      };

      const isToolbarCard = (card) => {
        const kind = String(card.getAttribute('data-card-kind') || '').toLowerCase();
        if (kind === 'toolbar' || kind.includes('toolbar')) return true;
        const ksType = String(card.getAttribute('data-ks-type') || '').toLowerCase();
        if (ksType.includes('toolbar')) return true;
        const ksName = String(card.getAttribute('data-ks-name') || '').toLowerCase();
        if (ksName.includes('toolbar')) return true;
        const cls = String(card.className || '').toLowerCase();
        if (/\btoolbar-card\b|\bcard-toolbar\b/.test(cls)) return true;
        if (card.matches?.('[role="toolbar"]')) return true;
        if (card.querySelector('[role="toolbar"], .btn-toolbar')) return true;
        return false;
      };

      const excludedCard = (card) => {
        if (card.closest(
          'nav, [role="navigation"], .navbar, .pagination, .breadcrumb, .dropdown-menu, '
          + '[role="tablist"], [role="menu"], .cookie, [class*="cookie"], [id*="cookie"]',
        )) return true;
        if (card.closest('header')?.querySelector('nav') && card.closest('header nav')) return true;
        return false;
      };

      const selectorHintFor = (el) => {
        const id = el.id ? `#${el.id}` : '';
        const cls = norm(el.className).split(' ').filter(Boolean).slice(0, 3).join('.');
        const hash = el.getAttribute('data-ks-hash') || el.getAttribute('hash') || '';
        return `${el.tagName.toLowerCase()}${id}${cls ? `.${cls}` : ''}${hash ? `[@${hash}]` : ''}`;
      };

      const cardHasAccessibleTitle = (card) => {
        const ariaLabel = norm(card.getAttribute('aria-label') || '');
        if (ariaLabel.length >= minTitleChars) return true;

        const labelledby = card.getAttribute('aria-labelledby');
        if (labelledby) {
          for (const id of labelledby.split(/\s+/)) {
            const ref = id && document.getElementById(id);
            if (hasTitleText(ref)) return true;
          }
        }

        const titleSelectors = [
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
          '.card-title',
          '.card-label',
          '[class*="card-title"]',
          '[role="heading"]',
        ].join(',');

        for (const el of card.querySelectorAll(titleSelectors)) {
          if (!hasTitleText(el)) continue;
          if (nestedCardAncestor(el, card)) continue;
          return true;
        }

        return false;
      };

      /** @type {Array<Record<string, unknown>>} */
      const violations = [];
      const scanned = new Set();

      for (const candidate of document.querySelectorAll(CARD_ROOT_SELECTOR)) {
        if (!isCardRoot(candidate) || excludedCard(candidate)) continue;
        const key = selectorHintFor(candidate);
        if (scanned.has(key)) continue;
        scanned.add(key);
        if (isToolbarCard(candidate)) continue;
        if (cardHasAccessibleTitle(candidate)) continue;

        violations.push({
          kind: 'missing-card-title',
          selectorHint: key,
          className: norm(candidate.className).slice(0, 120),
        });
      }

      return {
        minTitleChars,
        cardCount: scanned.size,
        violations: violations.slice(0, 12),
      };
    },
    { minTitleChars, CARD_ROOT_SELECTOR },
  );
}

export async function run({ metrics, page, url }) {
  const report = metrics?.cardTitleReport
    ?? (page ? await collectCardTitleReport(page) : null);
  if (!report || !(report.violations || []).length) return [];
  return findingsFromCardTitleReport(report, url || metrics?.url || '');
}
