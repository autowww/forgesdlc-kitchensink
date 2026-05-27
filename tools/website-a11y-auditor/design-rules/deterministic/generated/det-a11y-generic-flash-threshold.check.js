import {
  collectMotionNoAutoPlayFlashReport,
  findingsFromMotionNoAutoPlayFlashReport,
  MAX_SAFE_FLASHES_PER_SECOND,
} from '../../../../website-ux-auditor/design-rules/deterministic/generated/det-motion-no-auto-play-flash.check.js';
import { requirePage, withUrl } from '../../../lib/det-check-helpers.mjs';

export const rule = {
  id: 'DET.A11Y.GENERIC.FLASH_THRESHOLD',
  lane: 'deterministic',
  area: 'accessibility',
  defaultSeverity: 'major',
  priorityWeight: 9,
  source: 'docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-flash-threshold',
};

/**
 * WCAG 2.3.2 (AAA) — emphasize high-frequency / flash-like motion (stricter than 2.3.1).
 * @param {{ page?: import('playwright').Page, metrics?: object, url?: string }} ctx
 */
export async function run(ctx) {
  const page = requirePage(ctx);
  const report =
    ctx.metrics?.motionNoAutoPlayFlashReport ??
    (page ? await collectMotionNoAutoPlayFlashReport(page) : null);
  if (!report?.violations?.length) return [];

  const flashLike = (report.violations || []).filter((v) => {
    const kind = String(v.kind || '');
    if (kind === 'fast-infinite-animation' || kind === 'risky-keyframes-name') return true;
    if (kind === 'risky-animation-name') return true;
    const hz = Number(v.estimatedFlashesPerSecond);
    return Number.isFinite(hz) && hz > MAX_SAFE_FLASHES_PER_SECOND;
  });

  if (!flashLike.length) return [];

  const findings = findingsFromMotionNoAutoPlayFlashReport(
    { ...report, violations: flashLike },
    ctx.url,
  ).map((f) => ({
    ...f,
    severity: 'major',
    message: `${f.message} (WCAG 2.3.2 three-flashes — heuristic; manual verify flash rate.)`,
  }));

  return withUrl(findings, ctx.url);
}
