/**
 * DET.CHROME.BOUNDARY — header/footer/sidebars visually separated from main content
 * (border, distinct background, or box-shadow) per chrome-region contracts.
 */

/** Minimum luminance delta between chrome and main canvas backgrounds. */
export const MIN_CHROME_BG_LUMINANCE_DELTA = 0.06;

const CHROME_ROOT_SELECTOR = [
  'header',
  'footer',
  'aside.forge-sidebar',
  'aside[class*="sidebar"]',
  '.forge-sidebar',
  '.ks-site-footer-region',
  '.site-header',
  '.landing-header',
  '[data-shell-region]',
].join(',');

export const rule = {
  id: 'DET.CHROME.BOUNDARY',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'informationArchitecture',
  scoreDimension: 'visualRhythmFirstScreen',
  defaultSeverity: 'warn',
  priorityWeight: 7,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-chrome-boundary',
};

/**
 * @param {string} value
 * @returns {number[] | null}
 */
export function parseRgb(value) {
  const m = String(value || '').match(/rgba?\(([^)]+)\)/i);
  if (!m) return null;
  const parts = m[1].split(',').map((p) => Number.parseFloat(p.trim()));
  if (parts.length < 3 || parts.some((p, idx) => idx < 3 && !Number.isFinite(p))) return null;
  if (parts.length >= 4 && parts[3] === 0) return null;
  return parts.slice(0, 3);
}

/**
 * @param {number[]} rgb
 */
