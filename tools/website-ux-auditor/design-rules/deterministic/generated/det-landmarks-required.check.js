/**
 * DET.LANDMARKS.REQUIRED — document landmarks: one main, nav when site navigation exists,
 * header/footer chrome in semantic landmarks, and at most one top-level banner/contentinfo each.
 */

/** Minimum outside-main navigational links before nav landmark is required. */
export const MIN_NAV_LINKS_FOR_NAV_LANDMARK = 2;

const CHROME_HEADER_SELECTOR = [
  'header.site-header',
  'header.landing-header',
  '.site-header',
  '.landing-header',
  '[data-shell-region="header"]',
  '[data-shell-region="banner"]',
].join(',');

const CHROME_FOOTER_SELECTOR = [
  'footer',
  '.ks-site-footer-region',
  '.fs-footer',
  '.fs-landing-footer-band',
  '[data-shell-region="footer"]',
].join(',');

export const rule = {
  id: 'DET.LANDMARKS.REQUIRED',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'accessibility',
  scoreDimension: 'accessibilitySemanticsMeta',
  defaultSeverity: 'minor',
  priorityWeight: 8,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-landmarks-required',
};

/**
 * @param {{
 *   mainCount?: number,
 *   navApplicable?: boolean,
 *   navLandmarkCount?: number,
 *   topBannerCount?: number,
 *   topContentinfoCount?: number,
 *   hasChromeHeader?: boolean,
 *   hasChromeFooter?: boolean,
 *   hasBannerLandmark?: boolean,
 *   hasContentinfoLandmark?: boolean,
 * }} snapshot
 * @returns {Array<Record<string, unknown>>}
 */
export function violationsFromLandmarkSnapshot(snapshot) {
  const mainCount = Number(snapshot?.mainCount || 0);
  const navApplicable = Boolean(snapshot?.navApplicable);
  const navLandmarkCount = Number(snapshot?.navLandmarkCount || 0);
  const topBannerCount = Number(snapshot?.topBannerCount || 0);
  const topContentinfoCount = Number(snapshot?.topContentinfoCount || 0);
  const hasChromeHeader = Boolean(snapshot?.hasChromeHeader);
  const hasChromeFooter = Boolean(snapshot?.hasChromeFooter);
  const hasBannerLandmark = Boolean(snapshot?.hasBannerLandmark);
  const hasContentinfoLandmark = Boolean(snapshot?.hasContentinfoLandmark);

  /** @type {Array<Record<string, unknown>>} */
  const violations = [];

  if (mainCount === 0) {
    violations.push({ kind: 'missing-main', mainCount });
  } else if (mainCount > 1) {
    violations.push({ kind: 'duplicate-main', mainCount });
  }

  if (navApplicable && navLandmarkCount === 0) {
    violations.push({ kind: 'missing-nav', navLandmarkCount });
  }

  if (hasChromeHeader && !hasBannerLandmark) {
    violations.push({ kind: 'missing-banner' });
  } else if (topBannerCount > 1) {
    violations.push({ kind: 'duplicate-banner', topBannerCount });
  }

  if (hasChromeFooter && !hasContentinfoLandmark) {
    violations.push({ kind: 'missing-contentinfo' });
  } else if (topContentinfoCount > 1) {
    violations.push({ kind: 'duplicate-contentinfo', topContentinfoCount });
  }

  return violations;
}

/**
 * @param {{ violations?: Array<Record<string, unknown>> } | null | undefined} report
 * @param {string} [url]
 */
