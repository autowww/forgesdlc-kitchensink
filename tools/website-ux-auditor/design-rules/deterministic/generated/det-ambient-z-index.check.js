/** KS ambient layer z-index contract: bg z-index 0, scrim z-index 1, content z-index 2; pointer-events none on decorative planes. */

const AMBIENT_BG_SELECTOR = '.forge-ambient-bg, .ks-ambient-bg, .ks-section-bg.ks-ambient-bg, .ks-living-scene__global.ks-ambient-bg';
const AMBIENT_CONTAINER_SELECTOR = '.forge-ambient, .ks-has-ambient-bg, .ks-living-section';

export const rule = {
  id: 'DET.AMBIENT.Z_INDEX',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'first-screen',
  scoreDimension: 'visualRhythmFirstScreen',
  defaultSeverity: 'warn',
  priorityWeight: 8,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-ambient-z-index',
};

export function parseZIndex(value) {
  if (!value || value === 'auto') return 0;
  const n = Number.parseInt(String(value), 10);
  return Number.isFinite(n) ? n : 0;
}

/**
 * @param {{ ambientLayerCount?: number, violations?: Array<Record<string, unknown>> } | null | undefined} report
 * @param {string} [url]
 */
export function findingsFromAmbientZIndexReport(report, url = '') {
  const violations = Array.isArray(report?.violations) ? report.violations : [];
  if (!violations.length) return [];

  const findings = [];
  const seen = new Set();

  for (const v of violations.slice(0, 8)) {
    const kind = String(v.kind || 'unknown');
    const key = `${kind}:${v.className || v.selector || ''}:${v.zIndex ?? v.ambientZ ?? ''}`;
    if (seen.has(key)) continue;
    seen.add(key);

    if (kind === 'pointer-events') {
      findings.push({
        severity: 'major',
        area: 'first-screen',
        message: 'Ambient canvas/background layer accepts pointer events and may sit above interactive content.',
        evidence: `pointer-events=${v.pe || 'unknown'} class="${String(v.className || v.selector || '').slice(0, 100)}" z-index=${v.zIndex ?? 'auto'}`,
        remediation:
          'Set pointer-events:none on ambient bg/canvas layers and keep interactive content in .forge-ambient-content / .ks-content with higher z-index per forge-ambient.css and ks-animated-backgrounds.css.',
      });
      continue;
    }

    if (kind === 'z-index-high') {
      findings.push({
        severity: 'warn',
        area: 'first-screen',
        message: 'Ambient background layer z-index exceeds the KS ambient plane contract (bg 0, scrim 1, content 2).',
        evidence: `z-index=${v.zIndex} class="${String(v.className || v.selector || '').slice(0, 100)}"`,
        remediation:
          'Move decorative canvases/SVG to z-index 0–1 and raise prose/CTA wrappers to z-index 2 inside the ambient container.',
      });
      continue;
    }

    if (kind === 'stack-inversion') {
      findings.push({
        severity: 'major',
        area: 'first-screen',
        message: 'Ambient layer z-index is not strictly below its content wrapper in the same container.',
        evidence: `ambient_z=${v.ambientZ} content_z=${v.contentZ} class="${String(v.className || '').slice(0, 100)}"`,
        remediation:
          'Ensure .forge-ambient-bg / .ks-ambient-bg stays at z-index 0 and content wrappers (.forge-ambient-content, .ks-content, section containers) sit above with z-index ≥ 1.',
      });
      continue;
    }

    if (kind === 'canvas-layer') {
      findings.push({
        severity: 'warn',
        area: 'first-screen',
        message: 'Canvas inside an ambient container may block interaction or sit above the content plane.',
        evidence: `canvas z-index=${v.zIndex} pointer-events=${v.pe || 'unknown'} class="${String(v.className || '').slice(0, 80)}"`,
        remediation:
          'Wrap canvases in the ambient bg slot with pointer-events:none and z-index 0, or move drawing surfaces behind .ks-content.',
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
export async function collectAmbientZIndexReport(page) {
  return page.evaluate(
    ({ AMBIENT_BG_SELECTOR, AMBIENT_CONTAINER_SELECTOR }) => {
      const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();
      const parseZ = (value) => {
        if (!value || value === 'auto') return 0;
        const n = Number.parseInt(String(value), 10);
        return Number.isFinite(n) ? n : 0;
      };
      const visible = (el) => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        return rect.width > 1 && rect.height > 1 && style.visibility !== 'hidden'
          && style.display !== 'none' && Number(style.opacity || 1) > 0.05;
      };

      /** @type {Array<Record<string, unknown>>} */
      const violations = [];

      for (const el of document.querySelectorAll('.ks-living-scene')) {
        if (!visible(el)) continue;
        const style = window.getComputedStyle(el);
        const pe = style.pointerEvents;
        const zIndex = parseZ(style.zIndex);
        if (pe !== 'none') {
          violations.push({ kind: 'pointer-events', selector: '.ks-living-scene', pe, zIndex });
        }
        if (zIndex > 0) {
          violations.push({ kind: 'z-index-high', selector: '.ks-living-scene', pe, zIndex });
        }
      }

      for (const el of document.querySelectorAll(AMBIENT_BG_SELECTOR)) {
        if (!visible(el)) continue;
        const style = window.getComputedStyle(el);
        const pe = style.pointerEvents;
        const zIndex = parseZ(style.zIndex);
        const className = norm(el.className).slice(0, 120);

        if (pe !== 'none') {
          violations.push({ kind: 'pointer-events', className, pe, zIndex });
        }
        if (zIndex > 1) {
          violations.push({ kind: 'z-index-high', className, pe, zIndex });
        }

        const container = el.closest(AMBIENT_CONTAINER_SELECTOR);
        if (!container) continue;

        const contentEl = container.querySelector('.forge-ambient-content, .ks-content')
          || (container.classList.contains('ks-living-section')
            ? container.querySelector(':scope > .container, :scope > .container-fluid')
            : null);
        if (!contentEl || !visible(contentEl)) continue;

        const contentZ = parseZ(window.getComputedStyle(contentEl).zIndex);
        if (contentZ > 0 && zIndex >= contentZ) {
          violations.push({ kind: 'stack-inversion', className, ambientZ: zIndex, contentZ });
        }
      }

      for (const el of document.querySelectorAll('canvas')) {
        if (!visible(el)) continue;
        const container = el.closest('.forge-ambient, .ks-has-ambient-bg, .ks-living-scene, [class*="ambient"]');
        if (!container) continue;
        const style = window.getComputedStyle(el);
        const zIndex = parseZ(style.zIndex);
        if (zIndex > 1 || style.pointerEvents !== 'none') {
          violations.push({
            kind: 'canvas-layer',
            className: norm(el.className).slice(0, 80),
            zIndex,
            pe: style.pointerEvents,
          });
        }
      }

      return {
        ambientLayerCount: document.querySelectorAll(AMBIENT_BG_SELECTOR).length,
        violations: violations.slice(0, 12),
      };
    },
    { AMBIENT_BG_SELECTOR, AMBIENT_CONTAINER_SELECTOR },
  );
}

export async function run({ metrics, page, url }) {
  const report = metrics?.ambientZIndexReport
    ?? (page ? await collectAmbientZIndexReport(page) : null);
  if (!report || !(report.violations || []).length) return [];
  return findingsFromAmbientZIndexReport(report, url || metrics?.url || '');
}
