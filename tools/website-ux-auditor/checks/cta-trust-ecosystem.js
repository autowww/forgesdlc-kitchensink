import { makeFinding } from '../lib/severity.js';
import { pageContext } from './context.js';

export const checkId = 'cta-trust-ecosystem';

export function runCheck(m, url, ctx = {}) {
  const siteKind = ctx.siteKind || 'generic';
  const { isPlatformHandbookInner } = pageContext(url, siteKind);
  if (isPlatformHandbookInner) return [];

  const findings = [];
  const add = (severity, area, message, evidence, remediation) => findings.push(
    makeFinding({ checkId, severity, area, message, evidence, remediation }),
  );

  const trustWeak = (m.trustTermCount ?? 0) < 4;

  const topCt = m.topCtas ?? [];

  if (topCt.length === 0 && trustWeak) {
    add('blocker', 'conversion', 'No CTAs detected above the fold while the trust model is also insufficiently explicit.', `${m.trustTermCount ?? 0} trust terms; no matched CTA verbs above fold.`, 'Add one primary action, one secondary action, and a concise trust block (boundaries, control, evidence) above the fold.');
  } else if (topCt.length === 0) {
    add('critical', 'conversion', 'No clear CTA was detected above the fold.', 'Top buttons/links did not match expected CTA verbs.', 'Add one primary action for new users and one secondary action for technical users.');
  } else if (trustWeak) {
    add('critical', 'trust', 'The page does not make the trust model concrete enough.', `${m.trustTermCount ?? 0} trust/governance terms detected.`, 'Add a concise trust block covering data boundary, execution boundary, human control, evidence, admin controls, and out-of-scope cases.');
  }

  if (topCt.length > 3) {
    add('major', 'conversion', 'Too many CTAs compete above the fold.', `${topCt.length} CTA-like links/buttons detected above the fold.`, 'Keep the hero to one primary CTA and one secondary CTA.');
  }

  const spread = typeof m.ctaVerticalSpreadPx === 'number' ? m.ctaVerticalSpreadPx : 0;
  if (topCt.length >= 3 && spread < 40) {
    add(
      'major',
      'conversion',
      'Multiple above-fold CTAs are vertically clustered (spacing/proximity suggests competing actions).',
      `top_cta_count=${topCt.length}; cta_vertical_spread_px=${spread}`,
      'Separate primary vs secondary CTAs with clear hierarchy and spacing, or demote extras below the hero band.',
    );
  }

  if ((m.ecosystemTermCount ?? 0) < 2) {
    add('major', 'ecosystem', 'The page does not clearly show where it fits in the Forge ecosystem.', `${m.ecosystemTermCount ?? 0} ecosystem terms detected.`, 'Add an ecosystem strip linking ForgeSDLC, Lenses, LCDL, Fleet, Platform, and Blueprints where relevant.');
  }

  return findings;
}
