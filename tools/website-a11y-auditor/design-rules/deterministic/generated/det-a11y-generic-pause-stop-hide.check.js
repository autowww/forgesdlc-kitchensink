import {
  collectMotionNoAutoPlayFlashReport,
  findingsFromMotionNoAutoPlayFlashReport,
} from '../../../../website-ux-auditor/design-rules/deterministic/generated/det-motion-no-auto-play-flash.check.js';
import { requirePage, withUrl } from '../../../lib/det-check-helpers.mjs';

export const rule = {
  id: 'DET.A11Y.GENERIC.PAUSE_STOP_HIDE',
  lane: 'deterministic',
  area: 'accessibility',
  defaultSeverity: 'warn',
  priorityWeight: 8,
  source: 'docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-pause-stop-hide',
};

/**
 * @param {{ page?: import('playwright').Page, metrics?: object, url?: string }} ctx
 */
export async function run(ctx) {
  const page = requirePage(ctx);
  const findings = [];

  if (page) {
    const motionReport = await collectMotionNoAutoPlayFlashReport(page);
    findings.push(
      ...findingsFromMotionNoAutoPlayFlashReport(motionReport, ctx.url).map((f) => ({
        ...f,
        severity: 'warn',
        message: `${f.message} (also review pause/stop for WCAG 2.2.2.)`,
      })),
    );

    const extra = await page.evaluate(() => {
      /** @type {Array<Record<string, unknown>>} */
      const hits = [];
      for (const el of document.querySelectorAll(
        '[aria-live="polite"],[aria-live="assertive"],marquee,.carousel,.slider,[data-bs-ride="carousel"]',
      )) {
        if (!(el instanceof HTMLElement)) continue;
        const hasPause = el.querySelector(
          'button,[role="button"],[aria-label*="pause" i],[aria-label*="stop" i]',
        );
        if (!hasPause) {
          hits.push({ tag: el.tagName.toLowerCase(), live: el.getAttribute('aria-live') || '' });
        }
        if (hits.length >= 4) break;
      }
      return { hits };
    });

    for (const h of extra.hits || []) {
      findings.push({
        severity: 'warn',
        area: 'accessibility',
        message:
          'Moving or auto-updating content may lack an obvious pause/stop control (WCAG 2.2.2).',
        evidence: `<${h.tag}> aria-live="${h.live}"`,
        remediation: 'Provide a pause, stop, or hide mechanism for carousels and live regions.',
      });
    }
  }

  return withUrl(findings.slice(0, 10), ctx.url);
}
