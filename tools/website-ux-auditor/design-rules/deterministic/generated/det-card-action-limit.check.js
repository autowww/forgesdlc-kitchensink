/**
 * DET.CARD.ACTION_LIMIT — at most one primary action per card unless a toolbar-card contract applies.
 */

/** Primary filled CTAs allowed per standard (non-toolbar) card. */
export const MAX_PRIMARY_ACTIONS_PER_CARD = 1;

const CARD_ROOT_SELECTOR = [
  '.card',
  '.forge-card',
  '[data-card]',
  '[class*="preview-card"]',
  '[class*="-card"]:not([class*="card-header"]):not([class*="card-body"]):not([class*="card-footer"])',
].join(',');

export const rule = {
  id: 'DET.CARD.ACTION_LIMIT',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'conversion',
  scoreDimension: 'trustAndEcosystemTruth',
  defaultSeverity: 'major',
  priorityWeight: 7,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-card-action-limit',
};

/**
 * @param {{ violations?: Array<Record<string, unknown>>, maxAllowed?: number } | null | undefined} report
 * @param {string} [url]
 */
export function findingsFromCardActionLimitReport(report, url = '') {
  const violations = Array.isArray(report?.violations) ? report.violations : [];
  if (!violations.length) return [];

  const maxAllowed = Number(report?.maxAllowed) || MAX_PRIMARY_ACTIONS_PER_CARD;
  const findings = [];
  const seen = new Set();

  for (const v of violations.slice(0, 8)) {
    const count = Number(v.primaryCount) || 0;
    if (count <= maxAllowed) continue;
    const hint = String(v.selectorHint || v.className || 'card').slice(0, 120);
    const key = `${hint}:${count}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const labels = Array.isArray(v.labels) ? v.labels.slice(0, 5).join(' | ') : '';
    findings.push({
      severity: count > maxAllowed + 1 ? 'critical' : 'major',
      area: 'conversion',
      message:
        'A card exposes more than one primary action; keep a single primary CTA per card or use a toolbar-card contract.',
      evidence: `primary_actions=${count} max=${maxAllowed} card="${hint}"${labels ? ` labels="${labels.slice(0, 160)}"` : ''}`,
      remediation:
        'Demote extra primaries to outline/secondary buttons, move actions into a toolbar-card pattern (role="toolbar" / .btn-toolbar / data-card-kind="toolbar"), or split into separate cards.',
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
export async function collectCardActionLimitReport(page, maxAllowed = MAX_PRIMARY_ACTIONS_PER_CARD) {
  return page.evaluate(
    ({ maxAllowed, CARD_ROOT_SELECTOR }) => {
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

      const isCardRoot = (el) => {
        if (!el || el.nodeType !== 1 || !visible(el) || isHiddenSubtree(el)) return false;
        const tag = el.tagName.toLowerCase();
        const cls = String(el.className || '').toLowerCase();
        if (el.hasAttribute('data-card')) return true;
        if (/\bcard\b/.test(cls) && !/\bcard-header\b|\bcard-body\b|\bcard-footer\b|\bcard-title\b/.test(cls)) {
          if (tag === 'a' || tag === 'article' || tag === 'div' || tag === 'section') return true;
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

      const isPrimaryAction = (el) => {
        if (!el || el.nodeType !== 1 || !visible(el) || isHiddenSubtree(el)) return false;
        const tag = el.tagName.toLowerCase();
        const cls = String(el.className || '').toLowerCase();
        if (tag === 'button' && el.disabled) return false;
        if (tag === 'input') {
          const type = String(el.getAttribute('type') || 'text').toLowerCase();
          if (!['button', 'submit', 'reset'].includes(type) || el.disabled) return false;
        }
        if (/\bbtn-forge-outline\b|\bbtn-cyan-outline\b|\bbtn-outline\b|\bbtn-secondary\b|\bbtn-link\b/.test(cls)) {
          return false;
        }
        if (/\bbtn-primary\b/.test(cls)) return true;
        if (/\bbtn-forge\b/.test(cls)) return true;
        if (tag === 'a' && /\bforge-card\b/.test(cls) && el.getAttribute('href')) return true;
        if (tag === 'a' && /\bcard\b/.test(cls) && el.getAttribute('href') && /\bbreathe-link\b/.test(cls)) {
          return true;
        }
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

      const collectPrimaryActions = (card) => {
        const actions = [];
        if (isPrimaryAction(card)) actions.push(card);
        for (const el of card.querySelectorAll('a, button, input, [role="button"]')) {
          if (!isPrimaryAction(el)) continue;
          if (nestedCardAncestor(el, card)) continue;
          actions.push(el);
        }
        const uniq = [];
        const keys = new Set();
        for (const el of actions) {
          const key = `${el.tagName}:${textOf(el).slice(0, 48)}:${el.getAttribute('href') || ''}`;
          if (keys.has(key)) continue;
          keys.add(key);
          uniq.push(el);
        }
        return uniq;
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

        const primaries = collectPrimaryActions(candidate);
        if (primaries.length <= maxAllowed) continue;

        violations.push({
          kind: 'too-many-primary-actions',
          primaryCount: primaries.length,
          maxAllowed,
          selectorHint: key,
          className: norm(candidate.className).slice(0, 120),
          labels: primaries.map((el) => textOf(el).slice(0, 48)).filter(Boolean),
        });
      }

      return {
        maxAllowed,
        cardCount: scanned.size,
        violations: violations.slice(0, 12),
      };
    },
    { maxAllowed, CARD_ROOT_SELECTOR },
  );
}

export async function run({ metrics, page, url }) {
  const report = metrics?.cardActionLimitReport
    ?? (page ? await collectCardActionLimitReport(page) : null);
  if (!report || !(report.violations || []).length) return [];
  return findingsFromCardActionLimitReport(report, url || metrics?.url || '');
}
