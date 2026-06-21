/**
 * DET.APP.CONTROL_A11Y — KS React primitives expose correct ARIA roles/states
 * for keyboard and screen-reader users (expand/collapse, listbox, toolbar, live status).
 */

/** Minimum characters for an accessible control name. */
export const MIN_ACCESSIBLE_NAME_CHARS = 1;

const PRIMITIVE_ROOT_SELECTOR = [
  '[data-ks-react-root="true"]',
  '[data-ks-type="react-primitive"][data-ks-hash]',
].join(',');

const INTERACTIVE_SELECTOR = [
  'button:not([disabled])',
  'a[href]',
  '[role="button"]:not([aria-disabled="true"])',
  '[role="option"]',
  '[role="menuitem"]',
  '[role="tab"]',
  '[role="switch"]',
  '[role="checkbox"]',
  '[role="radio"]',
  '[role="combobox"]',
].join(',');

const WIDGET_ROLES = new Set([
  'button', 'link', 'checkbox', 'radio', 'switch', 'tab', 'menuitem', 'option',
  'combobox', 'slider', 'spinbutton', 'textbox', 'searchbox', 'listbox',
  'treeitem', 'gridcell', 'row', 'columnheader', 'rowheader',
]);

const PASSTHROUGH_ROLES = new Set([
  'presentation', 'none', 'group', 'region', 'note', 'list', 'listitem',
  'status', 'alert', 'toolbar',
]);

export const rule = {
  id: 'DET.APP.CONTROL_A11Y',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'accessibility',
  scoreDimension: 'accessibilitySemanticsMeta',
  defaultSeverity: 'minor',
  priorityWeight: 8,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-app-control_a11y',
};

/**
 * @param {{ violations?: Array<Record<string, unknown>>, primitiveRootCount?: number } | null | undefined} report
 * @param {string} [url]
 */
