import { makeFinding } from '../lib/severity.js';
import { pageContext } from './context.js';

export const checkId = 'readability-structure';

export function runCheck(m, url, ctx = {}) {
  const siteKind = ctx.siteKind || 'generic';
  const { isPlatformHandbookInner } = pageContext(url, siteKind);
  if (isPlatformHandbookInner) return [];

  const findings = [];
  const add = (severity, area, message, evidence, remediation) => findings.push(
    makeFinding({ checkId, severity, area, message, evidence, remediation }),
  );

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

  return findings;
}
