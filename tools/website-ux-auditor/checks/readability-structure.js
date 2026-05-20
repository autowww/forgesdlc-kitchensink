import { makeFinding } from '../lib/severity.js';
import { pageContext } from './context.js';

export const checkId = 'readability-structure';

export function runCheck(m, url, ctx = {}) {
  const siteKind = ctx.siteKind || 'generic';
  const { isHome, isPlatformHandbookInner } = pageContext(url, siteKind);
  if (isPlatformHandbookInner) return [];

  const findings = [];
  const add = (severity, area, message, evidence, remediation) => findings.push(
    makeFinding({ checkId, severity, area, message, evidence, remediation }),
  );

  const hbr = typeof m.headingBodyWordRatio === 'number' ? m.headingBodyWordRatio : 0;
  if (hbr > 0.38 && (m.wordCount ?? 0) > 520) {
    add(
      'major',
      'readability',
      'Heading copy may dominate body copy (weak heading-to-body balance for long pages).',
      `heading_body_word_ratio=${hbr.toFixed(3)}; word_count=${m.wordCount ?? 0}`,
      'Tighten heading text, break dense bands into shorter body paragraphs, or move reference prose to child pages.',
    );
  }

  const afAc = typeof m.aboveFoldAcronymLikeCount === 'number' ? m.aboveFoldAcronymLikeCount : 0;
  if (isHome && afAc >= 12) {
    add(
      'critical',
      'messaging',
      'First screen may overload acronym-like tokens before plain-language framing.',
      `above_fold_acronym_like_count=${afAc}`,
      'Lead with outcomes, spell out acronyms once, and move mechanism-heavy lists below the hero.',
    );
  } else if (!isHome && afAc >= 16 && (m.wordCount ?? 0) > 900) {
    add(
      'major',
      'messaging',
      'Above-the-fold acronym density is high for an inner page.',
      `above_fold_acronym_like_count=${afAc}; word_count=${m.wordCount ?? 0}`,
      'Add a plain-language intro band or glossary link before dense internal shorthand.',
    );
  }

  const uniqAc = typeof m.uniqueAcronymLikeCount === 'number' ? m.uniqueAcronymLikeCount : 0;
  if ((m.wordCount ?? 0) > 1400 && uniqAc >= 28) {
    add(
      'major',
      'messaging',
      'Page-wide acronym/token cardinality is high vs length (jargon density).',
      `unique_acronym_like_count=${uniqAc}; word_count=${m.wordCount ?? 0}`,
      'Reduce unique internal tokens above the fold; consolidate synonyms and move reference naming to docs.',
    );
  }

  const fvlc = typeof m.firstViewportLinkCount === 'number' ? m.firstViewportLinkCount : 0;
  if (isHome && fvlc > 28) {
    add(
      'critical',
      'navigation',
      'The first viewport contains many navigational links (link-wall risk).',
      `first_viewport_link_count=${fvlc}`,
      'Curate hero-adjacent navigation; move exhaustive indexes and trees to docs sidebars or dedicated pages.',
    );
  }

  if ((m.preMainFirstH1LinkCount ?? 0) > 12) {
    add(
      'critical',
      'navigation',
      'Many substantive links appear before the primary in-main H1 (docs-first chrome leakage).',
      `pre_main_first_h1_link_count=${m.preMainFirstH1LinkCount ?? 0}`,
      'Reduce pre-hero link walls; keep the first screen story-led and move deep reference links below the hero.',
    );
  }

  if ((m.navLinks?.length ?? 0) > 12) {
    add('major', 'navigation', 'Header/navigation appears crowded.', `${m.navLinks.length} visible header/nav links.`, 'Use curated top nav plus grouped dropdowns; keep product-local nav to 4-6 items.');
  }
  if ((m.links?.filter((l) => l.top < 1200).length ?? 0) > 30) {
    add('major', 'navigation', 'Early page area may feel like a link wall.', `${m.links.filter((l) => l.top < 1200).length} visible links in the early page area.`, 'Replace exhaustive link lists with 3-5 role/outcome paths and move complete trees to docs.');
  }

  const aboveTechnical = (m.technicalHits ?? []).filter((h) => h.aboveFold);
  if (aboveTechnical.length) {
    add('critical', 'messaging', 'Technical vocabulary appears before plain-language framing.', aboveTechnical.map((h) => h.term).join(', '), 'Lead with outcomes and translate jargon before exposing implementation terms.');
  }
  const allTechnical = (m.technicalHits ?? []).filter((h) => h.anywhere);
  if (allTechnical.length >= 4) {
    add('major', 'messaging', 'The page contains many internal/technical terms.', allTechnical.map((h) => h.term).join(', '), 'Add glossary/translation treatment and move dense mechanism detail to docs/reference.');
  }

  if ((m.outcomeTermCount ?? 0) < 4) {
    add('major', 'messaging', 'The page may be mechanism-led rather than outcome-led.', `${m.outcomeTermCount ?? 0} outcome terms detected.`, 'Rewrite section headings and cards around user outcomes before mechanisms.');
  }

  const longParagraphs = (m.paragraphs ?? []).filter((p) => p.words > 85);
  if (longParagraphs.length) {
    add('minor', 'readability', 'Some paragraphs are too long for a spacious enterprise landing page.', `${longParagraphs.length} paragraphs exceed 85 words.`, 'Split long paragraphs into one-sentence blocks, cards, or deeper docs.');
  }

  const longSections = (m.sections ?? []).filter((s) => s.words > 280);
  if (longSections.length) {
    add('major', 'page-depth', 'Some sections carry too much context.', `${longSections.length} visible sections exceed 280 words.`, 'Split long sections into overview + details or move reference content to child pages.');
  }

  const mpm = typeof m.maxParagraphMeasurePx === 'number' ? m.maxParagraphMeasurePx : 0;
  if (mpm > 960) {
    add(
      'minor',
      'readability',
      'Measured paragraph width suggests very long line lengths (readability / enterprise polish).',
      `max_paragraph_measure_px=${mpm}`,
      'Constrain reading measure with grid layouts or max-width containers for body copy.',
    );
  }

  const fonts = typeof m.distinctFontFamiliesSampled === 'number' ? m.distinctFontFamiliesSampled : 0;
  const colors = typeof m.distinctTextColorsSampled === 'number' ? m.distinctTextColorsSampled : 0;
  if (isHome && fonts > 5) {
    add(
      'minor',
      'first-screen',
      'Sampled font-family usage suggests typeface proliferation in the main column.',
      `distinct_font_families_sampled=${fonts}`,
      'Consolidate heading/body/label stacks to the documented theme fonts.',
    );
  }
  if (isHome && colors > 16) {
    add(
      'minor',
      'first-screen',
      'Sampled text colors suggest token or theme drift in the main column.',
      `distinct_text_colors_sampled=${colors}`,
      'Align text/label colors to design tokens and reduce one-off CSS overrides.',
    );
  }

  const secVp = typeof m.secondViewportLinkCount === 'number' ? m.secondViewportLinkCount : 0;
  if (isHome && secVp > 42) {
    add(
      'major',
      'navigation',
      'Second viewport still carries many links (sustained link-wall density).',
      `second_viewport_link_count=${secVp}`,
      'Replace long early-page link grids with a few curated paths plus deeper docs navigation.',
    );
  }

  return findings;
}
