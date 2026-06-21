/**
 * DET.THEME.FONT_STACK — display, body/label, and mono roles use approved theme font stacks.
 * Live: Playwright computed styles on representative text roles.
 * Static: CSS scan of consumer stylesheets (css/, src/) against theme token allowlists.
 */

import fs from 'node:fs';
import path from 'node:path';

/** Cap findings per audit pass. */
export const MAX_FONT_STACK_FINDINGS = 12;

/** Theme pack files define sanctioned font stacks (not scanned for drift). */
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

/** CSS custom properties that carry role font stacks. */
export const FONT_TOKEN_VARS = [
  '--font-display',
  '--font-mono',
  '--font-label',
  '--bs-body-font-family',
  '--font-body',
  '--ks-font-family-sans',
  '--ks-font-family-serif',
  '--ks-font-family-mono',
  '--forge-font-family-sans',
  '--forge-font-family-serif',
  '--forge-font-family-mono',
];

/** Generic families always permitted as fallbacks. */
export const ALLOWED_GENERIC = new Set([
  'system-ui',
  'ui-sans-serif',
  'ui-serif',
  'ui-monospace',
  'sans-serif',
  'serif',
  'monospace',
  'cursive',
  'fantasy',
]);

/** Named faces permitted when theme packs are absent (generic / Vite sites). */
export const GENERIC_NAMED_FALLBACKS = new Set([
  'inter',
  'roboto',
  'helvetica neue',
  'helvetica',
  'arial',
  'segoe ui',
  'noto sans',
  'noto serif',
  'noto sans mono',
  'open sans',
  'source sans 3',
  'source serif 4',
  'jetbrains mono',
  'sfmono-regular',
  'menlo',
  'monaco',
  'consolas',
  'courier new',
  'courier',
  'proxima nova',
  'proxima nova black',
  'proxima-nova',
]);

/** Representative DOM roles sampled in Playwright. */
export const TEXT_ROLE_SAMPLES = [
  { role: 'body', expectedRole: 'body', selectors: ['body', 'main p', 'article p'] },
  { role: 'heading', expectedRole: 'display', selectors: ['h1', 'h2', '.font-display'] },
  { role: 'navigation', expectedRole: 'label', selectors: ['nav a', '[role="navigation"] a', '.navbar a', '.nav-link'] },
  { role: 'control', expectedRole: 'label', selectors: ['button', '.btn', '[role="button"]'] },
  { role: 'code', expectedRole: 'mono', selectors: ['pre', 'code', '.font-mono'] },
];

export const rule = {
  id: 'DET.THEME.FONT_STACK',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'readability',
  scoreDimension: 'visualRhythmFirstScreen',
  defaultSeverity: 'warn',
  priorityWeight: 7,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-theme-font_stack',
};

/**
 * @param {string} raw
 */
