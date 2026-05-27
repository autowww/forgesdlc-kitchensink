import { requirePage, withUrl } from '../../../lib/det-check-helpers.mjs';

export const rule = {
  id: 'DET.A11Y.GENERIC.LABELS_INSTRUCTIONS',
  lane: 'deterministic',
  area: 'accessibility',
  defaultSeverity: 'warn',
  priorityWeight: 8,
  source: 'docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-labels-instructions',
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

    for (const input of document.querySelectorAll(
      'input:not([type="hidden"]):not([type="submit"]):not([type="button"]),select,textarea',
    )) {
      if (!(input instanceof HTMLElement)) continue;
      const id = input.id;
      const hasLabel =
        (id && document.querySelector(`label[for="${CSS.escape(id)}"]`)) ||
        input.closest('label') ||
        norm(input.getAttribute('aria-label') || '') ||
        norm(input.getAttribute('aria-labelledby') || '');
      const placeholder = norm(input.getAttribute('placeholder') || '');
      const required = input.hasAttribute('required') || input.getAttribute('aria-required') === 'true';

      if (!hasLabel && placeholder) {
        hits.push({ kind: 'placeholder-only', tag: input.tagName.toLowerCase(), name: input.getAttribute('name') || '' });
      } else if (!hasLabel) {
        hits.push({ kind: 'no-label', tag: input.tagName.toLowerCase(), name: input.getAttribute('name') || '' });
      } else if (required && !placeholder && !norm(input.getAttribute('aria-describedby') || '')) {
        const described = id && document.querySelector(`#${CSS.escape(id)} ~ .help, [id="${id}-help"]`);
        if (!described) {
          hits.push({ kind: 'required-no-hint', tag: input.tagName.toLowerCase() });
        }
      }
      if (hits.length >= 8) break;
    }

    return { hits };
  });

  const findings = (report.hits || []).map((h) => {
    if (h.kind === 'placeholder-only') {
      return {
        severity: 'warn',
        area: 'accessibility',
        message: 'Field may rely on placeholder alone instead of a visible label (3.3.2).',
        evidence: `<${h.tag}> name="${h.name}"`,
        remediation: 'Associate a persistent <label> or aria-label; do not use placeholder as the only label.',
      };
    }
    if (h.kind === 'required-no-hint') {
      return {
        severity: 'minor',
        area: 'accessibility',
        message: 'Required field may lack instructions (3.3.2).',
        evidence: `<${h.tag}>`,
        remediation: 'Add hint text linked with aria-describedby when format constraints apply.',
      };
    }
    return {
      severity: 'major',
      area: 'accessibility',
      message: 'Form control has no associated label or aria-label (3.3.2).',
      evidence: `<${h.tag}> name="${h.name}"`,
      remediation: 'Add <label for="..."> or aria-label for every input.',
    };
  });

  return withUrl(findings, ctx.url);
}
