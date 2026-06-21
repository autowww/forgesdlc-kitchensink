/**
 * DET.APP.DISABLED_REASON — disabled primary controls expose visible reason or precondition text.
 */

export const rule = {
  id: 'DET.APP.DISABLED_REASON',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'accessibility',
  scoreDimension: 'accessibilitySemanticsMeta',
  defaultSeverity: 'major',
  priorityWeight: 8,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-app-disabled-reason',
};

/**
 * @param {{ violations?: Array<Record<string, unknown>> } | null | undefined} report
 * @param {string} [url]
 */
export function findingsFromDisabledReasonReport(report, url = '') {
  const violations = Array.isArray(report?.violations) ? report.violations : [];
  if (!violations.length) return [];

  return violations.slice(0, 8).map((v) => ({
    severity: 'major',
    area: 'accessibility',
    message:
      'A disabled primary control does not expose why it is disabled (adjacent help text, title, or aria-describedby).',
    evidence: `control="${String(v.controlHint || '')}"`,
    remediation:
      'Add visible precondition copy, title, or aria-describedby targeting an element with [data-disabled-reason] or .form-text.',
  })).map((f) => (url ? { ...f, evidence: `${f.evidence} url=${url}` } : f));
}

/** @param {import('playwright').Page} page */
export async function collectDisabledReasonReport(page) {
  return page.evaluate(() => {
    const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();
    const visible = (el) => {
      if (!el || el.nodeType !== 1) return false;
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') return false;
      const rect = el.getBoundingClientRect();
      return rect.width > 4 && rect.height > 4;
    };

    const isDisabledPrimary = (el) => {
      if (!el || el.nodeType !== 1) return false;
      const disabled =
        el.disabled
        || el.getAttribute('aria-disabled') === 'true'
        || el.hasAttribute('disabled');
      if (!disabled) return false;
      if (el.hasAttribute('data-studio-primary-cta')) return true;
      const tag = el.tagName.toLowerCase();
      if (tag !== 'button' && tag !== 'input') return false;
      const cls = String(el.className || '').toLowerCase();
      return /\bbtn-primary\b/.test(cls) || el.getAttribute('type') === 'submit';
    };

    const hasVisibleReason = (control) => {
      const title = norm(control.getAttribute('title') || '');
      if (title.length >= 8) return true;

      const describedBy = control.getAttribute('aria-describedby');
      if (describedBy) {
        for (const id of describedBy.split(/\s+/)) {
          const node = document.getElementById(id);
          if (node && visible(node) && norm(node.textContent).length >= 8) return true;
        }
      }

      const fieldset = control.closest('fieldset, .form-group, [data-form-row], .studio-form-row');
      const scope = fieldset || control.parentElement;
      if (scope) {
        for (const hint of scope.querySelectorAll(
          '[data-disabled-reason], .form-text, .invalid-feedback, [role="note"]',
        )) {
          if (!visible(hint)) continue;
          if (norm(hint.textContent).length >= 8) return true;
        }
      }

      let sib = control.nextElementSibling;
      for (let i = 0; i < 2 && sib; i += 1, sib = sib.nextElementSibling) {
        if (!visible(sib)) continue;
        const text = norm(sib.textContent || '');
        if (text.length >= 8 && /(required|select|choose|complete|enable|before|cannot|until)/i.test(text)) {
          return true;
        }
      }
      return false;
    };

    /** @type {Array<Record<string, unknown>>} */
    const violations = [];

    for (const control of document.querySelectorAll(
      'button, input[type="submit"], [data-studio-primary-cta]',
    )) {
      if (!visible(control) || !isDisabledPrimary(control)) continue;
      if (hasVisibleReason(control)) continue;
      const hint = control.id
        ? `#${control.id}`
        : norm(control.getAttribute('aria-label') || control.textContent || '').slice(0, 48);
      violations.push({ controlHint: hint });
    }

    return { violations: violations.slice(0, 12) };
  });
}

export async function run({ metrics, page, url }) {
  const report = metrics?.disabledReasonReport
    ?? (page ? await collectDisabledReasonReport(page) : null);
  if (!report?.violations?.length) return [];
  return findingsFromDisabledReasonReport(report, url || metrics?.url || '');
}