export function normalizeFontPart(raw) {
  return String(raw || '')
    .trim()
    .replace(/^['"]|['"]$/g, '')
    .toLowerCase();
}

/**
 * @param {string} fontFamily
 * @returns {string[]}
 */
export function parseFontFamilyStack(fontFamily) {
  if (!fontFamily || typeof fontFamily !== 'string') return [];
  return fontFamily.split(',').map(normalizeFontPart).filter(Boolean);
}

/**
 * @param {string} fontFamily
 */
export function primaryFontFace(fontFamily) {
  const parts = parseFontFamilyStack(fontFamily);
  for (const part of parts) {
    if (!ALLOWED_GENERIC.has(part)) return part;
  }
  return parts[0] || '';
}

/**
 * @param {string} stackValue
 * @returns {string[]}
 */
export function primariesFromStackValue(stackValue) {
  const out = [];
  for (const part of parseFontFamilyStack(stackValue)) {
    if (!ALLOWED_GENERIC.has(part)) out.push(part);
  }
  return out;
}

/**
 * @param {string} cssText
 * @returns {ThemeFontAllowlist}
 */
export function buildThemeFontAllowlistFromCssText(cssText) {
  /** @type {Record<string, Set<string>>} */
  const byRole = {
    body: new Set(GENERIC_NAMED_FALLBACKS),
    display: new Set(GENERIC_NAMED_FALLBACKS),
    label: new Set(GENERIC_NAMED_FALLBACKS),
    mono: new Set(GENERIC_NAMED_FALLBACKS),
  };

  const text = String(cssText || '');
  const varRx = /(--(?:font-(?:display|mono|label|body)|bs-body-font-family|ks-font-family-(?:sans|serif|mono)|forge-font-family-(?:sans|serif|mono)))\s*:\s*([^;}{]+)/gi;
  let match;
  while ((match = varRx.exec(text)) !== null) {
    const name = match[1].toLowerCase();
    const value = match[2].trim();
    const primaries = primariesFromStackValue(value);
    const target =
      name.includes('mono') ? 'mono'
        : name.includes('display') ? 'display'
          : name.includes('label') ? 'label'
            : 'body';
    for (const p of primaries) {
      byRole[target].add(p);
      if (target === 'display' || target === 'label') byRole.body.add(p);
      if (target === 'body') {
        byRole.label.add(p);
        byRole.display.add(p);
      }
    }
  }

  return {
    body: byRole.body,
    display: byRole.display,
    label: byRole.label,
    mono: byRole.mono,
    union: new Set([...byRole.body, ...byRole.display, ...byRole.label, ...byRole.mono]),
  };
}

/**
 * @typedef {{ body: Set<string>, display: Set<string>, label: Set<string>, mono: Set<string>, union: Set<string> }} ThemeFontAllowlist
 */

/**
 * @param {string} repoRoot
 * @returns {ThemeFontAllowlist}
 */
export function buildThemeFontAllowlist(repoRoot) {
  const merged = buildThemeFontAllowlistFromCssText('');
  const dirs = [
    path.join(repoRoot, 'css'),
    path.join(repoRoot, 'kitchensink', 'css'),
  ];

  for (const cssDir of dirs) {
    if (!fs.existsSync(cssDir)) continue;
    for (const ent of fs.readdirSync(cssDir, { withFileTypes: true })) {
      if (!ent.isFile() || !ent.name.endsWith('.css')) continue;
      if (!THEME_PACK_BASENAMES.has(ent.name)) continue;
      const text = fs.readFileSync(path.join(cssDir, ent.name), 'utf8');
      const pack = buildThemeFontAllowlistFromCssText(text);
      for (const key of ['body', 'display', 'label', 'mono']) {
        for (const face of pack[key]) merged[key].add(face);
      }
      for (const face of pack.union) merged.union.add(face);
    }
  }

  return merged;
}

/**
 * @param {string} value
 */
export function fontFamilyUsesThemeVar(value) {
  const v = String(value || '');
  if (!/\bvar\s*\(/i.test(v)) return false;
  return FONT_TOKEN_VARS.some((name) => new RegExp(`var\\s*\\(\\s*${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i').test(v));
}

/**
 * @param {string} observed
 * @param {ThemeFontAllowlist} allowlist
 * @param {string} expectedRole
 */
export function isObservedFontAllowed(observed, allowlist, expectedRole) {
  const face = primaryFontFace(observed);
  if (!face) return true;
  if (ALLOWED_GENERIC.has(face)) return true;

  const roleSet = allowlist[expectedRole] || allowlist.union;
  if (roleSet.has(face)) return true;

  for (const allowed of roleSet) {
    if (face.includes(allowed) || allowed.includes(face)) return true;
  }
  for (const allowed of allowlist.union) {
    if (face.includes(allowed) || allowed.includes(face)) return true;
  }
  return false;
}

/**
 * @param {string} value
 * @param {ThemeFontAllowlist} allowlist
 */
export function isStaticFontFamilyValueAllowed(value, allowlist) {
  const norm = String(value || '').trim();
  if (!norm || norm === 'inherit' || norm === 'unset' || norm === 'initial') return true;
  if (fontFamilyUsesThemeVar(norm)) return true;

  const parts = parseFontFamilyStack(norm);
  if (!parts.length) return true;
  return parts.every((part) => {
    if (ALLOWED_GENERIC.has(part)) return true;
    if (GENERIC_NAMED_FALLBACKS.has(part)) return true;
    if (allowlist.union.has(part)) return true;
    for (const allowed of allowlist.union) {
      if (part.includes(allowed) || allowed.includes(part)) return true;
    }
    return false;
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
 * @param {string} selector
 */
export function isContentFontSelector(selector) {
  const sel = String(selector || '').trim();
  if (!sel || /@font-face/i.test(sel)) return false;
  if (/^:root\b/i.test(sel) && !/[.#\[]/.test(sel)) return false;
  return true;
}

/**
 * @param {string} cssText
 * @param {string} relPath
 * @param {ThemeFontAllowlist} allowlist
 */
export function scanCssTextForFontStackViolations(cssText, relPath = '', allowlist) {
  const text = String(cssText || '');
  if (!text.trim()) return [];

  const inThemePack = THEME_PACK_BASENAMES.has(path.basename(relPath));
  if (inThemePack) return [];

  /** @type {Array<Record<string, unknown>>} */
  const violations = [];
  const seen = new Set();
  const declRx = /font-family\s*:\s*([^;!}]+)/gi;
  let match;

  while ((match = declRx.exec(text)) !== null) {
    const value = match[1].trim();
    const declIndex = match.index;
    if (isStaticFontFamilyValueAllowed(value, allowlist)) continue;

    const selector = selectorBeforeDeclaration(text, declIndex);
    if (!isContentFontSelector(selector)) continue;

    const observed = primaryFontFace(value) || value.slice(0, 80);
    const key = `${relPath}:${selector}:${observed}`;
    if (seen.has(key)) continue;
    seen.add(key);

    violations.push({
      kind: 'raw-font-family',
      path: relPath,
      selector: selector.slice(0, 160),
      observed,
      value: value.slice(0, 160),
      role: 'stylesheet',
      expectedRole: inferExpectedRoleFromSelector(selector),
    });
    if (violations.length >= MAX_FONT_STACK_FINDINGS) break;
  }

  return violations;
}

/**
 * @param {string} selector
 */
export function inferExpectedRoleFromSelector(selector) {
  const sel = String(selector || '').toLowerCase();
  if (/\bpre\b|\bcode\b|\.font-mono|mono/.test(sel)) return 'mono';
  if (/\bh1\b|\bh2\b|\.font-display|display/.test(sel)) return 'display';
  if (/\bnav\b|\.nav-|navbar|navigation/.test(sel)) return 'label';
  if (/\bbutton\b|\.btn\b|control/.test(sel)) return 'label';
  return 'body';
}

/**
 * @param {string} dir
 * @param {string} prefix
 * @param {ThemeFontAllowlist} allowlist
 * @param {Array<Record<string, unknown>>} violations
 */
function scanCssDir(dir, prefix, allowlist, violations) {
  if (!fs.existsSync(dir)) return;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, ent.name);
    const rel = `${prefix}/${ent.name}`;
    if (ent.isDirectory()) {
      scanCssDir(abs, rel, allowlist, violations);
      continue;
    }
    if (!ent.isFile() || !/\.(css|module\.css)$/i.test(ent.name)) continue;
    const text = fs.readFileSync(abs, 'utf8');
    for (const v of scanCssTextForFontStackViolations(text, rel, allowlist)) {
      violations.push(v);
      if (violations.length >= MAX_FONT_STACK_FINDINGS) return;
    }
  }
}

/**
 * @param {string} repoRoot
 */
export function scanRepoFontStack(repoRoot) {
  const allowlist = buildThemeFontAllowlist(repoRoot);
  /** @type {Array<Record<string, unknown>>} */
  const violations = [];

  scanCssDir(path.join(repoRoot, 'css'), 'css', allowlist, violations);
  if (violations.length < MAX_FONT_STACK_FINDINGS) {
    scanCssDir(path.join(repoRoot, 'src'), 'src', allowlist, violations);
  }

  if (!violations.length && !fs.existsSync(path.join(repoRoot, 'css')) && !fs.existsSync(path.join(repoRoot, 'src'))) {
    return { skipped: true, reason: 'no-css-or-src', violations: [], allowlist };
  }

  return {
    skipped: false,
    violations: violations.slice(0, MAX_FONT_STACK_FINDINGS),
    allowlist,
  };
}

/**
 * @param {string} expectedRole
 */
export function themeVarHint(expectedRole) {
  switch (expectedRole) {
    case 'display':
      return 'var(--font-display)';
    case 'mono':
      return 'var(--font-mono)';
    case 'label':
      return 'var(--font-label)';
    default:
      return 'var(--bs-body-font-family)';
  }
}

/**
 * @param {{
 *   violations?: Array<Record<string, unknown>>,
 * }} report
 * @param {string} [url]
 */
export function findingsFromFontStackReport(report, url = '') {
  const violations = Array.isArray(report?.violations) ? report.violations : [];
  if (!violations.length) return [];

  const findings = [];
  const seen = new Set();

  for (const v of violations.slice(0, MAX_FONT_STACK_FINDINGS)) {
    const role = String(v.role || 'unknown').slice(0, 40);
    const expectedRole = String(v.expectedRole || inferExpectedRoleFromSelector(v.selector || '')).slice(0, 24);
    const selector = String(v.selector || v.selectorHint || '').slice(0, 120);
    const pathLabel = String(v.path || '').slice(0, 120);
    const observed = String(v.observed || primaryFontFace(v.value || '') || '').slice(0, 80);
    const key = `${pathLabel}:${selector}:${role}:${observed}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const where = pathLabel
      ? (selector ? `${pathLabel} (${selector})` : pathLabel)
      : (selector || role);

    findings.push({
      severity: 'warn',
      area: 'readability',
      message:
        `Font stack drift on ${role}: observed "${observed}" is outside the approved ${expectedRole} theme stack.`,
      evidence: [
        'font_stack_drift',
        `role=${role}`,
        `expectedRole=${expectedRole}`,
        observed ? `observed="${observed}"` : null,
        selector ? `selector="${selector}"` : null,
        pathLabel ? `path=${pathLabel}` : null,
      ].filter(Boolean).join(' '),
      remediation:
        `Set font-family via theme tokens (${themeVarHint(expectedRole)}) in shared theme CSS — not per-page inline overrides.`,
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
export async function collectFontStackReport(page) {
  return page.evaluate(
    ({ TEXT_ROLE_SAMPLES, ALLOWED_GENERIC_LIST, GENERIC_NAMED_LIST }) => {
      const ALLOWED_GENERIC = new Set(ALLOWED_GENERIC_LIST);
      const GENERIC_NAMED = new Set(GENERIC_NAMED_LIST);

      const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();
      const visible = (el) => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        if (rect.width < 4 || rect.height < 4) return false;
        if (style.visibility === 'hidden' || style.display === 'none') return false;
        if (Number(style.opacity || 1) < 0.05) return false;
        return true;
      };

      const normalizePart = (raw) => String(raw || '').trim().replace(/^['"]|['"]$/g, '').toLowerCase();
      const parseStack = (fontFamily) => (
        String(fontFamily || '').split(',').map(normalizePart).filter(Boolean)
      );
      const primaryFace = (fontFamily) => {
        const parts = parseStack(fontFamily);
        for (const part of parts) {
          if (!ALLOWED_GENERIC.has(part)) return part;
        }
        return parts[0] || '';
      };

      const readThemePrimaries = () => {
        const root = getComputedStyle(document.documentElement);
        const vars = [
          '--font-display',
          '--font-mono',
          '--font-label',
          '--bs-body-font-family',
        ];
        const union = new Set([...GENERIC_NAMED]);
        const byRole = { body: new Set(union), display: new Set(union), label: new Set(union), mono: new Set(union) };
        for (const name of vars) {
          const val = root.getPropertyValue(name).trim();
          if (!val) continue;
          const role = name.includes('mono') ? 'mono' : name.includes('display') ? 'display' : name.includes('label') ? 'label' : 'body';
          for (const part of parseStack(val)) {
            if (!ALLOWED_GENERIC.has(part)) {
              byRole[role].add(part);
              byRole.body.add(part);
              union.add(part);
            }
          }
        }
        return { byRole, union };
      };

      const theme = readThemePrimaries();

      const faceAllowed = (observed, expectedRole) => {
        const face = primaryFace(observed);
        if (!face || ALLOWED_GENERIC.has(face)) return true;
        const roleSet = theme.byRole[expectedRole] || theme.union;
        if (roleSet.has(face)) return true;
        for (const allowed of roleSet) {
          if (face.includes(allowed) || allowed.includes(face)) return true;
        }
        for (const allowed of theme.union) {
          if (face.includes(allowed) || allowed.includes(face)) return true;
        }
        return false;
      };

      /** @type {Array<Record<string, unknown>>} */
      const violations = [];
      const seen = new Set();

      for (const sample of TEXT_ROLE_SAMPLES) {
        for (const selector of sample.selectors) {
          const el = document.querySelector(selector);
          if (!el || !visible(el)) continue;
          const fontFamily = getComputedStyle(el).fontFamily;
          if (faceAllowed(fontFamily, sample.expectedRole)) continue;
          const observed = primaryFace(fontFamily);
          const key = `${sample.role}:${selector}:${observed}`;
          if (seen.has(key)) continue;
          seen.add(key);
          violations.push({
            kind: 'computed-font-family',
            role: sample.role,
            expectedRole: sample.expectedRole,
            selector,
            observed,
            fontFamily: String(fontFamily).slice(0, 160),
          });
          if (violations.length >= 12) return { violations };
        }
      }

      return { violations };
    },
    {
      TEXT_ROLE_SAMPLES,
      ALLOWED_GENERIC_LIST: [...ALLOWED_GENERIC],
      GENERIC_NAMED_LIST: [...GENERIC_NAMED_FALLBACKS],
    },
  );
}

export async function run({ metrics, page, url, repoRoot, ctx }) {
  const root = String(repoRoot || ctx?.repoRoot || metrics?.repoRoot || '').trim();
  /** @type {Array<Record<string, unknown>>} */
  const violations = [];

  const pageReport = metrics?.fontStackReport
    ?? (page ? await collectFontStackReport(page) : null);
  if (pageReport?.violations?.length) {
    violations.push(...pageReport.violations);
  }

  if (root && violations.length < MAX_FONT_STACK_FINDINGS) {
    const repoReport = metrics?.fontStackRepoReport ?? scanRepoFontStack(root);
    if (!repoReport?.skipped && Array.isArray(repoReport?.violations)) {
      for (const v of repoReport.violations) {
        violations.push(v);
        if (violations.length >= MAX_FONT_STACK_FINDINGS) break;
      }
    }
  }

  if (!violations.length) return [];

  return findingsFromFontStackReport(
    { violations: violations.slice(0, MAX_FONT_STACK_FINDINGS) },
    url || metrics?.url || '',
  );
}
