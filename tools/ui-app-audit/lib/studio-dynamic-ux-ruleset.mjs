/**
 * Explicit allowlist for sealed Studio / dynamic app UX DET rules.
 * Replaces handbook denylist-only policy with DOM-focused rules for operator UIs.
 */

/** Handbook-oriented rules excluded from Studio dynamic UX. */
export const A11Y_STUDIO_UX_DET_EXCLUDED = [
  'DET.CONTEXT.BURDEN',
  'DET.THEME.CONTRAST_MIN',
  'DET.JS.PROGRESSIVE',
  'DET.JS.NO_CONSOLE_ERROR',
  'DET.SECTION.SINGLE_JOB',
  'DET.PROSE.LENGTH',
  'DET.VISUAL.RHYTHM',
  'DET.SURFACE.ELEVATION_TOKEN',
];

/** @type {readonly string[]} */
export const STUDIO_DYNAMIC_UX_RUN = [
  'DET.AMBIENT.Z_INDEX',
  'DET.APP.BULK_ACTION_SCOPE',
  'DET.APP.CLIENT_ERROR_LOG_CLEAN',
  'DET.APP.DATA_REFRESH_STALENESS',
  'DET.APP.DEMO_DISCLOSURE',
  'DET.APP.DISABLED_REASON',
  'DET.APP.EMPTY_LOADING_ERROR_SUCCESS',
  'DET.APP.ERROR_BOUNDARY_RECOVERY',
  'DET.APP.FOCUS_TRAP',
  'DET.APP.MODAL_DISMISSAL_GUARD',
  'DET.APP.PERSISTENT_CHROME',
  'DET.APP.PRIMARY_CTA',
  'DET.APP.PRIMARY_STATE',
  'DET.APP.PRIMITIVE_STYLES',
  'DET.APP.ROUTE_DEEPLINK_STATE',
  'DET.APP.SHELL_INTEGRATION',
  'DET.APP.TAB_PANEL',
  'DET.APP.TILE_AFFORDANCE',
  'DET.APP.TOAST_LIFECYCLE',
  'DET.APP.WIZARD_PROGRESS_CONTROLS',
  'DET.BUTTON.GROUP.MAX',
  'DET.CARD.ACTION_LIMIT',
  'DET.CARD.TITLE',
  'DET.CHART.ALT_SUMMARY',
  'DET.CHROME.BOUNDARY',
  'DET.CTA.HIERARCHY',
  'DET.CTA.LABEL_NONEMPTY',
  'DET.DATA.COLOR_ONLY',
  'DET.DATA.TABLE_HEADERS',
  'DET.DIAGRAM.ALT',
  'DET.DIAGRAM.LABELS',
  'DET.HTML.EMPTY_INLINE',
  'DET.LANDMARKS.REQUIRED',
  'DET.LAYOUT.GRID_CONSISTENCY',
  'DET.MOTION.NO_AUTO_PLAY_FLASH',
  'DET.MOTION.PREFERS_REDUCED',
  'DET.NAV.BREADCRUMB',
  'DET.NAV.DEDUP',
  'DET.NAV.FOCUS_ORDER',
  'DET.PAGE.LANG',
  'DET.PAGE.MODE',
  'DET.PAGE.TITLE',
  'DET.PAGE.VIEWPORT',
  'DET.SECTION.HEADING',
];

const PRIMITIVE_ROOT_PROBE =
  '[data-ks-react-root="true"], [data-ks-type="react-primitive"][data-ks-hash]';

/**
 * @param {import('playwright').Page} page
 * @returns {Promise<boolean>}
 */
export async function pageHasReactPrimitiveRoots(page) {
  if (!page) return false;
  return page.evaluate((selector) => {
    const nodes = document.querySelectorAll(selector);
    for (const el of nodes) {
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') continue;
      const rect = el.getBoundingClientRect();
      if (rect.width > 1 && rect.height > 1) return true;
    }
    return false;
  }, PRIMITIVE_ROOT_PROBE);
}

/**
 * Gated by `includePrimitives` (pages with `data-ks-react-root` should pass true).
 * @type {readonly string[]}
 */
export const STUDIO_DYNAMIC_UX_PRIMITIVE_RULES = [
  'DET.HASH.MARKERS',
  'DET.APP.PRIMITIVE_MARKERS',
  'DET.APP.CONTROL_A11Y',
];

/** Prefixes excluded from Studio dynamic UX (repo/generator/handbook). */
export const STUDIO_DYNAMIC_UX_SKIP_PREFIXES = [
  'DET.CATALOG.',
  'DET.CONTRACT.',
  'DET.INVENTORY.',
  'DET.PY.',
];

/** @type {readonly string[]} */
export const STUDIO_DYNAMIC_UX_SKIP_EXACT = [
  'DET.HASH.REGISTRY_ROW',
  'DET.DIAGRAM.ASSET_REGISTRY',
  'DET.NAV.DEPTH',
  'DET.NAV.IN_PAGE_TOC',
  'DET.SCREENSHOT.STATUS',
  'DET.TOKEN.NO_DRIFT',
  'DET.THEME.FONT_STACK',
  'DET.APP.PRIMITIVE_SOURCE',
  ...A11Y_STUDIO_UX_DET_EXCLUDED,
];

/**
 * @param {string} ruleId
 * @returns {boolean}
 */
export function isStudioDynamicUxRuleId(ruleId) {
  const id = String(ruleId || '').trim();
  if (!id.startsWith('DET.')) return false;
  if (A11Y_STUDIO_UX_DET_EXCLUDED.includes(id)) return false;
  if (STUDIO_DYNAMIC_UX_SKIP_EXACT.includes(id)) return false;
  if (STUDIO_DYNAMIC_UX_SKIP_PREFIXES.some((p) => id.startsWith(p))) return false;
  if (STUDIO_DYNAMIC_UX_RUN.includes(id)) return true;
  if (STUDIO_DYNAMIC_UX_PRIMITIVE_RULES.includes(id)) return true;
  return false;
}

/**
 * @param {{ deterministicRules?: Array<{ id: string, status?: string }> }} registry
 * @param {{ includePrimitives?: boolean }} [opts]
 * @returns {string[]}
 */
export function resolveStudioDynamicUxRuleIds(registry, opts = {}) {
  const includePrimitives = opts.includePrimitives === true;
  const allowed = new Set([
    ...STUDIO_DYNAMIC_UX_RUN,
    ...(includePrimitives ? STUDIO_DYNAMIC_UX_PRIMITIVE_RULES : []),
  ]);
  const implemented = new Set(
    (registry?.deterministicRules || [])
      .filter((r) => r.status === 'implemented' && r.modulePath)
      .map((r) => r.id),
  );
  return [...allowed].filter((id) => implemented.has(id) && isStudioDynamicUxRuleId(id)).sort();
}
