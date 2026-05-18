import { makeFinding } from '../lib/severity.js';
import { pageContext } from './context.js';

export const checkId = 'platform-handbook-inner';

export function applies(ctx, url) {
  const siteKind = ctx.siteKind || 'generic';
  return pageContext(url, siteKind).isPlatformHandbookInner;
}

/** Inner handbook doc pages for platform, lenses, fleet, lcdl — structural / a11y signals only. */
export function runCheck(m, url) {
  const findings = [];
  const add = (severity, area, message, evidence, remediation) => findings.push(
    makeFinding({ checkId, severity, area, message, evidence, remediation }),
  );

  if (!m.firstH1) add('trivial', 'semantics', 'No visible H1 in the main column; page title may carry the heading.', 'No H1 in <main>.', 'Add an H1 in main content when it improves scanability.');
  if (!m.lang) add('minor', 'accessibility', 'The document lang attribute is missing.', '<html lang> not found.', 'Set the root language, usually <html lang="en">.');
  if (!m.metaDescription || m.metaDescription.length < 40) {
    add('major', 'metadata', 'Meta description is missing or too short.', m.metaDescription ? `Meta description: "${m.metaDescription}"` : 'No meta description found.', 'Add a clear description for search and sharing.');
  }
  if (m.imagesMissingAlt > 0) {
    add('major', 'accessibility', 'Some visible images are missing alt text.', `${m.imagesMissingAlt} visible images without alt text.`, 'Add meaningful alt text for informative images and empty alt for decorative images.');
  }
  if (m.lowContrast?.length) {
    add('major', 'accessibility', 'Potential low-contrast text was detected.', `${m.lowContrast.length} samples below expected contrast thresholds.`, 'Increase foreground/background contrast for text, links, and CTAs.');
  }
  if (m.wordCount > 4500) add('trivial', 'page-depth', 'This page is very long.', `${m.wordCount} words in main column.`, 'Consider splitting very long reference pages.');

  return findings;
}
