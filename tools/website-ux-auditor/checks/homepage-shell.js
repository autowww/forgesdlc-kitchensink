import { homepageShellPolicyFor } from '../lib/product-profiles.js';
import { makeFinding } from '../lib/severity.js';
import { pageContext } from './context.js';

export const checkId = 'homepage-shell';

const HARD_REMEDIATION = [
  'Separate the public landing route from the generated handbook shell (page mode taxonomy in docs/design/forge-enterprise-ai-website-standard.md).',
  'Move full docs/sidebar trees behind /handbook, /docs, /reference, /maintainer, or equivalent deep routes.',
  'Do not satisfy this finding with Markdown hero edits alone—fix layout/routing first.',
].join(' ');

const NAV_REMEDIATION = `${HARD_REMEDIATION} Consolidate duplicate desktop/mobile navigation trees that repeat handbook links before <main>.`;

/** Live Playwright metrics only; omit homepageShellMetricsPresent → skip without fabricating scores. */
export function runCheck(m, url, ctx = {}) {
  const siteKind = ctx.siteKind || 'generic';
  const { isHome } = pageContext(url, siteKind);
  if (!isHome || m.homepageShellMetricsPresent !== true) return [];

  const policy = homepageShellPolicyFor(siteKind);
  const sidebar = typeof m.sidebarOffcanvasLinkCount === 'number' ? m.sidebarOffcanvasLinkCount : 0;
  const preMain = typeof m.preMainFirstH1LinkCount === 'number' ? m.preMainFirstH1LinkCount : 0;
  const hbHits = typeof m.handbookChromeTermHits === 'number' ? m.handbookChromeTermHits : 0;
  const dupSurplus = typeof m.duplicateNavLinkTextCount === 'number' ? m.duplicateNavLinkTextCount : 0;

  const shellEvidence = [
    `sidebar_offcanvas_links=${sidebar}`,
    `pre_main_first_h1_links=${preMain}`,
    `handbook_chrome_term_hits=${hbHits}`,
    `duplicate_nav_link_surplus=${dupSurplus}`,
    typeof m.firstMainH1Top === 'number' ? `first_main_h1_top_px=${m.firstMainH1Top}` : 'first_main_h1_top_px=n/a',
  ].join('; ');

  const sidebarHeavy = sidebar > policy.maxSidebarOffcanvasLinksBlocker;
  const chromeHeavy = hbHits >= policy.handbookChromeTermCritical;

  const findings = [];

  const add = (severity, area, message, remediation = HARD_REMEDIATION) =>
    findings.push(
      makeFinding({
        checkId,
        severity,
        area,
        message,
        evidence: shellEvidence,
        remediation,
      }),
    );

  if (siteKind === 'platform') {
    if (sidebarHeavy || chromeHeavy) {
      add(
        'blocker',
        'information-architecture',
        'Forge Platform homepage shows handbook/sidebar-style chrome ahead of the product landing story.',
      );
    }
  } else if (sidebarHeavy && chromeHeavy) {
    add(
      'blocker',
      'information-architecture',
      'Public homepage reads as handbook/docs chrome ahead of the product landing story (sidebar + handbook framing).',
    );
  } else if (sidebarHeavy && policy.maxSidebarOffcanvasLinksBlocker < 900) {
    add('critical', 'navigation', 'Sidebar/offcanvas region exposes an unusually large documentation link rail.', NAV_REMEDIATION);
  } else if (sidebarHeavy) {
    add(
      'major',
      'navigation',
      'Elevated sidebar/offcanvas link counts—ensure handbook indexes are routed off `/`.',
      NAV_REMEDIATION,
    );
  }

  if (preMain > policy.maxPreMainFirstH1LinksCritical) {
    add('critical', 'navigation', 'Too many links appear strictly above the first main H1 (pre-hero link wall).', NAV_REMEDIATION);
  }

  if (dupSurplus > policy.duplicateNavLinkTextsMajor) {
    add('major', 'navigation', 'Repeated link labels across chrome hint at duplicated handbook trees.', NAV_REMEDIATION);
  }

  return findings;
}
