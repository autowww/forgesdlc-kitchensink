import { requirePage, withUrl } from '../../../lib/det-check-helpers.mjs';

export const rule = {
  id: 'DET.A11Y.GENERIC.FOCUS_CONTEXT_CHANGE',
  lane: 'deterministic',
  area: 'accessibility',
  defaultSeverity: 'major',
  priorityWeight: 9,
  source:
    'docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-focus-context-change',
};

const CONTEXT_RX = /\b(location|window\.open|submit|reload)\b/i;

/**
 * @param {{ page?: import('playwright').Page, url?: string }} ctx
 */
export async function run(ctx) {
  const page = requirePage(ctx);
  if (!page) return [];

  const report = await page.evaluate((contextRxSource) => {
    const contextRx = new RegExp(contextRxSource, 'i');
    const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();
    /** @type {Array<Record<string, unknown>>} */
    const hits = [];

    const attrs = ['onfocus', 'onblur'];
    for (const el of document.querySelectorAll('*')) {
      if (!(el instanceof HTMLElement)) continue;
      for (const attr of attrs) {
        const val = norm(el.getAttribute(attr) || '');
        if (val && contextRx.test(val)) {
          hits.push({
            kind: 'inline-handler',
            attr,
            tag: el.tagName.toLowerCase(),
            id: el.id || '',
            snippet: val.slice(0, 120),
          });
        }
      }
    }

    const autofocus = document.querySelector('[autofocus]');
    if (autofocus instanceof HTMLElement) {
      const inDialog = autofocus.closest('dialog,[role="dialog"],[aria-modal="true"]');
      if (!inDialog) {
        hits.push({
          kind: 'autofocus-outside-dialog',
          tag: autofocus.tagName.toLowerCase(),
          id: autofocus.id || '',
        });
      }
    }

    for (const script of document.querySelectorAll('script:not([src])')) {
      const code = (script.textContent || '').slice(0, 8000);
      if (/\baddEventListener\s*\(\s*['"]focus['"]/i.test(code) && CONTEXT_RX.test(code)) {
        hits.push({ kind: 'script-focus-handler', snippet: code.match(/.{0,80}focus.{0,80}/i)?.[0] || '' });
        break;
      }
    }

    return { hits: hits.slice(0, 8) };
  }, CONTEXT_RX.source);

  const findings = [];
  for (const h of report.hits || []) {
    if (h.kind === 'script-focus-handler') {
      findings.push({
        severity: 'warn',
        area: 'accessibility',
        message:
          'Inline script may change context on focus — verify WCAG 3.2.1 (heuristic; manual review).',
        evidence: `snippet="${String(h.snippet || '').slice(0, 100)}"`,
        remediation: 'Avoid navigation or submit on focus; use explicit user activation.',
      });
      continue;
    }
    if (h.kind === 'autofocus-outside-dialog') {
      findings.push({
        severity: 'warn',
        area: 'accessibility',
        message:
          'An element uses autofocus outside a dialog — verify focus does not trigger unexpected context change (WCAG 3.2.1 heuristic).',
        evidence: `<${h.tag}> id="${h.id}"`,
        remediation:
          'Avoid autofocus on full-page load unless users expect it; prefer focusing the first field in a modal only.',
      });
    } else {
      findings.push({
        severity: 'major',
        area: 'accessibility',
        message:
          'Focus handler may change context (navigation, submit, or new window) without user request — double-check WCAG 3.2.1.',
        evidence: `${h.attr} on <${h.tag}> id="${h.id}" snippet="${h.snippet}"`,
        remediation:
          'Remove onfocus/onblur navigation or submit; use explicit activation (button click) or warn before context change.',
      });
    }
  }

  return withUrl(findings, ctx.url);
}
