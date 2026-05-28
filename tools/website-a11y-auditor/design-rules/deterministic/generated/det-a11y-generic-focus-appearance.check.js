import { requirePage, withUrl } from '../../../lib/det-check-helpers.mjs';

export const rule = {
  id: 'DET.A11Y.GENERIC.FOCUS_APPEARANCE',
  lane: 'deterministic',
  area: 'accessibility',
  defaultSeverity: 'warn',
  priorityWeight: 7,
  source: 'docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-focus-appearance',
};

export async function run(ctx) {
  const page = requirePage(ctx);
  if (!page) return [];

  const report = await page.evaluate(() => {
    /** @type {Array<Record<string, unknown>>} */
    const hits = [];
    const style = document.createElement('style');
    style.textContent = '.ks-a11y-focus-probe:focus { outline: none !important; }';
    document.head.appendChild(style);
    const probe = document.createElement('button');
    probe.type = 'button';
    probe.className = 'ks-a11y-focus-probe';
    probe.textContent = 'probe';
    probe.style.cssText = 'position:absolute;left:-9999px;';
    document.body.appendChild(probe);
    probe.focus();
    const unfocused = getComputedStyle(probe);
    const outlineNone =
      (unfocused.outlineStyle === 'none' || unfocused.outlineWidth === '0px') &&
      unfocused.boxShadow === 'none';
    probe.remove();
    style.remove();
    if (outlineNone) hits.push({ kind: 'no-default-focus-style' });
    return { hits };
  });

  const findings = (report.hits || []).map((h) => ({
    severity: 'warn',
    area: 'accessibility',
    message: 'Default focus indicator may be suppressed globally (2.4.13 supplemental).',
    evidence: String(h.kind),
    remediation: 'Provide a visible focus indicator ≥2px perimeter with 3:1 contrast change.',
  }));

  return withUrl(findings, ctx.url);
}
