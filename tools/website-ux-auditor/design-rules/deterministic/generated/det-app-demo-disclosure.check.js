/**
 * DET.APP.DEMO_DISCLOSURE — demo/mock containers expose visible Sample or Demo labeling.
 */

export const DEMO_LABEL_RE = /\b(demo|sample|mock|illustrative)\b/i;

export const rule = {
  id: 'DET.APP.DEMO_DISCLOSURE',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'trustAndEcosystemTruth',
  scoreDimension: 'trustAndEcosystemTruth',
  defaultSeverity: 'major',
  priorityWeight: 8,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-app-demo-disclosure',
};

/**
 * @param {{ violations?: Array<Record<string, unknown>> } | null | undefined} report
 * @param {string} [url]
 */
export function findingsFromDemoDisclosureReport(report, url = '') {
  const violations = Array.isArray(report?.violations) ? report.violations : [];
  if (!violations.length) return [];

  return violations.slice(0, 6).map((v) => ({
    severity: 'major',
    area: 'trustAndEcosystemTruth',
    message:
      'Demo or mock data is shown without a visible Sample/Demo label in the same section.',
    evidence: `container="${String(v.selectorHint || '')}"`,
    remediation:
      'Add a visible badge or sentence with "Demo", "Sample", or "Mock" in the same card/section, or set data-demo with adjacent label text.',
  })).map((f) => (url ? { ...f, evidence: `${f.evidence} url=${url}` } : f));
}

/** @param {import('playwright').Page} page */
export async function collectDemoDisclosureReport(page) {
  return page.evaluate(() => {
    const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();
    const demoRe = /\b(demo|sample|mock|illustrative)\b/i;

    const visible = (el) => {
      if (!el || el.nodeType !== 1) return false;
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') return false;
      const rect = el.getBoundingClientRect();
      return rect.width > 8 && rect.height > 8;
    };

    const isDemoContainer = (el) => {
      if (el.hasAttribute('data-demo') || el.hasAttribute('data-mock')) return true;
      if (String(el.getAttribute('data-mock-source') || '').toLowerCase() === 'demo') return true;
      return false;
    };

    const hasDemoLabel = (container) => {
      const text = norm(container.innerText || container.textContent || '');
      if (demoRe.test(text)) return true;
      for (const badge of container.querySelectorAll(
        '.badge, .chip, .studio-demo-label, [data-demo-label]',
      )) {
        if (!visible(badge)) continue;
        if (demoRe.test(norm(badge.textContent || ''))) return true;
      }
      return false;
    };

    /** @type {Array<Record<string, unknown>>} */
    const violations = [];

    for (const el of document.querySelectorAll('[data-demo], [data-mock], [data-mock-source]')) {
      if (!visible(el) || !isDemoContainer(el)) continue;
      if (hasDemoLabel(el)) continue;
      const hint = el.id ? `#${el.id}` : el.tagName.toLowerCase();
      violations.push({ selectorHint: hint });
    }

    return { violations: violations.slice(0, 10) };
  });
}

export async function run({ metrics, page, url }) {
  const report = metrics?.demoDisclosureReport
    ?? (page ? await collectDemoDisclosureReport(page) : null);
  if (!report?.violations?.length) return [];
  return findingsFromDemoDisclosureReport(report, url || metrics?.url || '');
}