export function luminance(rgb) {
  const srgb = rgb.map((v) => v / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}

/**
 * @param {number[] | null} a
 * @param {number[] | null} b
 */
export function backgroundLuminanceDelta(a, b) {
  if (!a || !b) return 0;
  return Math.abs(luminance(a) - luminance(b));
}

/**
 * @param {string} width
 * @param {string} color
 */
export function borderEdgeVisible(width, color) {
  const w = Number.parseFloat(String(width || '0'));
  if (!Number.isFinite(w) || w < 0.5) return false;
  return parseRgb(color) !== null;
}

/**
 * @param {Record<string, string>} style
 */
export function boxShadowVisible(style) {
  const shadow = String(style?.boxShadow || 'none');
  if (!shadow || shadow === 'none') return false;
  return !/^0px 0px 0px 0px/.test(shadow);
}

/**
 * @param {Record<string, string>} style
 * @param {number[] | null} mainBgRgb
 * @param {number} minBgDelta
 */
export function chromeBoundaryCuesFromStyles(style, mainBgRgb, minBgDelta = MIN_CHROME_BG_LUMINANCE_DELTA) {
  const cues = [];
  for (const edge of ['Top', 'Right', 'Bottom', 'Left']) {
    if (borderEdgeVisible(style[`border${edge}Width`], style[`border${edge}Color`])) {
      cues.push('border');
      break;
    }
  }
  if (boxShadowVisible(style)) cues.push('shadow');
  const chromeBg = parseRgb(style.backgroundColor);
  if (chromeBg && mainBgRgb && backgroundLuminanceDelta(chromeBg, mainBgRgb) >= minBgDelta) {
    cues.push('background');
  }
  return cues;
}

/**
 * @param {Record<string, string>} style
 * @param {Record<string, string>} pseudoStyle
 */
export function pseudoSeparationCue(pseudoStyle) {
  if (!pseudoStyle) return null;
  const content = String(pseudoStyle.content || 'none');
  if (content === 'none' || content === 'normal' || content === '""') return null;
  for (const edge of ['Top', 'Right', 'Bottom', 'Left']) {
    if (borderEdgeVisible(pseudoStyle[`border${edge}Width`], pseudoStyle[`border${edge}Color`])) {
      return 'pseudo-border';
    }
  }
  if (boxShadowVisible(pseudoStyle)) return 'pseudo-shadow';
  const w = Number.parseFloat(String(pseudoStyle.width || '0'));
  const h = Number.parseFloat(String(pseudoStyle.height || '0'));
  const bg = parseRgb(pseudoStyle.backgroundColor);
  if (bg && (w >= 1 || h >= 1)) return 'pseudo-fill';
  return null;
}

/**
 * @param {{ violations?: Array<Record<string, unknown>> } | null | undefined} report
 * @param {string} [url]
 */
export function findingsFromChromeBoundaryReport(report, url = '') {
  const violations = Array.isArray(report?.violations) ? report.violations : [];
  if (!violations.length) return [];

  const findings = [];
  const seen = new Set();

  for (const v of violations.slice(0, 8)) {
    const hint = String(v.selectorHint || v.role || 'chrome').slice(0, 120);
    if (seen.has(hint)) continue;
    seen.add(hint);

    findings.push({
      severity: 'warn',
      area: 'informationArchitecture',
      message:
        'A chrome region (header, footer, or sidebar) lacks a visible boundary from the main content canvas.',
      evidence: `missing_chrome_boundary role=${v.role || '?'} hint="${hint}" cues=${String(v.cuesFound || 'none')}`,
      remediation:
        'Add a contract-aligned separator: border on the edge facing main (e.g. border-right on .forge-sidebar), a distinct chrome background token, or a subtle box-shadow—per the chrome-region design contract.',
    });
  }

  if (url) {
    for (const finding of findings) {
      finding.evidence = `${finding.evidence} url=${url}`;
    }
  }

  return findings;
}

/** @param {import('playwright').Page} page */
export async function collectChromeBoundaryReport(page, minBgDelta = MIN_CHROME_BG_LUMINANCE_DELTA) {
  return page.evaluate(
    ({ CHROME_ROOT_SELECTOR, minBgDelta }) => {
      const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();

      const parseRgb = (value) => {
        const m = String(value || '').match(/rgba?\(([^)]+)\)/i);
        if (!m) return null;
        const parts = m[1].split(',').map((p) => Number.parseFloat(p.trim()));
        if (parts.length < 3 || parts.some((p, idx) => idx < 3 && !Number.isFinite(p))) return null;
        if (parts.length >= 4 && parts[3] === 0) return null;
        return parts.slice(0, 3);
      };
      const luminance = (rgb) => {
        const srgb = rgb.map((v) => v / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
        return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
      };
      const bgDelta = (a, b) => {
        if (!a || !b) return 0;
        return Math.abs(luminance(a) - luminance(b));
      };
      const borderEdgeVisible = (width, color) => {
        const w = Number.parseFloat(String(width || '0'));
        if (!Number.isFinite(w) || w < 0.5) return false;
        return parseRgb(color) !== null;
      };
      const boxShadowVisible = (style) => {
        const shadow = String(style.boxShadow || 'none');
        if (!shadow || shadow === 'none') return false;
        return !/^0px 0px 0px 0px/.test(shadow);
      };
      const effectiveBg = (el) => {
        let node = el;
        while (node && node.nodeType === 1) {
          const bg = parseRgb(window.getComputedStyle(node).backgroundColor);
          if (bg) return bg;
          node = node.parentElement;
        }
        return parseRgb(window.getComputedStyle(document.body).backgroundColor) || [10, 14, 23];
      };

      const visible = (el) => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        return rect.width > 40 && rect.height > 24 && style.visibility !== 'hidden'
          && style.display !== 'none' && Number(style.opacity || 1) > 0.05;
      };

      const main = document.querySelector('main#main') || document.querySelector('main');
      if (!main || !visible(main)) {
        return { chromeRegionCount: 0, violations: [] };
      }

      const mainRect = main.getBoundingClientRect();
      const mainBg = effectiveBg(main);

      const isOutsideMain = (el) => !main.contains(el);
      const excluded = (el) => {
        if (el.closest(
          '.offcanvas, .modal, .dropdown-menu, .toast, .popover, '
          + '[role="dialog"], [aria-modal="true"], .cookie, [class*="cookie"]',
        )) return true;
        const id = String(el.id || '').toLowerCase();
        if (id.includes('cookie') || id.includes('consent')) return true;
        return false;
      };

      const overlapsMain = (rect) => {
        const pad = 48;
        const vOverlap = rect.bottom > mainRect.top + pad && rect.top < mainRect.bottom - pad;
        if (!vOverlap) return false;
        const hOverlap = rect.right > mainRect.left - 80 && rect.left < mainRect.right + 80;
        return hOverlap;
      };

      const cuesForElement = (el) => {
        const style = window.getComputedStyle(el);
        /** @type {string[]} */
        const cues = [];
        for (const edge of ['Top', 'Right', 'Bottom', 'Left']) {
          if (borderEdgeVisible(style[`border${edge}Width`], style[`border${edge}Color`])) {
            cues.push('border');
            break;
          }
        }
        if (boxShadowVisible(style)) cues.push('shadow');
        const chromeBg = parseRgb(style.backgroundColor) || effectiveBg(el);
        if (chromeBg && bgDelta(chromeBg, mainBg) >= minBgDelta) cues.push('background');
        for (const pseudo of ['::before', '::after']) {
          const ps = window.getComputedStyle(el, pseudo);
          const content = String(ps.content || 'none');
          if (content === 'none' || content === 'normal') continue;
          let pseudoHit = false;
          for (const edge of ['Top', 'Right', 'Bottom', 'Left']) {
            if (borderEdgeVisible(ps[`border${edge}Width`], ps[`border${edge}Color`])) {
              pseudoHit = true;
              break;
            }
          }
          if (!pseudoHit && boxShadowVisible(ps)) pseudoHit = true;
          const pw = Number.parseFloat(String(ps.width || '0'));
          const ph = Number.parseFloat(String(ps.height || '0'));
          if (!pseudoHit && parseRgb(ps.backgroundColor) && (pw >= 1 || ph >= 1)) pseudoHit = true;
          if (pseudoHit) cues.push('pseudo');
        }
        return cues;
      };

      const selectorHintFor = (el, role) => {
        const id = el.id ? `#${el.id}` : '';
        const cls = norm(el.className).split(' ').filter(Boolean).slice(0, 3).join('.');
        const hash = el.getAttribute('data-ks-hash') || el.getAttribute('hash') || '';
        return `${role || el.tagName.toLowerCase()}${id}${cls ? `.${cls}` : ''}${hash ? `[@${hash}]` : ''}`;
      };

      /** @type {HTMLElement[]} */
      const candidates = [];
      const seenEl = new Set();
      for (const el of document.querySelectorAll(CHROME_ROOT_SELECTOR)) {
        if (!(el instanceof HTMLElement) || seenEl.has(el) || !visible(el) || !isOutsideMain(el)) continue;
        if (excluded(el)) continue;
        const rect = el.getBoundingClientRect();
        if (!overlapsMain(rect)) continue;
        seenEl.add(el);
        candidates.push(el);
      }

      const roots = candidates.filter(
        (el) => !candidates.some((other) => other !== el && other.contains(el)),
      );

      /** @type {Array<Record<string, unknown>>} */
      const violations = [];
      for (const el of roots) {
        const role = el.getAttribute('data-shell-region')
          || (el.matches('header, .site-header, .landing-header') ? 'header'
            : el.matches('footer, .ks-site-footer-region') ? 'footer'
              : el.matches('aside, .forge-sidebar, [class*="sidebar"]') ? 'sidebar'
                : el.tagName.toLowerCase());
        const cues = cuesForElement(el);
        if (cues.length) continue;
        violations.push({
          kind: 'missing-boundary',
          role,
          selectorHint: selectorHintFor(el, role),
          cuesFound: 'none',
        });
      }

      return {
        chromeRegionCount: roots.length,
        violations: violations.slice(0, 10),
      };
    },
    { CHROME_ROOT_SELECTOR, minBgDelta },
  );
}

export async function run({ metrics, page, url }) {
  const report = metrics?.chromeBoundaryReport
    ?? (page ? await collectChromeBoundaryReport(page) : null);
  if (!report || !(report.violations || []).length) return [];
  return findingsFromChromeBoundaryReport(report, url || metrics?.url || '');
}
