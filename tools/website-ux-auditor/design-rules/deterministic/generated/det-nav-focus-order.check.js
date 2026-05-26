/**
 * DET.NAV.FOCUS_ORDER — keyboard tab sequence should follow visual reading order
 * on sampled document paths (chrome header, main, footer).
 */

/** Max tab stops sampled per page. */
export const MAX_TAB_STOPS = 48;

/** Vertical jump (px) upward between consecutive tab stops counts as inversion. */
export const REVERSE_VERTICAL_PX = 72;

/** Horizontal jump (px) leftward on the same row counts as inversion (LTR). */
export const REVERSE_HORIZONTAL_PX = 96;

/** Same-row band for horizontal inversion checks. */
export const SAME_ROW_BAND_PX = 40;

/** Fleet handbook: max sidebar/TOC/breadcrumb links removed from tab order when top nav is present. */
export const MAX_HANDBOOK_SUPPRESSED_CHROME_LINKS = 16;

const TABBABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(',');

export const rule = {
  id: 'DET.NAV.FOCUS_ORDER',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'accessibility',
  scoreDimension: 'accessibilitySemanticsMeta',
  defaultSeverity: 'minor',
  priorityWeight: 8,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-nav-focus_order',
};

/**
 * @param {Array<{ tabindex?: number, centerY?: number, centerX?: number, tag?: string, id?: string, className?: string, region?: string }>} sequence
 * @param {{ rtl?: boolean }} [opts]
 */
export function violationsFromFocusOrderSequence(sequence, opts = {}) {
  const rtl = Boolean(opts.rtl);
  /** @type {Array<Record<string, unknown>>} */
  const violations = [];

  if (!Array.isArray(sequence) || !sequence.length) return violations;

  for (const item of sequence) {
    const ti = Number(item.tabindex ?? 0);
    if (ti > 0) {
      violations.push({
        kind: 'positive-tabindex',
        tabindex: ti,
        tag: item.tag,
        id: item.id,
        className: item.className,
        region: item.region,
      });
    }
  }

  const stops = sequence.filter((s) => Number.isFinite(s.centerY) && Number.isFinite(s.centerX));
  for (let i = 0; i < stops.length - 1; i += 1) {
    const cur = stops[i];
    const next = stops[i + 1];
    const dy = Number(next.centerY) - Number(cur.centerY);
    const dx = Number(next.centerX) - Number(cur.centerX);

    if (dy < -REVERSE_VERTICAL_PX) {
      violations.push({
        kind: 'reverse-vertical',
        step: i + 1,
        deltaY: Math.round(dy),
        fromTag: cur.tag,
        toTag: next.tag,
        fromId: cur.id,
        toId: next.id,
        fromRegion: cur.region,
        toRegion: next.region,
      });
    } else if (!rtl && Math.abs(dy) <= SAME_ROW_BAND_PX && dx < -REVERSE_HORIZONTAL_PX) {
      violations.push({
        kind: 'reverse-horizontal',
        step: i + 1,
        deltaX: Math.round(dx),
        fromTag: cur.tag,
        toTag: next.tag,
        fromId: cur.id,
        toId: next.id,
        fromRegion: cur.region,
        toRegion: next.region,
      });
    }
  }

  return violations.slice(0, 12);
}

/**
 * @param {{ violations?: Array<Record<string, unknown>>, tabStopCount?: number, rtl?: boolean } | null | undefined} report
 * @param {string} [url]
 */