export function findingsFromAppControlA11yReport(report, url = '') {
  const violations = Array.isArray(report?.violations) ? report.violations : [];
  if (!violations.length) return [];

  const findings = [];
  const seen = new Set();

  for (const v of violations.slice(0, 10)) {
    const kind = String(v.kind || 'unknown');
    const key = `${kind}:${v.hash || ''}:${v.id || ''}:${v.tag || ''}:${v.role || ''}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const hash = String(v.hash || '?');
    const hint = String(v.id || v.className || v.tag || 'control').slice(0, 100);

    if (kind === 'missing-accessible-name') {
      findings.push({
        severity: 'major',
        area: 'accessibility',
        message: 'A KS React primitive control is missing a non-empty accessible name.',
        evidence: `hash=${hash} ${String(v.tag || 'control')}${v.role ? `[role=${v.role}]` : ''} id="${hint}"`,
        remediation:
          'Add visible text, aria-label, or aria-labelledby on interactive controls inside react-primitive roots per docs/design/catalog/primitives/FAM-react-primitives.md.',
      });
      continue;
    }

    if (kind === 'missing-aria-expanded') {
      findings.push({
        severity: 'warn',
        area: 'accessibility',
        message: 'An expandable KS React primitive trigger is missing aria-expanded.',
        evidence: `hash=${hash} trigger id="${hint}" haspopup=${String(v.haspopup || '')} controls=${String(v.controls || '')}`,
        remediation:
          'Set aria-expanded="true|false" on listbox/menu/disclosure triggers (TileDropdownControl, WorkspaceLensControl, ForgeDiagnosticPanel, etc.).',
      });
      continue;
    }

    if (kind === 'option-missing-selected') {
      findings.push({
        severity: 'minor',
        area: 'accessibility',
        message: 'A listbox option inside a KS React primitive is missing aria-selected.',
        evidence: `hash=${hash} role=option id="${hint}"`,
        remediation:
          'Expose aria-selected="true|false" on each role="option" inside listbox panels.',
      });
      continue;
    }

    if (kind === 'listbox-missing-label') {
      findings.push({
        severity: 'minor',
        area: 'accessibility',
        message: 'A listbox inside a KS React primitive lacks an accessible name.',
        evidence: `hash=${hash} listbox id="${hint}"`,
        remediation:
          'Wire aria-label or aria-labelledby on role="listbox" panels (see TileDropdownControl panelAriaLabel / visible label).',
      });
      continue;
    }

    if (kind === 'toolbar-missing-label') {
      findings.push({
        severity: 'minor',
        area: 'accessibility',
        message: 'A toolbar inside a KS React primitive lacks an accessible name.',
        evidence: `hash=${hash} toolbar id="${hint}"`,
        remediation:
          'Set aria-label (or aria-labelledby) on role="toolbar" roots such as ForgeDecisionActionBar.',
      });
      continue;
    }

    if (kind === 'banner-missing-live-role') {
      findings.push({
        severity: 'minor',
        area: 'accessibility',
        message: 'ForgeStatusBanner root is missing role="status" or role="alert".',
        evidence: `hash=${hash} ks-name=${String(v.ksName || 'forge-status-banner')}`,
        remediation:
          'Keep role="status" (default) or role="alert" on ForgeStatusBanner so screen readers announce state changes.',
      });
      continue;
    }

    if (kind === 'focusable-without-role') {
      findings.push({
        severity: 'major',
        area: 'accessibility',
        message: 'A focusable div/span inside a KS React primitive lacks a widget role.',
        evidence: `hash=${hash} <${String(v.tag || 'div')}> tabindex=${String(v.tabindex ?? '?')} id="${hint}"`,
        remediation:
          'Use native button/link elements or add an appropriate role plus keyboard handlers; avoid tabindex on unlabeled generic div/span shells.',
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
export async function collectAppControlA11yReport(page, minNameChars = MIN_ACCESSIBLE_NAME_CHARS) {
  return page.evaluate(
    ({
      minNameChars,
      PRIMITIVE_ROOT_SELECTOR,
      INTERACTIVE_SELECTOR,
      WIDGET_ROLES,
      PASSTHROUGH_ROLES,
    }) => {
      const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();

      const visible = (el) => {
        if (!el || el.nodeType !== 1) return false;
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

      const textFromNode = (node) => {
        if (!node || node.nodeType !== 1) return '';
        if (node.getAttribute('aria-hidden') === 'true') return '';
        const tag = node.tagName.toLowerCase();
        if (tag === 'img') return norm(node.getAttribute('alt') || '');
        let out = '';
        for (const child of node.childNodes) {
          if (child.nodeType === 3) out += child.textContent || '';
          else if (child.nodeType === 1) out += ` ${textFromNode(child)}`;
        }
        return norm(out);
      };

      const accessibleName = (el) => {
        const ariaLabel = norm(el.getAttribute('aria-label') || '');
        if (ariaLabel.length >= minNameChars) return ariaLabel;

        const labelledby = el.getAttribute('aria-labelledby');
        if (labelledby) {
          const parts = [];
          for (const id of labelledby.split(/\s+/)) {
            const ref = id && document.getElementById(id);
            if (ref) parts.push(textFromNode(ref));
          }
          const joined = norm(parts.join(' '));
          if (joined.length >= minNameChars) return joined;
        }

        const title = norm(el.getAttribute('title') || '');
        if (title.length >= minNameChars) return title;

        return textFromNode(el);
      };

      const belongsToRoot = (el, root) => {
        const owner = el.closest('[data-ks-react-root="true"], [data-ks-type="react-primitive"][data-ks-hash]');
        return owner === root;
      };

      /** @type {Array<Record<string, unknown>>} */
      const violations = [];

      const roots = [...document.querySelectorAll(PRIMITIVE_ROOT_SELECTOR)].filter(
        (el) => visible(el) && !isHiddenSubtree(el),
      );

      for (const root of roots) {
        const hash = norm(root.getAttribute('data-ks-hash') || root.getAttribute('hash') || '');
        const ksName = norm(root.getAttribute('data-ks-name') || '');

        if (ksName === 'forge-status-banner' || hash === 'Fsb') {
          const role = norm(root.getAttribute('role') || '').toLowerCase();
          if (role !== 'status' && role !== 'alert') {
            violations.push({ kind: 'banner-missing-live-role', hash, ksName });
          }
        }

        for (const el of root.querySelectorAll(INTERACTIVE_SELECTOR)) {
          if (!(el instanceof HTMLElement)) continue;
          if (!visible(el) || isHiddenSubtree(el) || !belongsToRoot(el, root)) continue;

          const tag = el.tagName.toLowerCase();
          const role = norm(el.getAttribute('role') || '').toLowerCase();
          const id = el.id || '';
          const className = norm(el.className).slice(0, 80);

          if (accessibleName(el).length < minNameChars) {
            violations.push({
              kind: 'missing-accessible-name',
              hash,
              tag,
              role,
              id,
              className,
            });
          }

          const isTrigger = tag === 'button' || role === 'button' || role === 'combobox';
          if (isTrigger && (el.hasAttribute('aria-haspopup') || el.hasAttribute('aria-controls'))) {
            if (!el.hasAttribute('aria-expanded')) {
              violations.push({
                kind: 'missing-aria-expanded',
                hash,
                tag,
                id,
                className,
                haspopup: el.getAttribute('aria-haspopup') || '',
                controls: el.getAttribute('aria-controls') || '',
              });
            }
          }

          if (role === 'option' && !el.hasAttribute('aria-selected')) {
            violations.push({ kind: 'option-missing-selected', hash, tag, id, className });
          }
        }

        for (const el of root.querySelectorAll('[role="toolbar"]')) {
          if (!(el instanceof HTMLElement) || !visible(el) || !belongsToRoot(el, root)) continue;
          if (accessibleName(el).length < minNameChars) {
            violations.push({
              kind: 'toolbar-missing-label',
              hash,
              id: el.id || '',
              className: norm(el.className).slice(0, 80),
            });
          }
        }

        for (const el of root.querySelectorAll('[role="listbox"]')) {
          if (!(el instanceof HTMLElement) || !visible(el) || !belongsToRoot(el, root)) continue;
          if (accessibleName(el).length < minNameChars) {
            violations.push({
              kind: 'listbox-missing-label',
              hash,
              id: el.id || '',
              className: norm(el.className).slice(0, 80),
            });
          }
          for (const opt of el.querySelectorAll('[role="option"]')) {
            if (!(opt instanceof HTMLElement) || !visible(opt)) continue;
            if (!opt.hasAttribute('aria-selected')) {
              violations.push({
                kind: 'option-missing-selected',
                hash,
                id: opt.id || '',
                className: norm(opt.className).slice(0, 80),
              });
            }
          }
        }

        for (const el of root.querySelectorAll('div[tabindex], span[tabindex]')) {
          if (!(el instanceof HTMLElement) || !belongsToRoot(el, root)) continue;
          const ti = el.tabIndex;
          if (ti < 0 || !visible(el) || isHiddenSubtree(el)) continue;
          const role = norm(el.getAttribute('role') || '').toLowerCase();
          if (!role) {
            violations.push({
              kind: 'focusable-without-role',
              hash,
              tag: el.tagName.toLowerCase(),
              tabindex: ti,
              id: el.id || '',
              className: norm(el.className).slice(0, 80),
            });
            continue;
          }
          if (!WIDGET_ROLES.has(role) && !PASSTHROUGH_ROLES.has(role)) {
            violations.push({
              kind: 'focusable-without-role',
              hash,
              tag: el.tagName.toLowerCase(),
              tabindex: ti,
              role,
              id: el.id || '',
              className: norm(el.className).slice(0, 80),
            });
          }
        }
      }

      return {
        primitiveRootCount: roots.length,
        violations: violations.slice(0, 12),
      };
    },
    {
      minNameChars,
      PRIMITIVE_ROOT_SELECTOR,
      INTERACTIVE_SELECTOR,
      WIDGET_ROLES: [...WIDGET_ROLES],
      PASSTHROUGH_ROLES: [...PASSTHROUGH_ROLES],
    },
  );
}

export async function run({ metrics, page, url }) {
  const report = metrics?.appControlA11yReport
    ?? (page ? await collectAppControlA11yReport(page) : null);
  if (!report || !(report.violations || []).length) return [];
  return findingsFromAppControlA11yReport(report, url || metrics?.url || '');
}
