import { makeFinding } from '../lib/severity.js';
import { pageContext } from './context.js';

export const checkId = 'metadata-a11y';

export function runCheck(m, url, ctx = {}) {
  const siteKind = ctx.siteKind || 'generic';
  const { isPlatformHandbookInner } = pageContext(url, siteKind);
  if (isPlatformHandbookInner) return [];

  const findings = [];
  const add = (severity, area, message, evidence, remediation) => findings.push(
    makeFinding({ checkId, severity, area, message, evidence, remediation }),
  );

  if (!m.metaDescription || m.metaDescription.length < 40) {
    add('major', 'metadata', 'Meta description is missing or too short.', m.metaDescription ? `Meta description: "${m.metaDescription}"` : 'No meta description found.', 'Add a 120-160 character description that states what the product is and why it matters.');
  }
  if (!m.lang) {
    add('minor', 'accessibility', 'The document lang attribute is missing.', '<html lang> not found.', 'Set the root language, usually <html lang="en">.');
  }
  if ((m.imagesMissingAlt ?? 0) > 0) {
    add('major', 'accessibility', 'Some visible images are missing alt text.', `${m.imagesMissingAlt} visible images without alt text.`, 'Add meaningful alt text for informative images and empty alt for decorative images.');
  }
  if ((m.lowContrast ?? []).length) {
    add('major', 'accessibility', 'Potential low-contrast text was detected.', `${m.lowContrast.length} samples below expected contrast thresholds.`, 'Increase foreground/background contrast for text, links, and CTAs.');
  }

  return findings;
}
