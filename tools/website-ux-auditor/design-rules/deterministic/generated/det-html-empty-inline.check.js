/**
 * DET.HTML.EMPTY_INLINE — empty inline emphasis elements in main (e.g. autodoc table focus rows).
 */

export const rule = {
  id: 'DET.HTML.EMPTY_INLINE',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'accessibility',
  scoreDimension: 'accessibilitySemanticsMeta',
  defaultSeverity: 'minor',
  priorityWeight: 6,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-html-empty-inline',
};

/**
 * @param {{ emptyStrongCount?: number, emptyEmCount?: number }} report
 * @param {string} [url]
 */
export function findingsFromEmptyInlineReport(report, url = '') {
  const findings = [];
  const strongN = Number(report?.emptyStrongCount || 0);
  const emN = Number(report?.emptyEmCount || 0);
  if (strongN > 0) {
    findings.push({
      severity: 'minor',
      area: 'accessibility',
      message: `Main content contains ${strongN} empty <strong> element(s) (no visible text).`,
      evidence: `empty_strong_count=${strongN}`,
      remediation:
        'Fix autodoc/table transforms so emphasis wrappers include text or remove empty tags.',
    });
  }
  if (emN > 0) {
    findings.push({
      severity: 'trivial',
      area: 'accessibility',
      message: `Main content contains ${emN} empty <em> element(s).`,
      evidence: `empty_em_count=${emN}`,
      remediation: 'Remove empty emphasis tags or populate them in the generator.',
    });
  }
  if (url) {
    for (const f of findings) f.evidence += ` url=${url}`;
  }
  return findings;
}

/** @param {import('playwright').Page} page */
export async function collectEmptyInlineReport(page) {
  return page.evaluate(() => {
    const main = document.querySelector('main#main') || document.querySelector('main');
    if (!main) return { emptyStrongCount: 0, emptyEmCount: 0 };

    const isEmptyInline = (el) => {
      const text = String(el.textContent || '').replace(/\s+/g, '').trim();
      return text.length === 0;
    };

    let emptyStrongCount = 0;
    let emptyEmCount = 0;
    for (const el of main.querySelectorAll('strong')) {
      if (isEmptyInline(el)) emptyStrongCount += 1;
    }
    for (const el of main.querySelectorAll('em')) {
      if (isEmptyInline(el)) emptyEmCount += 1;
    }
    return { emptyStrongCount, emptyEmCount };
  });
}

export async function run({ metrics, page, url }) {
  const report = metrics?.emptyInlineReport
    ?? (page ? await collectEmptyInlineReport(page) : null);
  return findingsFromEmptyInlineReport(report, url || metrics?.url || '');
}
