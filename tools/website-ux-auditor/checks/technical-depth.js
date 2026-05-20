import { makeFinding } from '../lib/severity.js';
import { pageContext } from './context.js';

export const checkId = 'technical-depth';

export function runCheck(m, url, ctx = {}) {
  const siteKind = ctx.siteKind || 'generic';
  const { isHome, isPlatformHandbookInner } = pageContext(url, siteKind);
  if (isPlatformHandbookInner) return [];

  const findings = [];
  const add = (severity, area, message, evidence, remediation) => findings.push(
    makeFinding({ checkId, severity, area, message, evidence, remediation }),
  );

  if ((m.codeAboveFold ?? 0) > 0) {
    add('critical', 'technical-depth', 'Technical artifacts appear above the fold.', `${m.codeAboveFold} pre/code/table elements above the fold in main.`, 'Move code, tables, endpoints, and generated reference material below the story path or into docs.');
  }
  if ((m.tables ?? 0) > 2 && isHome) {
    add('major', 'technical-depth', 'The homepage relies on tables.', `${m.tables} tables detected.`, 'Convert early comparison/detail tables into outcome cards or diagrams; keep tables in reference pages.');
  }
  if ((m.preBlocks ?? 0) + (m.codeBlocks ?? 0) > 8 && isHome) {
    add('major', 'technical-depth', 'The homepage has many code/reference blocks.', `${m.preBlocks ?? 0} pre blocks and ${m.codeBlocks ?? 0} inline code elements detected.`, 'Keep the homepage product-led and link to quickstarts/reference pages.');
  }

  if (m.technicalPrecedesMainExplanation === true) {
    add(
      'critical',
      'technical-depth',
      'Technical/reference blocks precede the first substantial explanatory paragraph in main (progressive disclosure inversion).',
      `first_technical_block_top=${m.firstTechnicalBlockTop ?? 'null'}; first_explainer_paragraph_top=${m.firstExplainerParagraphTop ?? 'null'}`,
      'Lead with a short product explanation paragraph, then expose tables/code/API paths—or move technical artifacts to docs pages.',
    );
  }

  const apiHits = typeof m.apiLikePathHits === 'number' ? m.apiLikePathHits : 0;
  if (isHome && apiHits > 10) {
    add(
      'major',
      'technical-depth',
      'Homepage copy surfaces many API-style path snippets (endpoint density).',
      `api_like_path_hits=${apiHits}`,
      'Translate endpoints into plain-language capabilities and link raw paths to reference sections.',
    );
  } else if (!isHome && apiHits > 22) {
    add(
      'major',
      'technical-depth',
      'Page body includes many API-style path snippets (endpoint density).',
      `api_like_path_hits=${apiHits}`,
      'Group endpoints in a reference table or move them behind progressive disclosure.',
    );
  }

  const tbl = m.tables ?? 0;
  const preCt = m.preBlocks ?? 0;
  if (isHome && tbl + preCt > 6) {
    add(
      'minor',
      'technical-depth',
      'Homepage stacks many tables/pre blocks (reference-density proxy).',
      `tables=${tbl}; pre_blocks=${preCt}`,
      'Prefer outcome/diagram bands on the homepage and keep exhaustive tables in docs.',
    );
  }

  return findings;
}
