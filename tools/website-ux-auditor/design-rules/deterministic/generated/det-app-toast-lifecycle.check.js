/**
 * DET.APP.TOAST_LIFECYCLE — status toasts use live regions, allow dismiss when persistent, avoid covering CTAs.
 */

export const rule = {
  id: 'DET.APP.TOAST_LIFECYCLE',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'accessibility',
  scoreDimension: 'accessibilitySemanticsMeta',
  defaultSeverity: 'major',
  priorityWeight: 8,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-app-toast-lifecycle',
};

/**
 * @param {{ violations?: Array<Record<string, unknown>> } | null | undefined} report
 * @param {string} [url]
 */
export function findingsFromToastLifecycleReport(report, url = '') {
  const violations = Array.isArray(report?.violations) ? report.violations : [];
  if (!violations.length) return [];

  return violations.slice(0, 8).map((v) => ({
    severity: 'major',
    area: 'accessibility',
    message:
      v.issue === 'missing-live-region'
        ? 'A visible toast/status surface is missing role="status", role="alert", or aria-live.'
        : v.issue === 'persistent-without-dismiss'
          ? 'A persistent toast does not provide a dismiss control.'
          : 'A toast or status layer overlaps a primary control in the viewport.',
    evidence: `issue=${String(v.issue || '')} toast="${String(v.toastHint || '')}"`,
    remediation:
      v.issue === 'missing-live-region'
        ? 'Wrap toast copy in role="status" or aria-live="polite" (assertive for errors).'
        : v.issue === 'persistent-without-dismiss'
          ? 'Add an accessible dismiss button with aria-label="Dismiss" or data-bs-dismiss="toast".'
          : 'Reposition the toast container or lower z-index so primary CTAs remain clickable.',
  })).map((f) => (url ? { ...f, evidence: `${f.evidence} url=${url}` } : f));
}

/** @param {import('playwright').Page} page */
export async function collectToastLifecycleReport(page) {
  return page.evaluate(() => {
    const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();
    const visible = (el) => {
      if (!el || el.nodeType !== 1) return false;
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') return false;
      const rect = el.getBoundingClientRect();
      return rect.width > 4 && rect.height > 4;
    };

    const rectsOverlap = (a, b) => {
      if (!a || !b) return false;
      return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
    };

    const toastCandidates = [
      ...document.querySelectorAll(
        '[role="status"], [role="alert"], [aria-live], .toast, .toast-container, [data-toast], [data-ks-type="status-banner"]',
      ),
    ].filter(visible);

    const primaryCtas = [
      ...document.querySelectorAll('[data-studio-primary-cta], .btn-primary'),
    ].filter(visible);

    /** @type {Array<Record<string, unknown>>} */
    const violations = [];

    for (const toast of toastCandidates) {
      const role = toast.getAttribute('role') || '';
      const live = toast.getAttribute('aria-live') || '';
      const isLive = role === 'status' || role === 'alert' || live === 'polite' || live === 'assertive';
      const hint = toast.id ? `#${toast.id}` : norm(toast.className || '').slice(0, 40) || 'toast';

      if (!isLive && toast.matches('.toast, [data-toast], .toast-container')) {
        violations.push({ issue: 'missing-live-region', toastHint: hint });
      }

      const persistent =
        toast.getAttribute('data-bs-autohide') === 'false'
        || toast.classList.contains('show')
        || toast.getAttribute('aria-live') === 'assertive';
      if (persistent) {
        const dismiss = toast.querySelector(
          '[data-bs-dismiss="toast"], [aria-label*="dismiss" i], button.btn-close, [data-dismiss]',
        );
        if (!dismiss || !visible(dismiss)) {
          violations.push({ issue: 'persistent-without-dismiss', toastHint: hint });
        }
      }

      const toastRect = toast.getBoundingClientRect();
      for (const cta of primaryCtas) {
        if (!rectsOverlap(toastRect, cta.getBoundingClientRect())) continue;
        violations.push({ issue: 'covers-primary-cta', toastHint: hint });
        break;
      }
    }

    return { violations: violations.slice(0, 12) };
  });
}

export async function run({ metrics, page, url }) {
  const report = metrics?.toastLifecycleReport
    ?? (page ? await collectToastLifecycleReport(page) : null);
  if (!report?.violations?.length) return [];
  return findingsFromToastLifecycleReport(report, url || metrics?.url || '');
}