export function findingsFromLandmarksReport(report, url = '') {
  const violations = Array.isArray(report?.violations) ? report.violations : [];
  if (!violations.length) return [];

  const findings = [];
  const seen = new Set();

  for (const v of violations.slice(0, 8)) {
    const kind = String(v.kind || 'landmark');
    if (seen.has(kind)) continue;
    seen.add(kind);

    if (kind === 'missing-main') {
      findings.push({
        severity: 'minor',
        area: 'accessibility',
        message: 'The page is missing a primary main landmark for the content column.',
        evidence: 'main_landmark_count=0',
        remediation: 'Wrap the primary content column in <main id="main"> (or a single visible [role="main"]).',
      });
    } else if (kind === 'duplicate-main') {
      findings.push({
        severity: 'minor',
        area: 'accessibility',
        message: 'More than one main landmark is exposed; keep a single primary content region.',
        evidence: `main_landmark_count=${v.mainCount ?? '?'}`,
        remediation: 'Retain one document-level <main>; nest supplementary regions in sections or aside, not additional main elements.',
      });
    } else if (kind === 'missing-nav') {
      findings.push({
        severity: 'minor',
        area: 'accessibility',
        message: 'Site navigation links exist outside main but no navigation landmark was found.',
        evidence: 'nav_landmark_count=0 nav_applicable=true',
        remediation: 'Wrap global navigation in <nav aria-label="…"> (or [role="navigation"]) outside the main column.',
      });
    } else if (kind === 'missing-banner') {
      findings.push({
        severity: 'minor',
        area: 'accessibility',
        message: 'Header chrome is present but not exposed as a header or banner landmark.',
        evidence: 'chrome_header_without_banner=true',
        remediation: 'Use <header> for the site header shell (or role="banner" on the top-level chrome root).',
      });
    } else if (kind === 'duplicate-banner') {
      findings.push({
        severity: 'minor',
        area: 'accessibility',
        message: 'Multiple top-level header or banner landmarks were detected.',
        evidence: `top_banner_landmark_count=${v.topBannerCount ?? '?'}`,
        remediation: 'Keep one document-level header/banner outside main; nest section headers inside main or article.',
      });
    } else if (kind === 'missing-contentinfo') {
      findings.push({
        severity: 'minor',
        area: 'accessibility',
        message: 'Footer chrome is present but not exposed as a footer or contentinfo landmark.',
        evidence: 'chrome_footer_without_contentinfo=true',
        remediation: 'Use <footer> for the site footer shell (or role="contentinfo" on the top-level footer root).',
      });
    } else if (kind === 'duplicate-contentinfo') {
      findings.push({
        severity: 'minor',
        area: 'accessibility',
        message: 'Multiple top-level footer or contentinfo landmarks were detected.',
        evidence: `top_contentinfo_landmark_count=${v.topContentinfoCount ?? '?'}`,
        remediation: 'Keep one document-level footer/contentinfo; move ancillary footers inside main or sections.',
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
export async function collectLandmarksReport(page, minNavLinks = MIN_NAV_LINKS_FOR_NAV_LANDMARK) {
  const snapshot = await page.evaluate(
    ({ minNavLinks, CHROME_HEADER_SELECTOR, CHROME_FOOTER_SELECTOR }) => {
      const visible = (el) => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        return rect.width > 40 && rect.height > 24 && style.visibility !== 'hidden'
          && style.display !== 'none' && Number(style.opacity || 1) > 0.05;
      };

      const isA11yHidden = (el) => {
        let node = el;
        while (node && node.nodeType === 1) {
          if (node.getAttribute('aria-hidden') === 'true') return true;
          const style = window.getComputedStyle(node);
          if (style.display === 'none' || style.visibility === 'hidden') return true;
          node = node.parentElement;
        }
        return false;
      };

      const landmarkVisible = (el) => el instanceof HTMLElement && visible(el) && !isA11yHidden(el);

      const mainEl = document.querySelector('main#main') || document.querySelector('main');
      const isOutsideMain = (el) => {
        if (!mainEl) return true;
        return !mainEl.contains(el);
      };

      const isDocumentLevelLandmark = (el) => {
        if (!landmarkVisible(el)) return false;
        return !el.closest('main, article, aside, section');
      };

      const isBannerEl = (el) => {
        const tag = el.tagName.toLowerCase();
        return tag === 'header' || el.getAttribute('role') === 'banner';
      };

      const isContentinfoEl = (el) => {
        const tag = el.tagName.toLowerCase();
        return tag === 'footer' || el.getAttribute('role') === 'contentinfo';
      };

      const mainLandmarks = [
        ...document.querySelectorAll('main'),
        ...document.querySelectorAll('[role="main"]'),
      ].filter(landmarkVisible);

      const topBanners = [
        ...document.querySelectorAll('header, [role="banner"]'),
      ].filter((el) => isDocumentLevelLandmark(el) && isBannerEl(el));

      const topContentinfos = [
        ...document.querySelectorAll('footer, [role="contentinfo"]'),
      ].filter((el) => isDocumentLevelLandmark(el) && isContentinfoEl(el));

      const uniqueLandmarks = (list) => {
        const roots = list.filter(
          (el, _i, arr) => !arr.some((other) => other !== el && other.contains(el)),
        );
        return roots;
      };

      const mainRoots = uniqueLandmarks(mainLandmarks);
      const bannerRoots = uniqueLandmarks(topBanners);
      const contentinfoRoots = uniqueLandmarks(topContentinfos);

      const navLandmarks = [
        ...document.querySelectorAll('nav'),
        ...document.querySelectorAll('[role="navigation"]'),
      ].filter((el) => landmarkVisible(el) && isOutsideMain(el));
      const navRoots = uniqueLandmarks(navLandmarks);

      const auxiliaryLink = (anchor) => {
        const raw = String(anchor.getAttribute('href') || '').trim();
        const hLower = raw.toLowerCase();
        const al = String(anchor.getAttribute('aria-label') || '').toLowerCase();
        if (!raw || hLower.startsWith('javascript:')) return true;
        if (/^#(main|content|skip|top|skipnav|navbarNav|page|root)\b/i.test(raw)) return true;
        if (/\bskip\b/.test(al) || al.includes('skip to')) return true;
        return false;
      };

      const outsideMainNavLinks = Array.from(
        document.querySelectorAll('header a[href], nav a[href], aside a[href], [class*="sidebar"] a[href]'),
      ).filter((a) => visible(a) && !auxiliaryLink(a) && isOutsideMain(a));

      const hasChromeHeader = Array.from(document.querySelectorAll(CHROME_HEADER_SELECTOR))
        .some((el) => landmarkVisible(el) && isOutsideMain(el));
      const hasChromeFooter = Array.from(document.querySelectorAll(CHROME_FOOTER_SELECTOR))
        .some((el) => landmarkVisible(el) && isOutsideMain(el));

      const hasBannerLandmark = bannerRoots.length > 0;
      const hasContentinfoLandmark = contentinfoRoots.length > 0;

      return {
        mainCount: mainRoots.length,
        navApplicable: outsideMainNavLinks.length >= minNavLinks,
        navLandmarkCount: navRoots.length,
        topBannerCount: bannerRoots.length,
        topContentinfoCount: contentinfoRoots.length,
        hasChromeHeader,
        hasChromeFooter,
        hasBannerLandmark,
        hasContentinfoLandmark,
        outsideMainNavLinkCount: outsideMainNavLinks.length,
      };
    },
    { minNavLinks, CHROME_HEADER_SELECTOR, CHROME_FOOTER_SELECTOR },
  );

  const violations = violationsFromLandmarkSnapshot(snapshot);
  return {
    ...snapshot,
    violations,
  };
}

export async function run({ metrics, page, url }) {
  const report = metrics?.landmarksReport
    ?? (page ? await collectLandmarksReport(page) : null);
  if (!report || !(report.violations || []).length) return [];
  return findingsFromLandmarksReport(report, url || metrics?.url || '');
}
