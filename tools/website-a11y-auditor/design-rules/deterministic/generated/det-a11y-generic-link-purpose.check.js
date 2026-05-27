import { requirePage, withUrl } from '../../../lib/det-check-helpers.mjs';

export const rule = {
  id: 'DET.A11Y.GENERIC.LINK_PURPOSE',
  lane: 'deterministic',
  area: 'accessibility',
  defaultSeverity: 'warn',
  priorityWeight: 8,
  source: 'docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-link-purpose',
};

const VAGUE_RX = /^(click here|here|more|read more|learn more|link)$/i;

/**
 * @param {{ page?: import('playwright').Page, url?: string }} ctx
 */
export async function run(ctx) {
  const page = requirePage(ctx);
  if (!page) return [];

  const report = await page.evaluate((vagueSource) => {
    const vagueRx = new RegExp(vagueSource, 'i');
    const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();
    /** @type {Array<Record<string, unknown>>} */
    const hits = [];
    /** @type {Map<string, Set<string>>} */
    const byHref = new Map();

    for (const a of document.querySelectorAll('a[href]')) {
      const href = a.getAttribute('href') || '';
      if (!href || href.startsWith('#')) continue;
      const label = norm(a.getAttribute('aria-label') || a.textContent || '');
      const title = norm(a.getAttribute('title') || '');
      if (!label && !title) {
        hits.push({ kind: 'empty', href: href.slice(0, 60) });
      } else if (vagueRx.test(label)) {
        hits.push({ kind: 'vague', label, href: href.slice(0, 60) });
      }
      if (label) {
        if (!byHref.has(href)) byHref.set(href, new Set());
        byHref.get(href).add(label.toLowerCase());
      }
    }

    for (const [href, labels] of byHref) {
      if (labels.size > 1) {
        hits.push({
          kind: 'inconsistent',
          href: href.slice(0, 60),
          labels: [...labels].join(' | '),
        });
      }
    }

    return { hits: hits.slice(0, 8) };
  }, VAGUE_RX.source);

  const findings = (report.hits || []).map((h) => {
    if (h.kind === 'empty') {
      return {
        severity: 'major',
        area: 'accessibility',
        message: 'Link has no discernible text or aria-label (WCAG 2.4.4).',
        evidence: `href="${h.href}"`,
        remediation: 'Add meaningful link text or aria-label describing the destination.',
      };
    }
    if (h.kind === 'vague') {
      return {
        severity: 'warn',
        area: 'accessibility',
        message: `Link text "${h.label}" may not describe purpose in context (2.4.4).`,
        evidence: `href="${h.href}"`,
        remediation: 'Replace generic phrases with destination-specific text.',
      };
    }
    return {
      severity: 'warn',
      area: 'accessibility',
      message: 'Same URL uses different link text across the page (2.4.4).',
      evidence: `href="${h.href}" labels=${h.labels}`,
      remediation: 'Use consistent link text for the same destination unless context differs.',
    };
  });

  return withUrl(findings, ctx.url);
}