export function findingsFromNavFocusOrderReport(report, url = '') {
  const violations = Array.isArray(report?.violations) ? report.violations : [];
  if (!violations.length) return [];

  const findings = [];
  const seen = new Set();

  for (const v of violations.slice(0, 8)) {
    const kind = String(v.kind || 'unknown');
    const key = `${kind}:${v.step ?? ''}:${v.tabindex ?? ''}:${v.fromId ?? ''}:${v.toId ?? ''}:${v.id ?? ''}`;
    if (seen.has(key)) continue;
    seen.add(key);

    if (kind === 'positive-tabindex') {
      findings.push({
        severity: 'minor',
        area: 'accessibility',
        message: 'A focusable control uses a positive tabindex, which disrupts natural keyboard tab order.',
        evidence: `tabindex=${v.tabindex} <${String(v.tag || '?')}> id="${String(v.id || '')}" region=${String(v.region || '?')}`,
        remediation:
          'Remove positive tabindex values; rely on DOM order and CSS layout so Tab follows the visual reading order.',
      });
      continue;
    }

    if (kind === 'reverse-vertical') {
      findings.push({
        severity: 'warn',
        area: 'accessibility',
        message: 'Keyboard tab order jumps upward on the page, diverging from visual top-to-bottom reading order.',
        evidence: `step=${v.step} deltaY=${v.deltaY}px from <${String(v.fromTag || '?')}>#${String(v.fromId || '')} (${String(v.fromRegion || '?')}) to <${String(v.toTag || '?')}>#${String(v.toId || '')} (${String(v.toRegion || '?')})`,
        remediation:
          'Reorder focusable elements in the DOM (or fix layout/float/position) so Tab moves through header → main → complementary regions without large upward jumps.',
      });
      continue;
    }

    if (kind === 'reverse-horizontal') {
      findings.push({
        severity: 'warn',
        area: 'accessibility',
        message: 'Keyboard tab order moves right-to-left within a row, diverging from visual LTR reading order.',
        evidence: `step=${v.step} deltaX=${v.deltaX}px from <${String(v.fromTag || '?')}>#${String(v.fromId || '')} to <${String(v.toTag || '?')}>#${String(v.toId || '')}`,
        remediation:
          'Align DOM order with visual placement in nav/toolbars, or use a single logical row container so Tab follows left-to-right order.',
      });
      continue;
    }

    if (kind === 'handbook-chrome-tab-suppressed') {
      findings.push({
        severity: 'minor',
        area: 'accessibility',
        message:
          'Many handbook chrome links (sidebar, breadcrumb, in-page ToC) use tabindex="-1" while curated top nav is present — keyboard users rely on the header nav only.',
        evidence: `handbook_chrome_tab_suppressed count=${v.suppressedCount ?? '?'} max=${MAX_HANDBOOK_SUPPRESSED_CHROME_LINKS}`,
        remediation:
          'Ensure curated top nav lists every in-page section, or restore natural tab order for complementary nav when top nav does not duplicate those destinations.',
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
export async function collectNavFocusOrderReport(page) {
  return page.evaluate(
    ({
      MAX_TAB_STOPS,
      TABBABLE_SELECTOR,
      REVERSE_VERTICAL_PX,
      REVERSE_HORIZONTAL_PX,
      SAME_ROW_BAND_PX,
      MAX_HANDBOOK_SUPPRESSED_CHROME_LINKS,
    }) => {
      const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();
      const rtl = (document.documentElement.getAttribute('dir') || '').toLowerCase() === 'rtl';

      const visible = (el) => {
        if (!el || el.nodeType !== 1) return false;
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        return rect.width > 1 && rect.height > 1 && style.visibility !== 'hidden'
          && style.display !== 'none' && Number(style.opacity || 1) > 0.05;
      };

      /** @param {Element} el */
      function regionOf(el) {
        if (el.closest('header, [role="banner"]')) return 'header';
        if (el.closest('nav, [role="navigation"]')) return 'nav';
        if (el.closest('main, [role="main"]')) return 'main';
        if (el.closest('aside, [role="complementary"]')) return 'aside';
        if (el.closest('footer, [role="contentinfo"]')) return 'footer';
        return 'document';
      }

      /** @param {Element} el */
      function isTabbable(el) {
        if (!(el instanceof HTMLElement)) return false;
        if (!visible(el)) return false;
        if (el.getAttribute('aria-hidden') === 'true') return false;
        if (el.hasAttribute('disabled')) return false;
        const ti = el.tabIndex;
        if (ti < 0) return false;
        const tag = el.tagName.toLowerCase();
        if (tag === 'a' && !el.hasAttribute('href')) return false;
        if (['input', 'select', 'textarea', 'button'].includes(tag)) return true;
        if (el.isContentEditable) return true;
        if (ti >= 0) return true;
        return false;
      }

      const candidates = [...document.querySelectorAll(TABBABLE_SELECTOR)].filter(isTabbable);

      /** @type {Array<{ el: HTMLElement, tabindex: number, pos: number }>} */
      const ranked = candidates.map((el, pos) => ({
        el,
        tabindex: el.tabIndex,
        pos,
      }));

      const positive = ranked.filter((r) => r.tabindex > 0)
        .sort((a, b) => a.tabindex - b.tabindex || a.pos - b.pos);
      const rest = ranked.filter((r) => r.tabindex <= 0).sort((a, b) => a.pos - b.pos);
      const ordered = [...positive, ...rest].slice(0, MAX_TAB_STOPS);

      /** @type {Array<Record<string, unknown>>} */
      const sequence = ordered.map(({ el, tabindex }) => {
        const rect = el.getBoundingClientRect();
        return {
          tabindex,
          centerX: Math.round(rect.left + rect.width / 2),
          centerY: Math.round(rect.top + rect.height / 2),
          tag: el.tagName.toLowerCase(),
          id: el.id || '',
          className: norm(el.className).slice(0, 80),
          region: regionOf(el),
        };
      });

      /** @type {Array<Record<string, unknown>>} */
      const violations = [];

      for (const item of sequence) {
        const ti = Number(item.tabindex || 0);
        if (ti > 0) {
          violations.push({
            kind: 'positive-tabindex',
            tabindex: ti,
            tag: item.tag,
            id: item.id,
            className: item.className,
            region: item.region,
          });
        }
      }

      for (let i = 0; i < sequence.length - 1; i += 1) {
        const cur = sequence[i];
        const next = sequence[i + 1];
        const dy = Number(next.centerY) - Number(cur.centerY);
        const dx = Number(next.centerX) - Number(cur.centerX);

        if (dy < -REVERSE_VERTICAL_PX) {
          violations.push({
            kind: 'reverse-vertical',
            step: i + 1,
            deltaY: Math.round(dy),
            fromTag: cur.tag,
            toTag: next.tag,
            fromId: cur.id,
            toId: next.id,
            fromRegion: cur.region,
            toRegion: next.region,
          });
        } else if (!rtl && Math.abs(dy) <= SAME_ROW_BAND_PX && dx < -REVERSE_HORIZONTAL_PX) {
          violations.push({
            kind: 'reverse-horizontal',
            step: i + 1,
            deltaX: Math.round(dx),
            fromTag: cur.tag,
            toTag: next.tag,
            fromId: cur.id,
            toId: next.id,
            fromRegion: cur.region,
            toRegion: next.region,
          });
        }
      }

      const hasTopnav = Boolean(document.querySelector('.fleet-handbook-topnav'));
      let suppressedChromeTabCount = 0;
      if (hasTopnav) {
        for (const anchor of document.querySelectorAll(
          'aside.forge-sidebar a[tabindex="-1"], .ks-doc-toc-rail a[tabindex="-1"], .fleet-handbook-breadcrumb a[tabindex="-1"]',
        )) {
          if (visible(anchor)) suppressedChromeTabCount += 1;
        }
        if (suppressedChromeTabCount > MAX_HANDBOOK_SUPPRESSED_CHROME_LINKS) {
          violations.push({
            kind: 'handbook-chrome-tab-suppressed',
            suppressedCount: suppressedChromeTabCount,
          });
        }
      }

      return {
        tabStopCount: sequence.length,
        rtl,
        violations: violations.slice(0, 12),
        handbookFocus: { hasTopnav, suppressedChromeTabCount },
      };
    },
    {
      MAX_TAB_STOPS,
      TABBABLE_SELECTOR,
      REVERSE_VERTICAL_PX,
      REVERSE_HORIZONTAL_PX,
      SAME_ROW_BAND_PX,
      MAX_HANDBOOK_SUPPRESSED_CHROME_LINKS,
    },
  );
}

export async function run({ metrics, page, url }) {
  const report = metrics?.navFocusOrderReport
    ?? (page ? await collectNavFocusOrderReport(page) : null);
  if (!report || !(report.violations || []).length) return [];
  return findingsFromNavFocusOrderReport(report, url || metrics?.url || '');
}
