/**
 * DET.SURFACE.ELEVATION_TOKEN — elevated surfaces (cards, dialogs, panels) must use
 * sanctioned theme elevation tokens (var(--forge-glow-*), var(--ks-*), var(--bs-*)),
 * not raw one-off box-shadow literals outside theme packs.
 */

import fs from 'node:fs';
import path from 'node:path';

/** Cap findings per audit pass. */
export const MAX_SURFACE_ELEVATION_FINDINGS = 12;

/** Theme pack files may define raw shadow values as token sources. */
export const THEME_PACK_BASENAMES = new Set([
  'forge-theme.css',
  'docs-theme.css',
  'forgesdlc-theme.css',
  'forge-light-theme.css',
  'forgesdlc-pack-minimal.css',
  'forgesdlc-pack-contrast.css',
  'forgesdlc-pack-showcase.css',
  'forgesdlc-pack-enterprise.css',
]);

/** var() prefixes that count as sanctioned elevation tokens. */
export const SANCTIONED_VAR_PREFIXES = [
  '--forge-glow-',
  '--forge-',
  '--ks-',
  '--bs-',
  '--le-surface',
];

/** Thin ring shadows used as border substitutes (not elevation drift). */
export const BORDER_RING_LAYER_RX = /^(?:inset\s+)?0(?:px)?\s+0(?:px)?\s+0(?:px)?\s+\d+(?:px)?\s+/i;

/** Zero / no-op shadow layers. */
export const ZERO_SHADOW_LAYER_RX = /^0(?:px)?\s+0(?:px)?\s+0(?:px)?\s+0(?:px)?/i;

export const SURFACE_SELECTOR_RX =
  /\b(?:\.|#)?(?:card|forge-card|modal|dialog|popover|offcanvas|dropdown-menu|tooltip|tile-panel|ks-nrm-dialog|ks-tile-panel|panel|surface)\b|\[data-card\]|\.ks-[a-z0-9-]*(?:dialog|panel|popover|surface)\b/i;

export const rule = {
  id: 'DET.SURFACE.ELEVATION_TOKEN',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'readability',
  scoreDimension: 'visualRhythmFirstScreen',
  defaultSeverity: 'warn',
  priorityWeight: 7,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-surface-elevation_token',
};

/**
 * @param {string} value
 * @returns {string[]}
 */
export function splitBoxShadowLayers(value) {
  const raw = String(value || '').trim();
  if (!raw) return [];
  const layers = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < raw.length; i += 1) {
    const ch = raw[i];
    if (ch === '(') depth += 1;
    else if (ch === ')') depth -= 1;
    else if (ch === ',' && depth === 0) {
      layers.push(raw.slice(start, i).trim());
      start = i + 1;
    }
  }
  layers.push(raw.slice(start).trim());
  return layers.filter(Boolean);
}

/**
 * @param {string} layer
 */
