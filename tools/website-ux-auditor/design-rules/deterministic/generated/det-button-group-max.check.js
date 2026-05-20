/**
 * DET.BUTTON.GROUP.MAX — horizontal button/action groups expose at most N visible
 * controls before overflow/disclosure (Forge hero pattern: primary + secondary + optional tertiary).
 */

/** Visible horizontal actions per group before overflow/disclosure is required. */
export const MAX_VISIBLE_HORIZONTAL_ACTIONS = 3;

const GROUP_CONTAINER_SELECTOR = [
  '.btn-group',
  '.btn-toolbar',
  '.landing-hero-actions__buttons',
  '.landing-hero-actions',
  '[class*="hero-actions"]',
  '[class*="cta-row"]',
  '[class*="-actions__buttons"]',
  '[class*="__actions"]',
  '[role="group"]',
].join(',');

export const rule = {
  id: 'DET.BUTTON.GROUP.MAX',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'conversion',
  scoreDimension: 'trustAndEcosystemTruth',
  defaultSeverity: 'major',
  priorityWeight: 8,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-button-group-max',
};

/**
 * @param {{ violations?: Array<Record<string, unknown>>, maxAllowed?: number } | null | undefined} report
 * @param {string} [url]
 */
export function findingsFromButtonGroupMaxReport(report, url = '') {
  const violations = Array.isArray(report?.violations) ? report.violations : [];
  if (!violations.length) return [];

  const maxAllowed = Number(report?.maxAllowed) || MAX_VISIBLE_HORIZONTAL_ACTIONS;
  const findings = [];
  const seen = new Set();

  for (const v of violations.slice(0, 8)) {
    const count = Number(v.actionCount) || 0;
    if (count <= maxAllowed) continue;
    const hint = String(v.selectorHint || v.className || 'button-group').slice(0, 120);
    const key = `${hint}:${count}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const labels = Array.isArray(v.labels) ? v.labels.slice(0, 5).join(' | ') : '';
    findings.push({
      severity: count > maxAllowed + 1 ? 'critical' : 'major',
      area: 'conversion',
      message:
        'A horizontal button group exposes too many visible actions; use overflow/disclosure or demote extras.',
      evidence: `visible_actions=${count} max=${maxAllowed} group="${hint}"${labels ? ` labels="${labels.slice(0, 160)}"` : ''}`,
      remediation:
        'Keep horizontal CTA/toolbar groups to one primary and one secondary action (three only when the third is low-emphasis). Move additional actions into a menu, “More” disclosure, or a follow-on section.',
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
export async function collectButtonGroupMaxReport(page, maxAllowed = MAX_VISIBLE_HORIZONTAL_ACTIONS) {
  return page.evaluate(
    ({ maxAllowed, GROUP_CONTAINER_SELECTOR }) => {
      const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();

      const visible = (el) => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        return rect.width > 1 && rect.height > 1 && style.visibility !== 'hidden'
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

      const isAction = (el) => {
        if (!el || el.nodeType !== 1 || !visible(el) || isHiddenSubtree(el)) return false;
        const tag = el.tagName.toLowerCase();
        if (tag === 'button') return !el.disabled;
        if (tag === 'input') {
          const type = String(el.getAttribute('type') || 'text').toLowerCase();
          return ['button', 'submit', 'reset'].includes(type) && !el.disabled;
        }
        if (el.getAttribute('role') === 'button') return true;
        if (tag === 'a') {
          const cls = String(el.getAttribute('class') || '').toLowerCase();
          return /\bbtn\b/.test(cls);
        }
        return false;
      };

      const excludedContainer = (el) => {
        if (!el) return true;
        if (el.closest(
          'nav, [role="navigation"], .navbar, .pagination, .breadcrumb, .dropdown-menu, '
          + '[role="tablist"], [role="menu"], .cookie, [class*="cookie"], [id*="cookie"]',
        )) return true;
        const inHeaderNav = el.closest('header')?.querySelector('nav')
          && el.closest('header nav');
        if (inHeaderNav) return true;
        return false;
      };

      const collectActions = (container) => {
        const direct = Array.from(container.children).flatMap((child) => {
          if (isAction(child)) return [child];
          if (child.matches?.('.btn-group, .btn-toolbar')) {
            return Array.from(child.querySelectorAll('button, .btn, [role="button"], a.btn'))
              .filter(isAction);
          }
          return [];
        });
        if (direct.length) return direct;
        return Array.from(
          container.querySelectorAll(':scope > button, :scope > .btn, :scope > [role="button"], :scope > a.btn'),
        ).filter(isAction);
      };

      const isHorizontalCluster = (actions) => {
        if (actions.length < 2) return false;
        const rects = actions.map((el) => el.getBoundingClientRect());
        const tops = rects.map((r) => r.top);
        const topSpread = Math.max(...tops) - Math.min(...tops);
        if (topSpread > 14) return false;
        const leftSpread = Math.max(...rects.map((r) => r.left)) - Math.min(...rects.map((r) => r.left));
        return leftSpread > 24;
      };

      const flexRowContainer = (el) => {
        const style = window.getComputedStyle(el);
        const display = style.display;
        const dir = style.flexDirection;
        if (display === 'flex' || display === 'inline-flex') {
          return dir === 'row' || dir === 'row-reverse' || dir === '';
        }
        return /\bflex-row\b/.test(String(el.className || ''));
      };

      const selectorHintFor = (el) => {
        const id = el.id ? `#${el.id}` : '';
        const cls = norm(el.className).split(' ').filter(Boolean).slice(0, 3).join('.');
        return `${el.tagName.toLowerCase()}${id}${cls ? `.${cls}` : ''}`;
      };

      /** @type {Array<Record<string, unknown>>} */
      const violations = [];
      const scanned = new Set();

      const recordViolation = (container, actions) => {
        if (actions.length <= maxAllowed) return;
        const key = actions.map((el) => `${el.tagName}:${textOf(el).slice(0, 40)}`).join('|');
        if (scanned.has(key)) return;
        scanned.add(key);
        violations.push({
          kind: 'too-many-actions',
          actionCount: actions.length,
          maxAllowed,
          selectorHint: selectorHintFor(container),
          className: norm(container.className).slice(0, 120),
          labels: actions.map((el) => textOf(el).slice(0, 48)).filter(Boolean),
        });
      };

      for (const container of document.querySelectorAll(GROUP_CONTAINER_SELECTOR)) {
        if (!visible(container) || excludedContainer(container)) continue;
        const actions = collectActions(container).filter(isAction);
        if (!isHorizontalCluster(actions)) continue;
        recordViolation(container, actions);
      }

      const flexRoots = document.querySelectorAll(
        'main .d-flex, main .d-inline-flex, main [class*="flex-row"], '
        + '.landing-hero-actions .d-flex, [class*="hero-actions"] .d-flex',
      );
      for (const container of flexRoots) {
        if (!visible(container) || excludedContainer(container)) continue;
        if (!flexRowContainer(container)) continue;
        const actions = collectActions(container);
        if (actions.length < maxAllowed + 1) continue;
        if (!isHorizontalCluster(actions)) continue;
        recordViolation(container, actions);
      }

      return {
        maxAllowed,
        groupCount: violations.length,
        violations: violations.slice(0, 12),
      };
    },
    { maxAllowed, GROUP_CONTAINER_SELECTOR },
  );
}

export async function run({ metrics, page, url }) {
  const report = metrics?.buttonGroupMaxReport
    ?? (page ? await collectButtonGroupMaxReport(page) : null);
  if (!report || !(report.violations || []).length) return [];
  return findingsFromButtonGroupMaxReport(report, url || metrics?.url || '');
}
