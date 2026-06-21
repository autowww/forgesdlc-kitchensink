/**
 * DET.APP.MODAL_DISMISSAL_GUARD — modals expose close affordance; destructive flows guard unsaved changes.
 */

export const rule = {
  id: 'DET.APP.MODAL_DISMISSAL_GUARD',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'accessibility',
  scoreDimension: 'accessibilitySemanticsMeta',
  defaultSeverity: 'major',
  priorityWeight: 8,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-app-modal-dismissal-guard',
};

/**
 * @param {{ violations?: Array<Record<string, unknown>> } | null | undefined} report
 * @param {string} [url]
 */
export function findingsFromModalDismissalReport(report, url = '') {
  const violations = Array.isArray(report?.violations) ? report.violations : [];
  if (!violations.length) return [];

  return violations.slice(0, 8).map((v) => ({
    severity: 'major',
    area: 'accessibility',
    message:
      v.issue === 'missing-close'
        ? 'An open modal or panel is missing a visible close/dismiss affordance.'
        : 'A modal with editable fields exposes a destructive primary action without cancel or unsaved guard.',
    evidence: `issue=${String(v.issue || '')} modal="${String(v.modalHint || '')}"`,
    remediation:
      v.issue === 'missing-close'
        ? 'Add .btn-close or a button with aria-label containing "Close" and data-bs-dismiss="modal" where applicable.'
        : 'Pair destructive confirms with Cancel/Back and data-unsaved or confirm copy when inputs changed.',
  })).map((f) => (url ? { ...f, evidence: `${f.evidence} url=${url}` } : f));
}

/** @param {import('playwright').Page} page */
export async function collectModalDismissalReport(page) {
  return page.evaluate(() => {
    const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();
    const visible = (el) => {
      if (!el || el.nodeType !== 1) return false;
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') return false;
      const rect = el.getBoundingClientRect();
      return rect.width > 8 && rect.height > 8;
    };

    const openModals = [
      ...document.querySelectorAll(
        '[role="dialog"][aria-modal="true"], .modal.show, dialog[open], [data-panel-open="true"]',
      ),
    ].filter(visible);

    /** @type {Array<Record<string, unknown>>} */
    const violations = [];

    for (const modal of openModals) {
      const hint = modal.id ? `#${modal.id}` : norm(modal.getAttribute('aria-label') || '').slice(0, 40) || 'modal';

      const closeBtn = modal.querySelector(
        '[data-bs-dismiss="modal"], [data-dismiss], .btn-close, button[aria-label*="close" i], button[aria-label*="dismiss" i]',
      );
      if (!closeBtn || !visible(closeBtn)) {
        violations.push({ issue: 'missing-close', modalHint: hint });
      }

      const hasInputs = modal.querySelector('input:not([type="hidden"]), textarea, select, [contenteditable="true"]');
      const destructive = modal.querySelector(
        'button.btn-danger, [data-action="delete"], [data-destructive], button[type="submit"].btn-danger',
      );
      const cancel = modal.querySelector(
        '[data-bs-dismiss="modal"], button:not(.btn-primary):not(.btn-danger), [data-action="cancel"]',
      );
      const unsavedGuard =
        modal.hasAttribute('data-unsaved')
        || modal.querySelector('[data-unsaved-guard], [data-confirm-destructive]');

      if (hasInputs && destructive && visible(destructive) && (!cancel || !visible(cancel)) && !unsavedGuard) {
        violations.push({ issue: 'destructive-without-guard', modalHint: hint });
      }
    }

    return { violations: violations.slice(0, 10) };
  });
}

export async function run({ metrics, page, url }) {
  const report = metrics?.modalDismissalReport
    ?? (page ? await collectModalDismissalReport(page) : null);
  if (!report?.violations?.length) return [];
  return findingsFromModalDismissalReport(report, url || metrics?.url || '');
}
