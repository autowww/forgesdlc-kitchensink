import { makeFinding } from '../lib/severity.js';
import { pageContext } from './context.js';

export const checkId = 'hero-headings';

export function runCheck(m, url, ctx = {}) {
  const siteKind = ctx.siteKind || 'generic';
  const { isHome, isPlatformHandbookInner } = pageContext(url, siteKind);
  if (isPlatformHandbookInner) return [];

  const findings = [];
  const add = (severity, area, message, evidence, remediation) => findings.push(
    makeFinding({ checkId, severity, area, message, evidence, remediation }),
  );

  if (!m.firstH1) {
    const sev = isHome ? 'blocker' : 'critical';
    add(sev, 'hero', 'No visible H1 was found.', 'A clear H1 is required for first-screen comprehension.', 'Add one dominant outcome-led H1 near the top of the page.');
  } else {
    if (m.firstH1.words < 3) add('minor', 'hero', 'The H1 may be too terse to explain the product.', `H1: "${m.firstH1.text}"`, 'Use a 4-9 word headline that states the product promise.');
    if (m.firstH1.words > 12) add('major', 'hero', 'The H1 is longer than the Forge standard recommends.', `H1 is ${m.firstH1.words} words.`, 'Shorten the H1 to one bold promise and move nuance into the subhead.');
    if (m.h1Count > 1) add('major', 'semantics', 'Multiple H1s may weaken page hierarchy.', `${m.h1Count} H1 elements found.`, 'Keep one H1 per primary landing page and use H2/H3 for sections.');
  }

  return findings;
}
