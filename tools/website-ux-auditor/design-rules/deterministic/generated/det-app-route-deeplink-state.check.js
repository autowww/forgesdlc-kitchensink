/**
 * DET.APP.ROUTE_DEEPLINK_STATE — deep-linked routes render main content and active nav matches location.
 */

export const rule = {
  id: 'DET.APP.ROUTE_DEEPLINK_STATE',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'informationArchitecture',
  scoreDimension: 'informationArchitecture',
  defaultSeverity: 'major',
  priorityWeight: 9,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-app-route-deeplink-state',
};

/**
 * @param {{ violations?: Array<Record<string, unknown>> } | null | undefined} report
 * @param {string} [url]
 */
export function findingsFromRouteDeeplinkReport(report, url = '') {
  const violations = Array.isArray(report?.violations) ? report.violations : [];
  if (!violations.length) return [];

  return violations.slice(0, 6).map((v) => ({
    severity: 'major',
    area: 'informationArchitecture',
    message:
      v.issue === 'blank-main'
        ? 'The routed view renders blank or near-empty main content after navigation or refresh.'
        : 'Application navigation active state does not match the current route location.',
    evidence: `issue=${String(v.issue || '')} path="${String(v.pathname || '')}"${v.navHint ? ` nav="${String(v.navHint)}"` : ''}`,
    remediation:
      v.issue === 'blank-main'
        ? 'Ensure the route outlet mounts workspace content in main and avoid empty shells on direct loads.'
        : 'Set aria-current="page" (or equivalent active class) on the nav item whose href matches location.pathname.',
  })).map((f) => (url ? { ...f, evidence: `${f.evidence} url=${url}` } : f));
}

/** @param {import('playwright').Page} page */
export async function collectRouteDeeplinkReport(page) {
  return page.evaluate(() => {
    const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();
    const visible = (el) => {
      if (!el || el.nodeType !== 1) return false;
      if (el.getAttribute('aria-hidden') === 'true' || el.hasAttribute('hidden')) return false;
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') return false;
      const rect = el.getBoundingClientRect();
      return rect.width > 4 && rect.height > 4;
    };

    const pathname = window.location.pathname || '/';
    const main =
      document.querySelector('main#main')
      || document.querySelector('[role="main"]')
      || document.querySelector('main')
      || document.querySelector('[data-studio-workspace]');

    /** @type {Array<Record<string, unknown>>} */
    const violations = [];

    if (!main || !visible(main)) {
      violations.push({ issue: 'blank-main', pathname });
      return { pathname, violations };
    }

    const mainText = norm(main.innerText || main.textContent || '');
    const hasMeaningfulContent =
      mainText.length >= 24
      || main.querySelector('h1,h2,h3,button,a[href],[role="button"],table,tbody tr,[data-studio-primary-state]');

    if (!hasMeaningfulContent) {
      violations.push({ issue: 'blank-main', pathname, mainChars: mainText.length });
    }

    const navRoot =
      document.querySelector('nav[aria-label], header nav, [data-app-nav], .studio-nav, .app-shell nav')
      || document.querySelector('nav');

    if (navRoot) {
      const navLinks = [...navRoot.querySelectorAll('a[href]')].filter(visible);
      const active = navLinks.filter((a) => {
        if (a.getAttribute('aria-current') === 'page') return true;
        if (a.classList.contains('active') && !a.classList.contains('dropdown-item')) return true;
        return false;
      });

      if (active.length) {
        const normalizePath = (href) => {
          try {
            const u = new URL(href, window.location.origin);
            return u.pathname.replace(/\/$/, '') || '/';
          } catch {
            return '';
          }
        };
        const current = pathname.replace(/\/$/, '') || '/';
        const match = active.some((a) => {
          const p = normalizePath(a.getAttribute('href') || '');
          return p && (p === current || current.startsWith(`${p}/`));
        });
        if (!match) {
          const hint = active[0].id ? `#${active[0].id}` : norm(active[0].textContent || '').slice(0, 40);
          violations.push({ issue: 'nav-mismatch', pathname, navHint: hint });
        }
      }
    }

    return { pathname, violations: violations.slice(0, 6) };
  });
}

export async function run({ metrics, page, url }) {
  const report = metrics?.routeDeeplinkReport
    ?? (page ? await collectRouteDeeplinkReport(page) : null);
  if (!report?.violations?.length) return [];
  return findingsFromRouteDeeplinkReport(report, url || metrics?.url || '');
}
