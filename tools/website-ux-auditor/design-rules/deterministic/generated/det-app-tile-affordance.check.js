/**
 * DET.APP.TILE_AFFORDANCE — link-style dashboard tiles must be links or proper buttons.
 */

export const rule = {
  id: 'DET.APP.TILE_AFFORDANCE',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'conversion',
  scoreDimension: 'trustAndEcosystemTruth',
  defaultSeverity: 'major',
  priorityWeight: 8,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-app-tile-affordance',
};

/**
 * @param {{ violations?: Array<Record<string, unknown>> } | null | undefined} report
 * @param {string} [url]
 */
export function findingsFromTileAffordanceReport(report, url = '') {
  const violations = Array.isArray(report?.violations) ? report.violations : [];
  if (!violations.length) return [];

  return violations.slice(0, 6).map((v) => ({
    severity: 'major',
    area: 'conversion',
    message:
      'A tile looks clickable but is not a link or keyboard-operable button.',
    evidence: `tile="${String(v.selectorHint || '')}"`,
    remediation:
      'Use <a href="…"> for navigation tiles or add role="button", tabindex="0", and keyboard activation.',
  })).map((f) => (url ? { ...f, evidence: `${f.evidence} url=${url}` } : f));
}

/** @param {import('playwright').Page} page */
export async function collectTileAffordanceReport(page) {
  return page.evaluate(() => {
    const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();

    const visible = (el) => {
      if (!el || el.nodeType !== 1) return false;
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') return false;
      const rect = el.getBoundingClientRect();
      return rect.width > 20 && rect.height > 20;
    };

    const looksClickable = (el) => {
      const style = window.getComputedStyle(el);
      if (style.cursor === 'pointer') return true;
      const cls = String(el.className || '').toLowerCase();
      return /\bdashboard-kpi-card--link\b|\btile--link\b|\bclickable\b/.test(cls);
    };

    const isProperControl = (el) => {
      const tag = el.tagName.toLowerCase();
      if (tag === 'a' && el.getAttribute('href')) return true;
      if (tag === 'button') return true;
      const role = el.getAttribute('role');
      if (role === 'button' || role === 'link') {
        return el.hasAttribute('tabindex') || tag === 'button' || tag === 'a';
      }
      return false;
    };

    const tileSelector = '.dashboard-kpi-card, [data-studio-tile]';

    /** @type {Array<Record<string, unknown>>} */
    const violations = [];

    for (const el of document.querySelectorAll(tileSelector)) {
      if (!visible(el) || !looksClickable(el)) continue;
      if (isProperControl(el)) continue;
      const hint = el.id ? `#${el.id}` : norm(el.className).split(' ')[0] || 'tile';
      violations.push({ selectorHint: hint });
    }

    return { violations: violations.slice(0, 8) };
  });
}

export async function run({ metrics, page, url }) {
  const report = metrics?.tileAffordanceReport
    ?? (page ? await collectTileAffordanceReport(page) : null);
  if (!report?.violations?.length) return [];
  return findingsFromTileAffordanceReport(report, url || metrics?.url || '');
}
