import { makeFinding } from '../lib/severity.js';
import { pageContext } from './context.js';

export const checkId = 'app-shell-inner';

export function applies(ctx, url) {
  const siteKind = ctx.siteKind || 'generic';
  return pageContext(url, siteKind).isAppShell;
}

/**
 * Desktop app shells (A11y Studio, Lenses-style operator UIs): structural and a11y
 * signals only — no marketing homepage, hero, or handbook chrome heuristics.
 */
export function runCheck(m, url) {
  const findings = [];
  const add = (severity, area, message, evidence, remediation) =>
    findings.push(makeFinding({ checkId, severity, area, message, evidence, remediation }));

  if (!m.firstH1) {
    add(
      'minor',
      'semantics',
      'No visible H1 in the main column; page title may carry the heading.',
      'No H1 in <main>.',
      'Add an H1 in the active workspace region when it improves scanability.',
    );
  }
  if (!m.lang) {
    add(
      'minor',
      'accessibility',
      'The document lang attribute is missing.',
      '<html lang> not found.',
      'Set the root language, usually <html lang="en">.',
    );
  }
  if (m.imagesMissingAlt > 0) {
    add(
      'major',
      'accessibility',
      'Some visible images are missing alt text.',
      `${m.imagesMissingAlt} visible images without alt text.`,
      'Add meaningful alt text for informative images and empty alt for decorative images.',
    );
  }
  if (m.lowContrast?.length) {
    add(
      'major',
      'accessibility',
      'Potential low-contrast text was detected.',
      `${m.lowContrast.length} samples below expected contrast thresholds.`,
      'Increase foreground/background contrast for text, links, and controls.',
    );
  }
  if (!m.pageTitle || String(m.pageTitle).trim().length < 3) {
    add(
      'minor',
      'metadata',
      'Document title is missing or too short for an app shell.',
      m.pageTitle ? `title="${m.pageTitle}"` : 'No <title> found.',
      'Set a concise window title that names the product and active workspace.',
    );
  }

  return findings;
}
