import { makeFinding } from '../lib/severity.js';
import { pageContext } from './context.js';

export const checkId = 'first-screen-density';

export function runCheck(m, url, ctx = {}) {
  const siteKind = ctx.siteKind || 'generic';
  const { isHome, isPlatformHandbookInner } = pageContext(url, siteKind);
  if (isPlatformHandbookInner) return [];

  const findings = [];
  const add = (severity, area, message, evidence, remediation) => findings.push(
    makeFinding({ checkId, severity, area, message, evidence, remediation }),
  );

  if (isHome && m.wordCount > 1400) {
    add('critical', 'page-depth', 'Homepage body copy is likely too long for a product landing page.', `${m.wordCount} words detected.`, 'Move reference, operational, schema, and handbook details into deeper docs pages.');
  } else if (m.wordCount > 1800) {
    add('major', 'page-depth', 'This page is long and may need progressive disclosure.', `${m.wordCount} words detected.`, 'Split overview, quickstart, reference, and operations content into separate pages or accordions.');
  }

  const HANDBOOK_HOME_FOLD_LIMIT_KINDS = new Set(['platform', 'lenses', 'fleet', 'lcdl']);
  const foldWordLimit = HANDBOOK_HOME_FOLD_LIMIT_KINDS.has(siteKind) && isHome ? 380 : 320;
  if (m.aboveFoldWordCount > foldWordLimit) {
    add('critical', 'first-screen', 'The first screen contains too much text.', `${m.aboveFoldWordCount} words above the fold (main column).`, 'Reduce above-fold content to hero, subhead, two CTAs, and one visual/diagram.');
  }

  return findings;
}
