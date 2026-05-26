/**
 * DET.A11Y.KS.HANDBOOK_SINGLE_H1 — handbook chapter layout should expose one primary h1 in main.
 */

export const rule = {
  id: 'DET.A11Y.KS.HANDBOOK_SINGLE_H1',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'accessibility',
  scope: 'ks',
  defaultSeverity: 'major',
  priorityWeight: 9,
  source: 'docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-ks-handbook-single-h1',
};

/** @param {import('playwright').Page} page */
export async function collectHandbookH1Report(page) {
  return page.evaluate(() => {
    const chapter = document.querySelector('[data-ks-name="handbook-chapter"]');
    if (!chapter) return { applicable: false, h1Count: 0 };
    const main = document.querySelector('main#main') || document.querySelector('main') || chapter;
    const h1s = Array.from(main.querySelectorAll('h1')).filter((el) => {
      const r = el.getBoundingClientRect();
      const s = window.getComputedStyle(el);
      return r.width > 1 && r.height > 1 && s.visibility !== 'hidden' && s.display !== 'none';
    });
    return { applicable: true, h1Count: h1s.length };
  });
}

export async function run({ metrics, page, url }) {
  const report =
    metrics?.handbookH1Report ?? (page ? await collectHandbookH1Report(page) : null);
  if (!report?.applicable || report.h1Count === 1) return [];
  if (report.h1Count === 0) {
    return [
      {
        severity: 'major',
        area: 'accessibility',
        message: 'Handbook chapter layout is missing a primary h1 in the content column.',
        evidence: `h1_count=0${url ? ` url=${url}` : ''}`,
        remediation: 'Ensure exactly one visible h1 titles the chapter inside main.',
      },
    ];
  }
  return [
    {
      severity: 'major',
      area: 'accessibility',
      message: 'Handbook chapter layout exposes more than one h1 in the primary content region.',
      evidence: `h1_count=${report.h1Count}${url ? ` url=${url}` : ''}`,
      remediation:
        'Keep one document-level h1 for the chapter; demote duplicate Markdown headings to h2.',
    },
  ];
}
