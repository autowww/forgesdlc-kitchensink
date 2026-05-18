import { makeFinding } from '../lib/severity.js';
import { pageContext } from './context.js';

export const checkId = 'product-visual';

const REMEDIATION = [
  'Add a hero-scale product screenshot, architecture diagram, or governed-flow visual inside <main> above the fold (see Product Visual Requirement in docs/design/forge-enterprise-ai-website-standard.md).',
  'Do not satisfy this finding by rewriting Markdown hero copy alone—allocate a visual slot in the landing layout first.',
].join(' ');

/** Live DOM metrics only — skip when Playwright metric blob omits visual counters. */
export function runCheck(m, url, ctx = {}) {
  const siteKind = ctx.siteKind || 'generic';
  const { isHome, isPlatformHandbookInner } = pageContext(url, siteKind);
  if (!isHome || isPlatformHandbookInner) return [];
  if (typeof m.mainHeroVisualAboveFoldCount !== 'number') return [];

  const n = m.mainHeroVisualAboveFoldCount;
  if (n >= 1) return [];

  return [
    makeFinding({
      checkId,
      severity: 'blocker',
      area: 'first-screen',
      message: 'Homepage lacks a hero-scale product/system visual in the first viewport.',
      evidence: `main_hero_visual_above_fold_count=${n}`,
      remediation: REMEDIATION,
    }),
  ];
}
