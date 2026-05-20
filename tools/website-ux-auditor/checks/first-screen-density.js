import { makeFinding } from '../lib/severity.js';
import { pageContext } from './context.js';

export const checkId = 'first-screen-density';

export function runCheck(m, url, ctx = {}) {
  const siteKind = ctx.siteKind || 'generic';
  const { isHome, isPlatformHandbookInner } = pageContext(url, siteKind);
  if (isPlatformHandbookInner) return [];

  const findings = [];
  const add = (severity, area, message, evidence, remediation, extra = null) =>
    findings.push(
      makeFinding({
        checkId,
        severity,
        area,
        message,
        evidence,
        remediation,
        ...(extra && typeof extra === 'object' ? extra : {}),
      }),
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

  const hmw = typeof m.heroMainWordCount === 'number' ? m.heroMainWordCount : 0;
  if (isHome && hmw > 240) {
    add(
      'critical',
      'first-screen',
      'Hero band contains dense copy (hero text budget exceeded).',
      `hero_main_word_count=${hmw}`,
      'Shorten hero/subhead; move mechanism paragraphs below the first visual or into a follow-on section.',
    );
  }

  const smg = m.sectionMedianGapPx;
  if (isHome && typeof smg === 'number' && smg > 0 && smg < 30 && (m.sections?.length ?? 0) > 5) {
    add(
      'major',
      'first-screen',
      'Vertical spacing between sections looks tight relative to section count (cramped rhythm).',
      `section_median_gap_px=${smg}; visible_sections=${m.sections?.length ?? 0}`,
      'Increase section padding/margins or merge micro-sections to restore enterprise whitespace.',
      { deterministicRule: 'DET.VISUAL.RHYTHM' },
    );
  }

  if (isHome && (m.cards ?? 0) > 22) {
    add(
      'major',
      'first-screen',
      'Homepage surfaces an unusually high card/tile/feature count (density).',
      `card_like_surfaces=${m.cards ?? 0}`,
      'Collapse rails into fewer outcome cards or move detailed tiles to deeper pages.',
    );
  }

  return findings;
}
