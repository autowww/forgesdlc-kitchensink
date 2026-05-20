/**
 * DET.MOTION.NO_AUTO_PLAY_FLASH — no seizure-risk flash patterns above WCAG-style
 * frequency thresholds when measurable via CSS/DOM (pixel sampling is optional fallback).
 */

/** WCAG 2.3.1 general flash threshold: more than 3 flashes per one-second period. */
export const MAX_SAFE_FLASHES_PER_SECOND = 3;

/** Minimum animation cycle length (s) for a simple 0↔1 opacity toggle to stay at or below 3 Hz. */
export const MIN_SAFE_TOGGLE_CYCLE_SEC = 2 / MAX_SAFE_FLASHES_PER_SECOND;

/** Treat infinite loops faster than this as high-frequency flash risk. */
export const FAST_INFINITE_DURATION_SEC = 1 / MAX_SAFE_FLASHES_PER_SECOND;

const RISKY_ANIMATION_NAME_RX = /\b(blink|flash|strobe|seizure|flicker)\b/i;

export const rule = {
  id: 'DET.MOTION.NO_AUTO_PLAY_FLASH',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'accessibility',
  scoreDimension: 'accessibilitySemanticsMeta',
  defaultSeverity: 'major',
  priorityWeight: 9,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-motion-no_auto_play_flash',
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
 * @param {string} iterationCount
 */
export function isInfiniteIteration(iterationCount) {
  const v = String(iterationCount || '').trim().toLowerCase();
  return v === 'infinite' || v === 'infinity';
}

/**
 * @param {number} durationSec
 * @param {string} iterationCount
 */
export function estimatedFlashesPerSecond(durationSec, iterationCount) {
  if (durationSec <= 0) return Infinity;
  if (isInfiniteIteration(iterationCount)) return 2 / durationSec;
  const n = Number.parseFloat(iterationCount);
  if (Number.isFinite(n) && n > 0 && durationSec * n <= 1) return (2 * n) / durationSec;
  return 2 / durationSec;
}

/**
 * @param {string} name
 */
export function isRiskyAnimationName(name) {
  return RISKY_ANIMATION_NAME_RX.test(String(name || ''));
}

/**
 * @param {{ violations?: Array<Record<string, unknown>> } | null | undefined} report
 * @param {string} [url]
 */
export function findingsFromMotionNoAutoPlayFlashReport(report, url = '') {
  const violations = Array.isArray(report?.violations) ? report.violations : [];
  if (!violations.length) return [];

  const findings = [];
  const seen = new Set();

  for (const v of violations.slice(0, 8)) {
    const kind = String(v.kind || 'unknown');
    const key = `${kind}:${v.animationName || v.selectorHint || v.name || ''}:${v.durationSec ?? ''}`;
    if (seen.has(key)) continue;
    seen.add(key);

    if (kind === 'fast-infinite-animation') {
      findings.push({
        severity: 'major',
        area: 'accessibility',
        message:
          'A visible infinite animation runs faster than the WCAG general flash threshold (more than three flashes per second for a simple on/off cycle).',
        evidence: [
          `kind=${kind}`,
          `animation="${String(v.animationName || 'unknown').slice(0, 80)}"`,
          `duration=${v.durationSec}s`,
          `estimatedHz=${Number(v.estimatedFlashesPerSecond || 0).toFixed(1)}`,
          `hint="${String(v.selectorHint || '').slice(0, 100)}"`,
        ].join(' '),
        remediation:
          'Slow the animation to ≥0.67s per cycle, remove infinite looping, or disable motion under prefers-reduced-motion. Avoid full-viewport strobing backgrounds.',
      });
      continue;
    }

    if (kind === 'risky-animation-name' || kind === 'risky-keyframes-name') {
      findings.push({
        severity: 'major',
        area: 'accessibility',
        message: 'Animation name or @keyframes rule suggests a blink/flash/strobe pattern that may exceed safe flash frequency.',
        evidence: [
          `kind=${kind}`,
          `name="${String(v.animationName || v.name || '').slice(0, 80)}"`,
          v.selectorHint ? `hint="${String(v.selectorHint).slice(0, 100)}"` : '',
        ].filter(Boolean).join(' '),
        remediation:
          'Rename or replace blink/flash/strobe keyframes with slow, non-strobing motion; respect prefers-reduced-motion and provide a static fallback.',
      });
      continue;
    }

    if (kind === 'autoplay-video') {
      findings.push({
        severity: 'warn',
        area: 'accessibility',
        message: 'Autoplaying video is visible without a user gesture and may include rapid luminance changes.',
        evidence: `kind=${kind} selector="${String(v.selectorHint || 'video').slice(0, 100)}" muted=${v.muted === true}`,
        remediation:
          'Remove autoplay, require muted autoplay only when essential, add visible controls, and pause decorative video under prefers-reduced-motion.',
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
export async function collectMotionNoAutoPlayFlashReport(page) {
  return page.evaluate(
    ({ maxHz, minToggleCycleSec, riskyRxSource }) => {
      const riskyRx = new RegExp(riskyRxSource, 'i');
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

      const isInfiniteIteration = (iterationCount) => {
        const v = String(iterationCount || '').trim().toLowerCase();
        return v === 'infinite' || v === 'infinity';
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

      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      /** @type {Array<Record<string, unknown>>} */
      const violations = [];

      for (const el of document.querySelectorAll('body *')) {
        if (!(el instanceof HTMLElement) || !visible(el)) continue;
        const style = window.getComputedStyle(el);
        const animName = norm(style.animationName);
        if (!animName || animName === 'none') continue;

        const durationSec = parseCssTimeSeconds(style.animationDuration);
        const iteration = style.animationIterationCount;
        const names = animName.split(',').map((n) => n.trim()).filter(Boolean);

        for (const name of names) {
          if (riskyRx.test(name)) {
            violations.push({
              kind: 'risky-animation-name',
              animationName: name,
              selectorHint: selectorHintFor(el),
            });
          }
        }

        if (reducedMotion && parseCssTimeSeconds(style.animationDuration) <= 0.02) continue;

        if (isInfiniteIteration(iteration) && durationSec > 0 && durationSec < minToggleCycleSec) {
          const hz = 2 / durationSec;
          if (hz > maxHz) {
            violations.push({
              kind: 'fast-infinite-animation',
              animationName: animName,
              durationSec: Number(durationSec.toFixed(3)),
              estimatedFlashesPerSecond: Number(hz.toFixed(2)),
              selectorHint: selectorHintFor(el),
            });
          }
        }
      }

      for (const sheet of document.styleSheets) {
        let rules;
        try {
          rules = sheet.cssRules;
        } catch {
          continue;
        }
        if (!rules) continue;
        for (const rule of rules) {
          if (rule.type !== CSSRule.KEYFRAMES_RULE) continue;
          const name = rule.name || '';
          if (!riskyRx.test(name)) continue;
          violations.push({ kind: 'risky-keyframes-name', name });
        }
      }

      for (const video of document.querySelectorAll('video[autoplay]')) {
        if (!(video instanceof HTMLVideoElement) || !visible(video)) continue;
        violations.push({
          kind: 'autoplay-video',
          selectorHint: selectorHintFor(video),
          muted: video.muted || video.hasAttribute('muted'),
        });
      }

      return {
        reducedMotionPreferred: reducedMotion,
        violations: violations.slice(0, 12),
      };
    },
    {
      maxHz: MAX_SAFE_FLASHES_PER_SECOND,
      minToggleCycleSec: MIN_SAFE_TOGGLE_CYCLE_SEC,
      riskyRxSource: RISKY_ANIMATION_NAME_RX.source,
    },
  );
}

export async function run({ metrics, page, url }) {
  const report = metrics?.motionNoAutoPlayFlashReport
    ?? (page ? await collectMotionNoAutoPlayFlashReport(page) : null);
  if (!report || !(report.violations || []).length) return [];
  return findingsFromMotionNoAutoPlayFlashReport(report, url || metrics?.url || '');
}