export function isSanctionedBoxShadowLayer(layer) {
  const s = String(layer || '').trim().toLowerCase();
  if (!s || s === 'none') return true;
  if (BORDER_RING_LAYER_RX.test(s)) return true;
  if (ZERO_SHADOW_LAYER_RX.test(s)) return true;
  if (/\bvar\s*\(/i.test(s)) {
    return SANCTIONED_VAR_PREFIXES.some((prefix) => new RegExp(`var\\s*\\(\\s*${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i').test(s));
  }
  return false;
}

/**
 * @param {string} value
 */
export function isSanctionedBoxShadowValue(value) {
  const norm = String(value || '').trim().toLowerCase();
  if (!norm || norm === 'none' || norm === 'inherit' || norm === 'unset' || norm === 'initial') {
    return true;
  }
  const layers = splitBoxShadowLayers(value);
  if (!layers.length) return true;
  return layers.every((layer) => isSanctionedBoxShadowLayer(layer));
}

/**
 * @param {string} selectorText
 */
export function isSurfaceSelector(selectorText) {
  const parts = String(selectorText || '').split(',');
  return parts.some((part) => {
    const sel = part.trim();
    if (!sel || /@/.test(sel)) return false;
    if (/\b(?:card-title|card-header|card-footer|card-body|card-subtitle|card-text|card-link)\b/i.test(sel)) {
      return false;
    }
    return SURFACE_SELECTOR_RX.test(sel);
  });
}

/**
 * @param {string} cssText
 * @param {number} declIndex
 */
export function selectorBeforeDeclaration(cssText, declIndex) {
  const before = String(cssText || '').slice(0, declIndex);
  const open = before.lastIndexOf('{');
  if (open < 0) return '';
  const chunk = before.slice(0, open);
  const selStart = Math.max(chunk.lastIndexOf('}'), chunk.lastIndexOf(';')) + 1;
  return chunk.slice(selStart).replace(/\s+/g, ' ').trim();
}

/**
 * @param {string} cssText
 * @param {number} declIndex
 */
export function isInKeyframesBlock(cssText, declIndex) {
  const before = String(cssText || '').slice(0, declIndex);
  return /@keyframes\s+[\w-]+\s*\{[^}]*$/i.test(before)
    || (before.lastIndexOf('@keyframes') > before.lastIndexOf('}'));
}

/**
 * @param {string} cssText
 * @param {string} relPath
 * @returns {Array<Record<string, unknown>>}
 */
export function scanCssTextForElevationViolations(cssText, relPath = '') {
  const text = String(cssText || '');
  if (!text.trim()) return [];

  /** @type {Array<Record<string, unknown>>} */
  const violations = [];
  const seen = new Set();
  const declRx = /box-shadow\s*:\s*([^;!}]+)/gi;
  let match;

  while ((match = declRx.exec(text)) !== null) {
    const value = match[1].trim();
    const declIndex = match.index;
    if (isInKeyframesBlock(text, declIndex)) continue;
    if (isSanctionedBoxShadowValue(value)) continue;

    const selector = selectorBeforeDeclaration(text, declIndex);
    if (!isSurfaceSelector(selector)) continue;

    const key = `${relPath}:${selector}:${value.slice(0, 80)}`;
    if (seen.has(key)) continue;
    seen.add(key);

    violations.push({
      kind: 'raw-box-shadow',
      path: relPath,
      selector,
      value: value.slice(0, 160),
    });
    if (violations.length >= MAX_SURFACE_ELEVATION_FINDINGS) break;
  }

  return violations;
}

/**
 * @param {string} repoRoot
 */
export function scanRepoSurfaceElevation(repoRoot) {
  const cssDir = path.join(repoRoot, 'css');
  if (!fs.existsSync(cssDir)) {
    return { skipped: true, reason: 'no-css-dir', violations: [] };
  }

  /** @type {Array<Record<string, unknown>>} */
  const violations = [];

  for (const ent of fs.readdirSync(cssDir, { withFileTypes: true })) {
    if (!ent.isFile() || !ent.name.endsWith('.css')) continue;
    if (THEME_PACK_BASENAMES.has(ent.name)) continue;
    const rel = `css/${ent.name}`;
    const text = fs.readFileSync(path.join(cssDir, ent.name), 'utf8');
    for (const v of scanCssTextForElevationViolations(text, rel)) {
      violations.push(v);
      if (violations.length >= MAX_SURFACE_ELEVATION_FINDINGS) break;
    }
    if (violations.length >= MAX_SURFACE_ELEVATION_FINDINGS) break;
  }

  return {
    skipped: false,
    cssDir: 'css',
    violations: violations.slice(0, MAX_SURFACE_ELEVATION_FINDINGS),
  };
}

/**
 * @param {{
 *   violations?: Array<Record<string, unknown>>,
 *   skipped?: boolean,
 * } | null | undefined} report
 * @param {string} [url]
 */
export function findingsFromSurfaceElevationReport(report, url = '') {
  const violations = Array.isArray(report?.violations) ? report.violations : [];
  if (!violations.length) return [];

  const findings = [];
  const seen = new Set();

  for (const v of violations.slice(0, MAX_SURFACE_ELEVATION_FINDINGS)) {
    const selector = String(v.selector || v.selectorHint || '').slice(0, 120);
    const pathLabel = String(v.path || '').slice(0, 120);
    const value = String(v.value || '').slice(0, 100);
    const key = `${pathLabel}:${selector}:${value}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const where = pathLabel
      ? (selector ? `${pathLabel} (${selector})` : pathLabel)
      : (selector || 'surface');

    findings.push({
      severity: 'warn',
      area: 'readability',
      message:
        'An elevated surface uses a raw box-shadow instead of a sanctioned elevation token (e.g. var(--forge-glow-cyan), var(--ks-tile-panel-shadow)).',
      evidence: [
        'raw_surface_box_shadow',
        pathLabel ? `path=${pathLabel}` : null,
        selector ? `selector="${selector}"` : null,
        value ? `value="${value}"` : null,
      ].filter(Boolean).join(' '),
      remediation:
        'Define or reuse a theme elevation custom property in the theme pack, then reference it with var(...) on cards, dialogs, panels, and other elevated surfaces.',
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
export async function collectSurfaceElevationReport(page) {
  return page.evaluate(
    ({
      surfaceSelectorSource,
      sanctionedVarPrefixes,
      borderRingSource,
      zeroShadowSource,
    }) => {
      const surfaceSelector = new RegExp(surfaceSelectorSource, 'i');
      const borderRing = new RegExp(borderRingSource, 'i');
      const zeroShadow = new RegExp(zeroShadowSource, 'i');
      const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();

      const splitLayers = (value) => {
        const raw = norm(value);
        if (!raw) return [];
        const layers = [];
        let depth = 0;
        let start = 0;
        for (let i = 0; i < raw.length; i += 1) {
          const ch = raw[i];
          if (ch === '(') depth += 1;
          else if (ch === ')') depth -= 1;
          else if (ch === ',' && depth === 0) {
            layers.push(raw.slice(start, i).trim());
            start = i + 1;
          }
        }
        layers.push(raw.slice(start).trim());
        return layers.filter(Boolean);
      };

      const layerSanctioned = (layer) => {
        const s = norm(layer).toLowerCase();
        if (!s || s === 'none') return true;
        if (borderRing.test(s)) return true;
        if (zeroShadow.test(s)) return true;
        if (!/\bvar\s*\(/i.test(s)) return false;
        return sanctionedVarPrefixes.some((prefix) => s.includes(`var(${prefix}`) || s.includes(`var( ${prefix}`));
      };

      const valueSanctioned = (value) => {
        const v = norm(value).toLowerCase();
        if (!v || v === 'none' || v === 'inherit' || v === 'unset' || v === 'initial') return true;
        const layers = splitLayers(value);
        return layers.length > 0 && layers.every(layerSanctioned);
      };

      const isSurfaceSelectorText = (selectorText) => {
        const parts = String(selectorText || '').split(',');
        return parts.some((part) => {
          const sel = part.trim();
          if (!sel || /@/.test(sel)) return false;
          if (/\b(?:card-title|card-header|card-footer|card-body|card-subtitle|card-text|card-link)\b/i.test(sel)) {
            return false;
          }
          return surfaceSelector.test(sel);
        });
      };

      const selectorHintFor = (el) => {
        const id = el.id ? `#${el.id}` : '';
        const cls = norm(el.className).split(' ').filter(Boolean).slice(0, 3).join('.');
        const hash = el.getAttribute('data-ks-hash') || el.getAttribute('hash') || '';
        return `${el.tagName.toLowerCase()}${id}${cls ? `.${cls}` : ''}${hash ? `[@${hash}]` : ''}`;
      };

      const visible = (el) => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        if (rect.width < 4 || rect.height < 4) return false;
        if (style.visibility === 'hidden' || style.display === 'none') return false;
        if (Number(style.opacity || 1) < 0.05) return false;
        return true;
      };

      const matchesSurface = (el) => {
        if (!(el instanceof Element)) return false;
        if (el.matches('dialog, [role="dialog"]')) return true;
        if (el.hasAttribute('data-card')) return true;
        try {
          return el.matches(surfaceSelector);
        } catch {
          return surfaceSelector.test(String(el.className || ''));
        }
      };

      /** @type {Array<Record<string, unknown>>} */
      const violations = [];
      const seen = new Set();

      const pushViolation = (payload) => {
        const key = `${payload.path || ''}:${payload.selector || payload.selectorHint || ''}:${payload.value || ''}`;
        if (seen.has(key)) return;
        seen.add(key);
        violations.push(payload);
      };

      for (const el of document.querySelectorAll('body *')) {
        if (!(el instanceof HTMLElement) || !visible(el) || !matchesSurface(el)) continue;
        const inline = el.getAttribute('style') || '';
        const inlineMatch = /box-shadow\s*:\s*([^;]+)/i.exec(inline);
        if (!inlineMatch) continue;
        const inlineVal = inlineMatch[1].trim();
        if (valueSanctioned(inlineVal)) continue;
        pushViolation({
          kind: 'inline-raw-box-shadow',
          selectorHint: selectorHintFor(el),
          value: inlineVal.slice(0, 160),
        });
        if (violations.length >= 12) break;
      }

      if (violations.length < 12) {
        for (const sheet of document.styleSheets) {
          let rules;
          try {
            rules = sheet.cssRules;
          } catch {
            continue;
          }
          if (!rules) continue;
          let href = '';
          try {
            href = sheet.href ? new URL(sheet.href).pathname.split('/').pop() : 'inline';
          } catch {
            href = 'stylesheet';
          }

          for (const rule of rules) {
            if (rule.type !== CSSRule.STYLE_RULE) continue;
            const selectorText = rule.selectorText || '';
            if (!isSurfaceSelectorText(selectorText)) continue;
            const val = rule.style.getPropertyValue('box-shadow');
            if (!val || valueSanctioned(val)) continue;
            pushViolation({
              kind: 'stylesheet-raw-box-shadow',
              path: href,
              selector: selectorText.slice(0, 160),
              value: val.slice(0, 160),
            });
            if (violations.length >= 12) break;
          }
          if (violations.length >= 12) break;
        }
      }

      return {
        violationCount: violations.length,
        violations: violations.slice(0, 12),
      };
    },
    {
      surfaceSelectorSource: SURFACE_SELECTOR_RX.source,
      sanctionedVarPrefixes: SANCTIONED_VAR_PREFIXES,
      borderRingSource: BORDER_RING_LAYER_RX.source,
      zeroShadowSource: ZERO_SHADOW_LAYER_RX.source,
    },
  );
}

export async function run({ metrics, page, url, repoRoot, ctx }) {
  const root = String(repoRoot || ctx?.repoRoot || metrics?.repoRoot || '').trim();
  /** @type {Array<Record<string, unknown>>} */
  const violations = [];

  const pageReport = metrics?.surfaceElevationReport
    ?? (page ? await collectSurfaceElevationReport(page) : null);
  if (pageReport?.violations?.length) {
    violations.push(...pageReport.violations);
  }

  if (root && violations.length < MAX_SURFACE_ELEVATION_FINDINGS) {
    const repoReport = metrics?.surfaceElevationRepoReport ?? scanRepoSurfaceElevation(root);
    if (!repoReport?.skipped && Array.isArray(repoReport?.violations)) {
      for (const v of repoReport.violations) {
        violations.push(v);
        if (violations.length >= MAX_SURFACE_ELEVATION_FINDINGS) break;
      }
    }
  }

  if (!violations.length) return [];

  return findingsFromSurfaceElevationReport(
    { violations: violations.slice(0, MAX_SURFACE_ELEVATION_FINDINGS) },
    url || metrics?.url || '',
  );
}
