import { requirePage, withUrl } from '../../../lib/det-check-helpers.mjs';

export const rule = {
  id: 'DET.A11Y.GENERIC.KEYBOARD_ACCESS',
  lane: 'deterministic',
  area: 'accessibility',
  defaultSeverity: 'warn',
  priorityWeight: 8,
  source: 'docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-keyboard-access',
};

/**
 * @param {{ page?: import('playwright').Page, url?: string }} ctx
 */
export async function run(ctx) {
  const page = requirePage(ctx);
  if (!page) return [];

  const report = await page.evaluate(() => {
    const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();
    /** @type {Array<Record<string, unknown>>} */
    const hits = [];

    for (const el of document.querySelectorAll('[onclick],[onmousedown]')) {
      if (!(el instanceof HTMLElement)) continue;
      const tag = el.tagName.toLowerCase();
      if (tag === 'a' || tag === 'button' || tag === 'input' || tag === 'select') continue;
      if (el.getAttribute('role') === 'button' || el.tabIndex >= 0) continue;
      hits.push({ kind: 'click-no-keyboard', tag, id: el.id || '' });
      if (hits.length >= 6) break;
    }

    for (const el of document.querySelectorAll(
      'div[role="button"],span[role="button"],div[tabindex="-1"],span[tabindex="-1"]',
    )) {
      if (!(el instanceof HTMLElement)) continue;
      if (el.tabIndex === -1 && !el.getAttribute('aria-disabled')) {
        hits.push({ kind: 'negative-tabindex-control', tag: el.tagName.toLowerCase() });
        if (hits.length >= 8) break;
      }
    }

    for (const el of document.querySelectorAll('a[href="#"],a:not([href])')) {
      const t = norm(el.textContent || '');
      if (t.length > 2) continue;
      hits.push({ kind: 'empty-link', tag: 'a' });
      if (hits.length >= 10) break;
    }

    return { hits: hits.slice(0, 8) };
  });

  const findings = (report.hits || []).map((h) => {
    if (h.kind === 'click-no-keyboard') {
      return {
        severity: 'warn',
        area: 'accessibility',
        message: 'Element uses mouse-only handler without native keyboard support (2.1.1 heuristic).',
        evidence: `<${h.tag}> id="${h.id}"`,
        remediation: 'Use `<button>`/`<a>` or add tabindex, role, and keyboard handlers.',
      };
    }
    if (h.kind === 'negative-tabindex-control') {
      return {
        severity: 'warn',
        area: 'accessibility',
        message: 'Control-like element has tabindex=-1 and may be unreachable by keyboard (2.1.1).',
        evidence: `<${h.tag}>`,
        remediation: 'Ensure custom controls are focusable and operable via keyboard.',
      };
    }
    return {
      severity: 'minor',
      area: 'accessibility',
      message: 'Link may lack discernible purpose for keyboard users (2.1.1 / 2.4.4).',
      evidence: 'empty or hash-only link',
      remediation: 'Provide href and visible link text.',
    };
  });

  return withUrl(findings, ctx.url);
}
