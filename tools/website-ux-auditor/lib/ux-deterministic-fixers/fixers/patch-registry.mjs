import {
  patchAmbientZIndex,
  patchAppFocusTrap,
  patchButtonGroupMax,
  patchChromeBoundary,
  patchCtaHierarchy,
  patchNavDedup,
} from './patches/chrome-nav.mjs';
import {
  patchCardTitle,
  patchCtaLabelNonempty,
  patchDataTableHeaders,
  patchDiagramAlt,
  patchLandmarksRequired,
  patchMotionNoAutoplay,
  patchMotionReduced,
  patchNavInPageToc,
  patchSectionHeading,
} from './patches/dom-accessibility.mjs';
import { patchPageLang, patchPageMode, patchPageViewport } from './patches/page-meta.mjs';
import { runHashMarkersFixer } from './hash-markers.mjs';
import { runHtmlEmptyInlineFixer } from './html-empty-inline.mjs';
import { runLayoutGridConsistencyFixer } from './layout-grid-consistency.mjs';
import { runNavBreadcrumbFixer } from './nav-breadcrumb.mjs';
import { runPageTitleFixer } from './page-title.mjs';
import { runRepoProductionFixer } from './repo-production.mjs';
import { runAppPrimitiveMarkersFixer } from './app-primitive-markers-fixer.mjs';
import { runAppControlA11yFixer } from './app-control-a11y-fixer.mjs';
import { runAppViteReactFixer } from './app-vite-react-fixer.mjs';
import { runAppPrimitiveSourceFixer } from './app-primitive-source-fixer.mjs';
import { runPlanOnlyDeterministicFixer } from './plan-only-fixer.mjs';
import { getFixerDecision, FIXER_DECISIONS } from '../production-fixer-decisions.mjs';

/** @type {Record<string, (ctx: object) => Promise<object>>} */
const HANDLERS = {
  app_vite_react: runAppViteReactFixer,
  app_primitive_source: runAppPrimitiveSourceFixer,
  app_primitive_markers: runAppPrimitiveMarkersFixer,
  app_control_a11y: runAppControlA11yFixer,
  repo_production: runRepoProductionFixer,
  plan_only: runPlanOnlyDeterministicFixer,
  patch_app_focus_trap: patchAppFocusTrap,
  nav_breadcrumb: runNavBreadcrumbFixer,
  hash_markers: runHashMarkersFixer,
  page_title: runPageTitleFixer,
  html_empty_inline: runHtmlEmptyInlineFixer,
  layout_grid: runLayoutGridConsistencyFixer,
  patch_page_lang: patchPageLang,
  patch_page_viewport: patchPageViewport,
  patch_page_mode: patchPageMode,
  patch_nav_in_page_toc: patchNavInPageToc,
  patch_landmarks: patchLandmarksRequired,
  patch_diagram_alt: patchDiagramAlt,
  patch_cta_label: patchCtaLabelNonempty,
  patch_cta_hierarchy: patchCtaHierarchy,
  patch_card_title: patchCardTitle,
  patch_section_heading: patchSectionHeading,
  patch_chrome_boundary: patchChromeBoundary,
  patch_button_group: patchButtonGroupMax,
  patch_ambient_z: patchAmbientZIndex,
  patch_motion_reduced: patchMotionReduced,
  patch_motion_no_autoplay: patchMotionNoAutoplay,
  patch_nav_dedup: patchNavDedup,
};

