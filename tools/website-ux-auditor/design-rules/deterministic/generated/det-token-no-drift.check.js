/**
 * DET.TOKEN.NO_DRIFT — consumer-bound CSS must not use raw hex colors outside the
 * theme-pack token allowlist (CSS static scan; policy enabled when repo css/ exists).
 */

import fs from 'node:fs';
import path from 'node:path';

/** Cap findings per audit pass. */
export const MAX_TOKEN_DRIFT_FINDINGS = 12;

/** Theme pack files define sanctioned hex values for the allowlist. */
export const THEME_PACK_BASENAMES = new Set([
  'forge-theme.css',
  'docs-theme.css',
  'forgesdlc-theme.css',
  'forge-light-theme.css',
  'forgesdlc-pack-minimal.css',
  'forgesdlc-pack-contrast.css',
  'forgesdlc-pack-showcase.css',
  'forgesdlc-pack-enterprise.css',
  'forgesdlc-pack-focus.css',
  'forge-ambient-themes.css',
]);

export const HEX_LITERAL_RX = /#([0-9a-fA-F]{3,8})\b/g;

export const rule = {
  id: 'DET.TOKEN.NO_DRIFT',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'readability',
  scoreDimension: 'visualRhythmFirstScreen',
  defaultSeverity: 'warn',
  priorityWeight: 7,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-token-no_drift',
};

/**
 * @param {string} raw
 * @returns {string | null}
 */
