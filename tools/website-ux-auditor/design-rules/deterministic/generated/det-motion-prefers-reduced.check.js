/**
 * DET.MOTION.PREFERS_REDUCED — @media (prefers-reduced-motion: reduce) must disable
 * non-essential CSS/transition motion on visible surfaces.
 */

/** Durations at or below this are treated as effectively disabled. */
export const NEAR_ZERO_MOTION_SEC = 0.02;

const ESSENTIAL_CLASS_RX = /\b(spinner|loading|skeleton|progress-ring|aria-busy)\b/i;
const ESSENTIAL_ANIM_RX = /\b(spinner|loading|progress|skeleton)\b/i;

export const rule = {
  id: 'DET.MOTION.PREFERS_REDUCED',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'accessibility',
  scoreDimension: 'accessibilitySemanticsMeta',
  defaultSeverity: 'major',
  priorityWeight: 8,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-motion-prefers_reduced',
};

/**
 * @param {string} raw
 * @returns {number}
 */
export function parseCssTimeSeconds(raw) {
  const s = String(raw || '').trim().toLowerCase();
  if (!s || s === '0' || s === '0s' || s === '0ms') return 0;
  if (s.endsWith('ms')) {
    const n = Number.parseFloat(s);
    return Number.isFinite(n) ? n / 1000 : 0;
  }
  if (s.endsWith('s')) {
    const n = Number.parseFloat(s);
    return Number.isFinite(n) ? n : 0;
  }
  const n = Number.parseFloat(s);
  return Number.isFinite(n) ? n : 0;
}

/**
 * @param {string | undefined} raw
 */
export function isNearZeroMotionDuration(raw) {
  return parseCssTimeSeconds(raw) <= NEAR_ZERO_MOTION_SEC;
}

/**
 * @param {string} className
 * @param {string} animationName
 * @param {string} role
 * @param {string | null} ariaBusy
 */
export function isEssentialMotion(className, animationName, role = '', ariaBusy = null) {
  if (ariaBusy === 'true') return true;
  if (role === 'progressbar' || role === 'status') return true;
  if (ESSENTIAL_CLASS_RX.test(String(className || ''))) return true;
  if (ESSENTIAL_ANIM_RX.test(String(animationName || ''))) return true;
  return false;
}

/**
 * @param {{ violations?: Array<Record<string, unknown>>, reducedMotionCssRuleCount?: number, nonEssentialMotionCount?: number } | null | undefined} report
 * @param {string} [url]
 */
export function findingsFromMotionPrefersReducedReport(report, url = '') {
  const violations = Array.isArray(report?.violations) ? report.violations : [];
  const findings = [];
  const seen = new Set();

  for (const v of violations.slice(0, 8)) {
    const kind = String(v.kind || 'unknown');
    const key = `${kind}:${v.animationName || v.selectorHint || v.name || ''}:${v.durationSec ?? v.transitionSec ?? ''}`;
    if (seen.has(key)) continue;
    seen.add(key);

    if (kind === 'active-animation') {
      findings.push({
        severity: 'major',
        area: 'accessibility',
        message:
          'Non-essential CSS animation remains active when prefers-reduced-motion: reduce is enabled.',
        evidence: [
          `kind=${kind}`,
          `animation="${String(v.animationName || 'unknown').slice(0, 80)}"`,
          `duration=${v.durationSec}s`,
          `hint="${String(v.selectorHint || '').slice(0, 100)}"`,
        ].join(' '),
        remediation:
          'Disable or shorten decorative animations under @media (prefers-reduced-motion: reduce); keep only essential progress/loading indicators.',
      });
      continue;
    }

    if (kind === 'active-transition') {
      findings.push({
        severity: 'warn',
        area: 'accessibility',
        message: 'CSS transition remains active when prefers-reduced-motion: reduce is enabled.',
        evidence: [
          `kind=${kind}`,
          `transition=${String(v.transitionProperty || 'all').slice(0, 60)}`,
          `duration=${v.transitionSec}s`,
          `hint="${String(v.selectorHint || '').slice(0, 100)}"`,
        ].join(' '),
        remediation:
          'Set transition:none or near-zero duration for decorative transitions inside a prefers-reduced-motion media query.',
      });
      continue;
    }

    if (kind === 'autoplay-video') {
      findings.push({
        severity: 'warn',
        area: 'accessibility',
        message: 'Autoplaying video remains visible when prefers-reduced-motion: reduce is enabled.',
        evidence: `kind=${kind} selector="${String(v.selectorHint || 'video').slice(0, 100)}"`,
        remediation:
          'Pause decorative autoplay video when prefers-reduced-motion is set, or replace with a static poster frame.',
      });
      continue;
    }

    if (kind === 'smil-animation') {
      findings.push({
        severity: 'major',
        area: 'accessibility',
        message: 'SVG SMIL animation is present and may ignore prefers-reduced-motion CSS overrides.',
        evidence: `kind=${kind} tag="${String(v.tagName || 'animate').slice(0, 40)}" parent="${String(v.selectorHint || '').slice(0, 80)}"`,
        remediation:
          'Pause or remove SMIL animation under reduced motion (inline script guard or static SVG fallback).',
      });
    }
  }

  if (url) {
    for (const finding of findings) {
      finding.evidence = `${finding.evidence} url=${url}`;
    }
  }

  return findings;
}

