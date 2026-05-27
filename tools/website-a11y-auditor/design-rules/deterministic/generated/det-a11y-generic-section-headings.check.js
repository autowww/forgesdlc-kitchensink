import { requirePage, withUrl } from '../../../lib/det-check-helpers.mjs';

export const rule = {
  id: 'DET.A11Y.GENERIC.SECTION_HEADINGS',
  lane: 'deterministic',
  area: 'accessibility',
  defaultSeverity: 'warn',
  priorityWeight: 7,
  source: 'docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-section-headings',
};

const MIN_WORDS = 450;

/**
 * @param {{ page?: import('playwright').Page, url?: string }} ctx
 */
export async function run(ctx) {
  const page = requirePage(ctx);
  if (!page) return [];

  const report = await page.evaluate((minWords) => {
    const main = document.querySelector('main,[role="main"]') || document.body;
    const text = (main.textContent || '').replace(/\s+/g, ' ').trim();
    const words = text ? text.split(/\s+/).length : 0;
    const sectionHeadings = main.querySelectorAll('h2,h3,h4,h5,h6');
    const h1 = document.querySelector('h1');
    let skippedLevel = false;
    if (h1) {
      let seen = 1;
      for (const h of sectionHeadings) {
        const lvl = Number(h.tagName.replace('H', ''));
        if (lvl > seen + 1) {
          skippedLevel = true;
          break;
        }
        seen = Math.max(seen, lvl);
      }
    }
    return {
      words,
      sectionCount: sectionHeadings.length,
      skippedLevel,
    };
  }, MIN_WORDS);

  const findings = [];
  if (report.words >= MIN_WORDS && report.sectionCount === 0) {
    findings.push({
      severity: 'warn',
      area: 'accessibility',
      message: `Long main content (~${report.words} words) has no h2–h6 section headings (2.4.10).`,
      evidence: `words=${report.words} section_headings=0`,
      remediation: 'Add headings that describe sections of content; do not rely on styling alone.',
    });
  }
  if (report.skippedLevel) {
    findings.push({
      severity: 'minor',
      area: 'accessibility',
      message: 'Heading levels skip a rank (e.g. h1 to h4) — section structure may be unclear (2.4.10).',
      evidence: 'skipped_heading_level=true',
      remediation: 'Use sequential heading levels (h2 then h3) without skipping.',
    });
  }

  return withUrl(findings, ctx.url);
}