export function normalizeHex(raw) {
  let h = String(raw || '').trim().toLowerCase().replace(/^#/, '');
  if (/^[0-9a-f]{3}$/.test(h)) {
    h = h.split('').map((c) => c + c).join('');
  }
  if (/^[0-9a-f]{6}$/.test(h) || /^[0-9a-f]{8}$/.test(h)) return `#${h}`;
  return null;
}

/**
 * @param {string} value
 * @returns {Array<{ hex: string, index: number }>}
 */
export function hexLiteralsInValue(value) {
  const out = [];
  const text = String(value || '');
  for (const match of text.matchAll(HEX_LITERAL_RX)) {
    const hex = normalizeHex(match[0]);
    if (hex) out.push({ hex, index: match.index ?? 0 });
  }
  return out;
}

/**
 * @param {string} value
 * @returns {Array<{ start: number, end: number }>}
 */
export function varFallbackSpans(value) {
  const text = String(value || '');
  /** @type {Array<{ start: number, end: number }>} */
  const spans = [];
  const rx = /var\s*\(\s*(?:--[\w-]+|[^,)]+)\s*,\s*/gi;
  let match;
  while ((match = rx.exec(text)) !== null) {
    const start = match.index + match[0].length;
    let depth = 0;
    for (let i = match.index + 3; i < text.length; i += 1) {
      const ch = text[i];
      if (ch === '(') depth += 1;
      else if (ch === ')') {
        if (depth === 0) {
          spans.push({ start, end: i });
          break;
        }
        depth -= 1;
      }
    }
  }
  return spans;
}

/**
 * @param {string} value
 * @param {number} hexIndex
 */
export function isHexInVarFallback(value, hexIndex) {
  return varFallbackSpans(value).some((span) => hexIndex >= span.start && hexIndex < span.end);
}

/**
 * @param {string} cssText
 * @returns {Set<string>}
 */
export function extractHexAllowlistFromCssText(cssText) {
  const allow = new Set();
  for (const { hex } of hexLiteralsInValue(cssText)) allow.add(hex);
  return allow;
}

/**
 * @param {string} repoRoot
 * @returns {Set<string>}
 */
export function buildThemeHexAllowlist(repoRoot) {
  const allow = new Set();
  const cssDir = path.join(repoRoot, 'css');
  if (!fs.existsSync(cssDir)) return allow;

  for (const ent of fs.readdirSync(cssDir, { withFileTypes: true })) {
    if (!ent.isFile() || !ent.name.endsWith('.css')) continue;
    if (!THEME_PACK_BASENAMES.has(ent.name)) continue;
    const text = fs.readFileSync(path.join(cssDir, ent.name), 'utf8');
    for (const hex of extractHexAllowlistFromCssText(text)) allow.add(hex);
  }
  return allow;
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
 * @param {string} prop
 */
export function isLocalTokenDefinition(prop) {
  return String(prop || '').trim().startsWith('--');
}

/**
 * @param {{
 *   prop: string,
 *   value: string,
 *   hex: string,
 *   hexIndex: number,
 *   inThemePack?: boolean,
 *   allowlist?: Set<string>,
 * }} ctx
 */
export function isSanctionedHexUsage(ctx) {
  if (ctx.inThemePack) return true;
  if (isLocalTokenDefinition(ctx.prop)) return true;
  if (isHexInVarFallback(ctx.value, ctx.hexIndex)) return true;
  if (ctx.allowlist?.has(ctx.hex)) return true;
  return false;
}

/**
 * @param {string} cssText
 * @param {string} relPath
 * @param {Set<string>} allowlist
 * @returns {Array<Record<string, unknown>>}
 */
export function scanCssTextForTokenDrift(cssText, relPath = '', allowlist = new Set()) {
  const text = String(cssText || '');
  if (!text.trim()) return [];

  const inThemePack = THEME_PACK_BASENAMES.has(path.basename(relPath));
  /** @type {Array<Record<string, unknown>>} */
  const violations = [];
  const seen = new Set();
  const declRx = /([a-z0-9-]+)\s*:\s*([^;!}]+)/gi;
  let match;

  while ((match = declRx.exec(text)) !== null) {
    const prop = match[1].trim();
    const value = match[2].trim();
    const declIndex = match.index;
    if (!value.includes('#')) continue;
    if (isInKeyframesBlock(text, declIndex)) continue;

    for (const { hex, index } of hexLiteralsInValue(value)) {
      if (isSanctionedHexUsage({
        prop,
        value,
        hex,
        hexIndex: index,
        inThemePack,
        allowlist,
      })) {
        continue;
      }

      const selector = selectorBeforeDeclaration(text, declIndex);
      const key = `${relPath}:${selector}:${prop}:${hex}`;
      if (seen.has(key)) continue;
      seen.add(key);

      violations.push({
        kind: 'raw-hex',
        path: relPath,
        selector,
        property: prop,
        hex,
        value: value.slice(0, 120),
      });
      if (violations.length >= MAX_TOKEN_DRIFT_FINDINGS) return violations;
    }
  }

  return violations;
}

/**
 * @param {string} repoRoot
 */
export function scanRepoTokenDrift(repoRoot) {
  const cssDir = path.join(repoRoot, 'css');
  if (!fs.existsSync(cssDir)) {
    return { skipped: true, reason: 'no-css-dir', violations: [], allowlistSize: 0 };
  }

  const allowlist = buildThemeHexAllowlist(repoRoot);
  /** @type {Array<Record<string, unknown>>} */
  const violations = [];

  for (const ent of fs.readdirSync(cssDir, { withFileTypes: true })) {
    if (!ent.isFile() || !ent.name.endsWith('.css')) continue;
    const rel = `css/${ent.name}`;
    const text = fs.readFileSync(path.join(cssDir, ent.name), 'utf8');
    for (const v of scanCssTextForTokenDrift(text, rel, allowlist)) {
      violations.push(v);
      if (violations.length >= MAX_TOKEN_DRIFT_FINDINGS) break;
    }
    if (violations.length >= MAX_TOKEN_DRIFT_FINDINGS) break;
  }

  return {
    skipped: false,
    cssDir: 'css',
    allowlistSize: allowlist.size,
    violations: violations.slice(0, MAX_TOKEN_DRIFT_FINDINGS),
  };
}

/**
 * @param {{
 *   tokenNoDriftPolicy?: boolean,
 *   enforceTokenNoDrift?: boolean,
 *   repoRoot?: string,
 * } | null | undefined} ctx
 * @param {{ tokenNoDriftPolicy?: boolean, repoRoot?: string } | null | undefined} metrics
 * @param {string} repoRoot
 */
export function isTokenDriftPolicyEnabled(ctx, metrics, repoRoot) {
  if (ctx?.tokenNoDriftPolicy === false || ctx?.enforceTokenNoDrift === false) return false;
  if (metrics?.tokenNoDriftPolicy === false) return false;
  if (ctx?.tokenNoDriftPolicy === true || ctx?.enforceTokenNoDrift === true) return true;
  if (metrics?.tokenNoDriftPolicy === true) return true;
  const root = String(repoRoot || ctx?.repoRoot || metrics?.repoRoot || '').trim();
  if (!root) return false;
  return fs.existsSync(path.join(root, 'css'));
}

/**
 * @param {{
 *   violations?: Array<Record<string, unknown>>,
 *   skipped?: boolean,
 * }} report
 * @param {string} [url]
 */
export function findingsFromTokenDriftReport(report, url = '') {
  const violations = Array.isArray(report?.violations) ? report.violations : [];
  if (!violations.length) return [];

  const findings = [];
  const seen = new Set();

  for (const v of violations.slice(0, MAX_TOKEN_DRIFT_FINDINGS)) {
    const selector = String(v.selector || v.selectorHint || '').slice(0, 120);
    const pathLabel = String(v.path || '').slice(0, 120);
    const prop = String(v.property || '').slice(0, 64);
    const hex = String(v.hex || '').slice(0, 16);
    const key = `${pathLabel}:${selector}:${prop}:${hex}`;
    if (seen.has(key)) continue;
    seen.add(key);

    findings.push({
      severity: 'warn',
      area: 'readability',
      message:
        `Raw hex color ${hex} is used outside the theme token allowlist; prefer var(--forge-*) or other sanctioned design tokens.`,
      evidence: [
        'raw_hex_outside_allowlist',
        pathLabel ? `path=${pathLabel}` : null,
        selector ? `selector="${selector}"` : null,
        prop ? `property=${prop}` : null,
        hex ? `hex=${hex}` : null,
      ].filter(Boolean).join(' '),
      remediation:
        'Replace raw hex literals with theme custom properties (e.g. var(--forge-cyan)) or add the value to a theme pack token definition instead of feature CSS.',
    });
  }

  if (url) {
    for (const finding of findings) {
      finding.evidence = `${finding.evidence} url=${url}`;
    }
  }

  return findings;
}

export async function run({ metrics, url, repoRoot, ctx }) {
  const root = String(repoRoot || ctx?.repoRoot || metrics?.repoRoot || '').trim();
  if (!isTokenDriftPolicyEnabled(ctx, metrics, root)) return [];

  const pageUrl = url || metrics?.url || '';
  /** @type {Array<Record<string, unknown>>} */
  const violations = [];

  const pageReport = metrics?.tokenDriftReport;
  if (pageReport?.violations?.length) {
    violations.push(...pageReport.violations);
  }

  if (root && violations.length < MAX_TOKEN_DRIFT_FINDINGS) {
    const repoReport = metrics?.tokenDriftRepoReport ?? scanRepoTokenDrift(root);
    if (!repoReport?.skipped && Array.isArray(repoReport?.violations)) {
      for (const v of repoReport.violations) {
        violations.push(v);
        if (violations.length >= MAX_TOKEN_DRIFT_FINDINGS) break;
      }
    }
  }

  if (!violations.length) return [];

  return findingsFromTokenDriftReport(
    { violations: violations.slice(0, MAX_TOKEN_DRIFT_FINDINGS) },
    pageUrl,
  );
}