/** @param {import('playwright').Page} page */
export async function collectMotionPrefersReducedReport(page) {
  const priorReduced = await page.evaluate(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  await page.emulateMedia({ reducedMotion: 'reduce' });

  try {
    return page.evaluate(
      ({ nearZeroSec, essentialClassRx, essentialAnimRx }) => {
        const classRx = new RegExp(essentialClassRx, 'i');
        const animRx = new RegExp(essentialAnimRx, 'i');
        const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();

        const parseCssTimeSeconds = (raw) => {
          const s = String(raw || '').trim().toLowerCase();
          if (!s || s === '0' || s === '0s' || s === '0ms') return 0;
          if (s.endsWith('ms')) {
            const n = Number.parseFloat(s);
            return Number.isFinite(n) ? n / 1000 : 0;
          }
          if (s.endsWith('s')) {
            const n = Number.parseFloat(s);
            return Number.isFinite(n) ? n : 0;
          }
          const n = Number.parseFloat(s);
          return Number.isFinite(n) ? n : 0;
        };

        const isEssential = (el, animationName) => {
          if (!(el instanceof HTMLElement)) return false;
          if (el.getAttribute('aria-busy') === 'true') return true;
          const role = el.getAttribute('role') || '';
          if (role === 'progressbar' || role === 'status') return true;
          const cls = norm(el.className);
          if (classRx.test(cls)) return true;
          if (animRx.test(String(animationName || ''))) return true;
          return false;
        };

        const visible = (el) => {
          const rect = el.getBoundingClientRect();
          const style = window.getComputedStyle(el);
          if (rect.width < 2 || rect.height < 2) return false;
          if (style.visibility === 'hidden' || style.display === 'none') return false;
          if (Number(style.opacity || 1) < 0.05) return false;
          const vw = window.innerWidth || 0;
          const vh = window.innerHeight || 0;
          if (rect.bottom < 0 || rect.right < 0 || rect.top > vh || rect.left > vw) return false;
          return true;
        };

        const selectorHintFor = (el) => {
          const id = el.id ? `#${el.id}` : '';
          const cls = norm(el.className).split(' ').filter(Boolean).slice(0, 3).join('.');
          const hash = el.getAttribute('data-ks-hash') || el.getAttribute('hash') || '';
          return `${el.tagName.toLowerCase()}${id}${cls ? `.${cls}` : ''}${hash ? `[@${hash}]` : ''}`;
        };

        let reducedMotionCssRuleCount = 0;
        for (const sheet of document.styleSheets) {
          let rules;
          try {
            rules = sheet.cssRules;
          } catch {
            continue;
          }
          if (!rules) continue;
          for (const rule of rules) {
            if (rule.type !== CSSRule.MEDIA_RULE) continue;
            const condition = rule.conditionText || rule.media?.mediaText || '';
            if (/prefers-reduced-motion\s*:\s*reduce/i.test(condition)) {
              reducedMotionCssRuleCount += 1;
            }
          }
        }

        /** @type {Array<Record<string, unknown>>} */
        const violations = [];
        let nonEssentialMotionCount = 0;

        for (const el of document.querySelectorAll('body *')) {
          if (!(el instanceof HTMLElement) || !visible(el)) continue;
          const style = window.getComputedStyle(el);
          const animName = norm(style.animationName);
          const animDuration = parseCssTimeSeconds(style.animationDuration);
          const transitionDuration = parseCssTimeSeconds(style.transitionDuration);
          const essential = isEssential(el, animName);

          if (animName && animName !== 'none' && animDuration > nearZeroSec && !essential) {
            nonEssentialMotionCount += 1;
            violations.push({
              kind: 'active-animation',
              animationName: animName,
              durationSec: Number(animDuration.toFixed(3)),
              selectorHint: selectorHintFor(el),
            });
          }

          if (
            transitionDuration > nearZeroSec
            && style.transitionProperty !== 'none'
            && !essential
          ) {
            nonEssentialMotionCount += 1;
            violations.push({
              kind: 'active-transition',
              transitionProperty: style.transitionProperty,
              transitionSec: Number(transitionDuration.toFixed(3)),
              selectorHint: selectorHintFor(el),
            });
          }
        }

        for (const el of document.querySelectorAll('svg animate, svg animateTransform, svg set')) {
          if (!(el instanceof SVGElement)) continue;
          const svg = el.closest('svg');
          if (!svg || !visible(svg)) continue;
          nonEssentialMotionCount += 1;
          violations.push({
            kind: 'smil-animation',
            tagName: el.tagName.toLowerCase(),
            selectorHint: selectorHintFor(svg),
          });
        }

        for (const video of document.querySelectorAll('video[autoplay]')) {
          if (!(video instanceof HTMLVideoElement) || !visible(video)) continue;
          nonEssentialMotionCount += 1;
          violations.push({
            kind: 'autoplay-video',
            selectorHint: selectorHintFor(video),
          });
        }

        return {
          reducedMotionPreferred: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
          reducedMotionCssRuleCount,
          nonEssentialMotionCount,
          violations: violations.slice(0, 12),
        };
      },
      {
        nearZeroSec: NEAR_ZERO_MOTION_SEC,
        essentialClassRx: ESSENTIAL_CLASS_RX.source,
        essentialAnimRx: ESSENTIAL_ANIM_RX.source,
      },
    );
  } finally {
    await page.emulateMedia({ reducedMotion: priorReduced ? 'reduce' : 'no-preference' });
  }
}

export async function run({ metrics, page, url }) {
  const report = metrics?.motionPrefersReducedReport
    ?? (page ? await collectMotionPrefersReducedReport(page) : null);
  if (!report || !(report.violations || []).length) return [];
  return findingsFromMotionPrefersReducedReport(report, url || metrics?.url || '');
}
