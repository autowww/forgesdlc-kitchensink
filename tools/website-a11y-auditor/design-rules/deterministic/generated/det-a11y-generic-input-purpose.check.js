import { requirePage, withUrl } from '../../../lib/det-check-helpers.mjs';

export const rule = {
  id: 'DET.A11Y.GENERIC.INPUT_PURPOSE',
  lane: 'deterministic',
  area: 'accessibility',
  defaultSeverity: 'warn',
  priorityWeight: 8,
  source: 'docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-input-purpose',
};

const PURPOSE_HINTS = [
  { re: /email|e-mail/i, type: 'email', autocomplete: 'email' },
  { re: /password|passwd/i, type: 'password', autocomplete: 'current-password' },
  { re: /telephone|phone|tel/i, type: 'tel', autocomplete: 'tel' },
  { re: /given-name|first.?name/i, autocomplete: 'given-name' },
  { re: /family-name|last.?name|surname/i, autocomplete: 'family-name' },
  { re: /postal|zip|post.?code/i, autocomplete: 'postal-code' },
  { re: /street|address-line/i, autocomplete: 'street-address' },
];

/**
 * WCAG 2.1 1.3.5 — identify input purpose.
 * @param {{ page?: import('playwright').Page, url?: string }} ctx
 */
export async function run(ctx) {
  const page = requirePage(ctx);
  if (!page) return [];

  const report = await page.evaluate((hints) => {
    /** @type {Array<Record<string, unknown>>} */
    const hits = [];
    const inputs = document.querySelectorAll(
      'input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]):not([type="submit"]):not([type="button"]), textarea, select',
    );
    for (const el of inputs) {
      if (!(el instanceof HTMLElement)) continue;
      const type = (el.getAttribute('type') || 'text').toLowerCase();
      const name = `${el.getAttribute('name') || ''} ${el.getAttribute('id') || ''} ${el.getAttribute('placeholder') || ''} ${el.getAttribute('aria-label') || ''}`;
      const auto = (el.getAttribute('autocomplete') || '').trim().toLowerCase();
      if (auto && auto !== 'off' && auto !== 'on') continue;
      for (const hint of hints) {
        if (hint.type && type !== hint.type && hint.type !== 'text') continue;
        if (!hint.re.test(name)) continue;
        hits.push({
          tag: el.tagName.toLowerCase(),
          name: name.trim().slice(0, 80),
          expected: hint.autocomplete,
        });
        break;
      }
      if (hits.length >= 6) break;
    }
    return { hits };
  }, PURPOSE_HINTS);

  return withUrl(
    (report.hits || []).map((h) => ({
      severity: 'warn',
      area: 'accessibility',
      message: `Collecting ${h.name || 'user data'} field lacks autocomplete token (WCAG 1.3.5).`,
      evidence: `expected=${h.expected}`,
      remediation: `Add autocomplete="${h.expected}" (or a valid WCAG token) to help user agents.`,
    })),
    ctx.url,
  );
}