/** @type {Record<string, (ctx: object) => Promise<object>>} */
export const PRODUCTION_FIXER_BY_RULE = {
  'DET.HASH.MARKERS': runHashMarkersFixer,
  'DET.PAGE.TITLE': runPageTitleFixer,
  'DET.PAGE.LANG': patchPageLang,
  'DET.PAGE.VIEWPORT': patchPageViewport,
  'DET.PAGE.MODE': patchPageMode,
  'DET.NAV.BREADCRUMB': runNavBreadcrumbFixer,
  'DET.NAV.IN_PAGE_TOC': patchNavInPageToc,
  'DET.HTML.EMPTY_INLINE': runHtmlEmptyInlineFixer,
  'DET.LAYOUT.GRID_CONSISTENCY': runLayoutGridConsistencyFixer,
  'DET.LANDMARKS.REQUIRED': patchLandmarksRequired,
  'DET.DIAGRAM.ALT': patchDiagramAlt,
  'DET.CHART.ALT_SUMMARY': patchDiagramAlt,
  'DET.DIAGRAM.LABELS': patchDiagramAlt,
  'DET.DATA.TABLE_HEADERS': patchDataTableHeaders,
  'DET.DATA.COLOR_ONLY': patchDataTableHeaders,
  'DET.CTA.LABEL_NONEMPTY': patchCtaLabelNonempty,
  'DET.CTA.HIERARCHY': patchCtaHierarchy,
  'DET.CARD.TITLE': patchCardTitle,
  'DET.CARD.ACTION_LIMIT': patchCtaLabelNonempty,
  'DET.SECTION.HEADING': patchSectionHeading,
  'DET.SECTION.SINGLE_JOB': patchSectionHeading,
  'DET.CHROME.BOUNDARY': patchChromeBoundary,
  'DET.BUTTON.GROUP.MAX': patchButtonGroupMax,
  'DET.AMBIENT.Z_INDEX': patchAmbientZIndex,
  'DET.APP.FOCUS_TRAP': patchAppFocusTrap,
  'DET.MOTION.PREFERS_REDUCED': patchMotionReduced,
  'DET.MOTION.NO_AUTO_PLAY_FLASH': patchMotionNoAutoplay,
  'DET.CONTRACT.PATH': runRepoProductionFixer,
  'DET.CONTRACT.PLACEHOLDERS': runRepoProductionFixer,
  'DET.INVENTORY.CROSSWALK': runRepoProductionFixer,
  'DET.TOKEN.NO_DRIFT': runRepoProductionFixer,
  'DET.THEME.FONT_STACK': runAppViteReactFixer,
  'DET.PY.KS_HASH_ATTRS': runRepoProductionFixer,
  'DET.PY.OPTIONAL_REGIONS': runRepoProductionFixer,
  'DET.SCREENSHOT.STATUS': runRepoProductionFixer,
  'DET.HASH.REGISTRY_ROW': runRepoProductionFixer,
  'DET.DIAGRAM.ASSET_REGISTRY': runRepoProductionFixer,
  'DET.CATALOG.CONTRACT_SPECIFICITY': runRepoProductionFixer,
  'DET.APP.PRIMITIVE_MARKERS': runAppPrimitiveMarkersFixer,
  'DET.APP.PRIMITIVE_SOURCE': runAppPrimitiveSourceFixer,
  'DET.APP.CONTROL_A11Y': runAppControlA11yFixer,
  'DET.SURFACE.ELEVATION_TOKEN': patchAmbientZIndex,
  'DET.VISUAL.RHYTHM': runLayoutGridConsistencyFixer,
  'DET.CONTEXT.BURDEN': patchSectionHeading,
  'DET.PROSE.LENGTH': runLayoutGridConsistencyFixer,
  'DET.THEME.CONTRAST_MIN': patchPageMode,
  'DET.JS.PROGRESSIVE': patchPageMode,
  'DET.JS.NO_CONSOLE_ERROR': patchPageMode,
  'DET.NAV.DEDUP': patchNavDedup,
  'DET.NAV.DEPTH': runNavBreadcrumbFixer,
  'DET.NAV.FOCUS_ORDER': runNavBreadcrumbFixer,
  'DET.APP.PERSISTENT_CHROME': runNavBreadcrumbFixer,
  // App Vite/React-aware production fixers
  'DET.APP.DEMO_DISCLOSURE': runAppViteReactFixer,
  'DET.APP.PRIMARY_CTA': runAppViteReactFixer,
  'DET.APP.PRIMARY_STATE': runAppViteReactFixer,
  'DET.APP.PRIMITIVE_STYLES': runAppViteReactFixer,
  'DET.APP.SHELL_INTEGRATION': runAppViteReactFixer,
  'DET.APP.TAB_PANEL': runAppViteReactFixer,
  'DET.APP.TILE_AFFORDANCE': runAppViteReactFixer,
  'DET.RESPONSIVE.NO_HORIZONTAL_OVERFLOW': runAppViteReactFixer,
};

// Register plan_only and decision-driven handlers
for (const [ruleId, decision] of Object.entries(FIXER_DECISIONS)) {
  if (decision.planOnly) {
    PRODUCTION_FIXER_BY_RULE[ruleId] = runPlanOnlyDeterministicFixer;
  } else if (decision.productionHandler && HANDLERS[decision.productionHandler]) {
    PRODUCTION_FIXER_BY_RULE[ruleId] = HANDLERS[decision.productionHandler];
  }
}

/**
 * @param {string} ruleId
 * @param {object} ctx
 */
export async function runProductionFixerForRule(ruleId, ctx) {
  const decision = getFixerDecision(ruleId);
  let fn = PRODUCTION_FIXER_BY_RULE[ruleId];

  if (ruleId === 'DET.THEME.FONT_STACK') {
    const viteResult = await runAppViteReactFixer({ ...ctx, ruleId });
    if (viteResult.applied) return viteResult;
    return runRepoProductionFixer({ ...ctx, ruleId });
  }

  if (!fn) {
    if (decision?.planOnly) fn = runPlanOnlyDeterministicFixer;
    else return { applied: false, error: `no production fixer for ${ruleId}`, fallbackReason: 'unmapped rule' };
  }
  return fn({ ...ctx, ruleId });
}

export function listProductionFixerRuleIds() {
  return Object.keys(PRODUCTION_FIXER_BY_RULE).sort();
}
