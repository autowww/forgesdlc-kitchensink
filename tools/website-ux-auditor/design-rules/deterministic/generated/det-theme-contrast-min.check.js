/**
 * DET.THEME.CONTRAST_MIN — body UI text/background pairs meet WCAG AA contrast minimums.
 */

/** WCAG AA minimum contrast for normal body text (< 24px). */
export const WCAG_AA_NORMAL_MIN = 4.5;

/** WCAG AA minimum contrast for large text (>= 24px). */
export const WCAG_AA_LARGE_MIN = 3;

/** Font size (px) at or above which large-text thresholds apply. */
export const LARGE_TEXT_FONT_SIZE_PX = 24;

/** Maximum low-contrast samples reported per audit pass. */
export const MAX_CONTRAST_FINDINGS = 12;

/** Selectors for body UI text sampled during crawl metrics. */
export const BODY_UI_SELECTOR = 'p, a, button, h1, h2, h3, li';

export const rule = {
  id: 'DET.THEME.CONTRAST_MIN',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'accessibility',
  scoreDimension: 'accessibilitySemanticsMeta',
  defaultSeverity: 'major',
  priorityWeight: 8,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-theme-contrast_min',
};

/**
 * @param {number} fontSizePx
 */
export function requiredContrastRatio(fontSizePx) {
  const size = Number(fontSizePx);
  if (!Number.isFinite(size)) return WCAG_AA_NORMAL_MIN;
  return size >= LARGE_TEXT_FONT_SIZE_PX ? WCAG_AA_LARGE_MIN : WCAG_AA_NORMAL_MIN;
}

/**
 * @param {{ ratio?: number | null, size?: number }} sample
 */
export function isLowContrastSample(sample) {
  const ratio = Number(sample?.ratio);
  if (!Number.isFinite(ratio)) return false;
  return ratio < requiredContrastRatio(sample?.size);
}

/**
 * @param {unknown} metrics
 */
export function lowContrastSamplesFromMetrics(metrics) {
  const report = metrics?.contrastReport;
  if (Array.isArray(report?.lowContrast) && report.lowContrast.length) {
    return report.lowContrast.slice(0, MAX_CONTRAST_FINDINGS);
  }
  if (Array.isArray(metrics?.lowContrast) && metrics.lowContrast.length) {
    return metrics.lowContrast.slice(0, MAX_CONTRAST_FINDINGS);
  }
  return [];
}

/**
 * @param {Array<Record<string, unknown>> | null | undefined} samples
 * @param {string} [url]
 */
export function findingsFromContrastSamples(samples, url = '') {
  const rows = Array.isArray(samples) ? samples.filter(isLowContrastSample) : [];
  if (!rows.length) return [];

  const findings = [];
  const seen = new Set();

  for (const sample of rows.slice(0, MAX_CONTRAST_FINDINGS)) {
    const tag = String(sample.tag || 'text').slice(0, 24);
    const ratio = Number(sample.ratio);
    const size = Number(sample.size);
    const threshold = requiredContrastRatio(size);
    const text = String(sample.text || '').slice(0, 80);
    const key = `${tag}:${ratio}:${text}`;
    if (seen.has(key)) continue;
    seen.add(key);

    findings.push({
      severity: 'major',
      area: 'accessibility',
      message:
        `Body UI text has insufficient contrast (${ratio}:1) against its background; WCAG AA requires at least ${threshold}:1 for this font size.`,
      evidence: [
        'low_contrast',
        `tag=${tag}`,
        `ratio=${ratio}`,
        `size=${Number.isFinite(size) ? `${size}px` : 'unknown'}`,
        `threshold=${threshold}`,
        text ? `text="${text}"` : null,
      ].filter(Boolean).join(' '),
      remediation:
        'Adjust foreground or background colors using theme tokens so body text, links, and CTAs meet WCAG AA contrast (4.5:1 normal, 3:1 large text).',
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
export async function collectContrastReport(page, maxSamples = 160) {
  return page.evaluate(
    ({ maxSamples, BODY_UI_SELECTOR, WCAG_AA_NORMAL_MIN, WCAG_AA_LARGE_MIN, LARGE_TEXT_FONT_SIZE_PX, MAX_CONTRAST_FINDINGS }) => {
      const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();
      const textOf = (el) => norm(el.innerText || el.textContent || '');

      const visible = (el) => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        if (rect.width < 4 || rect.height < 4) return false;
        if (style.visibility === 'hidden' || style.display === 'none') return false;
        if (Number(style.opacity || 1) < 0.05) return false;
        return true;
      };

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

      const contrastRatio = (a, b) => {
        const l1 = luminance(a);
        const l2 = luminance(b);
        return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
      };

      const backgroundOf = (el) => {
        let node = el;
        while (node && node.nodeType === 1) {
          const bg = parseRgb(window.getComputedStyle(node).backgroundColor);
          if (bg) return bg;
          node = node.parentElement;
        }
        return [255, 255, 255];
      };

      const requiredRatio = (fontSizePx) => (
        Number(fontSizePx) >= LARGE_TEXT_FONT_SIZE_PX ? WCAG_AA_LARGE_MIN : WCAG_AA_NORMAL_MIN
      );

      const contrastSamples = Array.from(document.querySelectorAll(BODY_UI_SELECTOR))
        .filter(visible)
        .slice(0, maxSamples)
        .map((el) => {
          const style = window.getComputedStyle(el);
          const fg = parseRgb(style.color);
          const bg = backgroundOf(el);
          const size = Number.parseFloat(style.fontSize || '16');
          const ratio = fg && bg ? contrastRatio(fg, bg) : null;
          return {
            text: textOf(el).slice(0, 80),
            tag: el.tagName.toLowerCase(),
            ratio: ratio ? Number(ratio.toFixed(2)) : null,
            size,
            top: Math.round(el.getBoundingClientRect().top),
          };
        })
        .filter((s) => s.ratio !== null);

      const lowContrast = contrastSamples
        .filter((s) => s.ratio < requiredRatio(s.size))
        .slice(0, MAX_CONTRAST_FINDINGS);

      return {
        sampleCount: contrastSamples.length,
        lowContrast,
      };
    },
    {
      maxSamples,
      BODY_UI_SELECTOR,
      WCAG_AA_NORMAL_MIN,
      WCAG_AA_LARGE_MIN,
      LARGE_TEXT_FONT_SIZE_PX,
      MAX_CONTRAST_FINDINGS,
    },
  );
}

export async function run({ metrics, page, url }) {
  const pageUrl = url || metrics?.url || '';
  let samples = lowContrastSamplesFromMetrics(metrics);

  if (!samples.length && page) {
    const report = metrics?.contrastReport ?? await collectContrastReport(page);
    samples = Array.isArray(report?.lowContrast) ? report.lowContrast : [];
  }

  if (!samples.length) return [];
  return findingsFromContrastSamples(samples, pageUrl);
}
