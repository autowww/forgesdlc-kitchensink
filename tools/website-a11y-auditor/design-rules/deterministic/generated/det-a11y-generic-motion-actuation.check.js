import { requirePage, withUrl } from '../../../lib/det-check-helpers.mjs';

export const rule = {
  id: 'DET.A11Y.GENERIC.MOTION_ACTUATION',
  lane: 'deterministic',
  area: 'accessibility',
  defaultSeverity: 'warn',
  priorityWeight: 7,
  source: 'docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-motion-actuation',
};

/**
 * @param {{ page?: import('playwright').Page, url?: string }} ctx
 */
export async function run(ctx) {
  const page = requirePage(ctx);
  if (!page) return [];

  const report = await page.evaluate(() => {
    const body = document.body?.innerHTML || '';
    const hits = [];
    if (/devicemotion|deviceorientation|Accelerometer|Gyroscope/i.test(body.slice(0, 80000))) {
      hits.push({ kind: 'motion-api' });
    }
    return { hits };
  });

  return withUrl(
    (report.hits || []).map(() => ({
      severity: 'warn',
      area: 'accessibility',
      message: 'Page may use device motion/orientation — verify WCAG 2.5.4 and off switch.',
      evidence: 'motion/orientation API reference in scripts',
      remediation: 'Provide UI alternative; disable motion actuation unless essential.',
    })),
    ctx.url,
  );
}
