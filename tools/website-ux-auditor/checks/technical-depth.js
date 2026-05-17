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

  return findings;
}
