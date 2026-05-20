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
  if (n < 1) {
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

  /** @type {ReturnType<typeof makeFinding>[]} */
  const findings = [];
  const hv = m.heroPrimaryVisual;
  if (hv && typeof hv === 'object') {
    if (hv.decorativeGuess) {
      findings.push(
        makeFinding({
          checkId,
          severity: 'critical',
          area: 'first-screen',
          message: 'Largest above-fold hero visual reads as decorative/background-only (weak product-story signal).',
          evidence: `hero_primary_visual tag=${hv.tag} decorative_guess=1 size=${hv.width}x${hv.height}`,
          remediation:
            'Replace ambient textures with a diagram/screenshot/visual that explains the product story; keep decorative assets behind content per `aria-hidden`/empty-alt patterns.',
        }),
      );
    }
    if (hv.width < 260 || hv.height < 170) {
      findings.push(
        makeFinding({
          checkId,
          severity: 'major',
          area: 'first-screen',
          message: 'Hero-scale visual may be too small to read as a product/system illustration.',
          evidence: `hero_primary_visual size=${hv.width}x${hv.height}`,
          remediation: 'Increase hero visual dimensions or swap in a higher-signal diagram at monitor-grade sizing.',
        }),
      );
    }
    if (hv.tag === 'img' && hv.altLen < 12 && !hv.hasCaption) {
      findings.push(
        makeFinding({
          checkId,
          severity: 'major',
          area: 'first-screen',
          message: 'Primary hero image lacks meaningful alt/caption support (accessibility + story anchoring).',
          evidence: `hero_primary_visual alt_len=${hv.altLen} has_caption=${hv.hasCaption ? 1 : 0}`,
          remediation: 'Add specific alt text or a figcaption that names what the visitor should learn from the visual.',
        }),
      );
    }
    const h1t = m.firstMainH1Top;
    if (typeof h1t === 'number' && Number.isFinite(h1t) && hv.top > h1t + 540) {
      findings.push(
        makeFinding({
          checkId,
          severity: 'major',
          area: 'first-screen',
          message: 'Primary hero visual sits far below the main headline (weak immediate visual proof).',
          evidence: `first_main_h1_top=${h1t}; hero_visual_top=${hv.top}`,
          remediation: 'Move the primary story visual closer to the hero headline or insert an interim diagram above the fold.',
        }),
      );
    }
  }

  return findings;
}
