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
import { runReactKsAttrsFixer } from './react-ks-attrs-fixer.mjs';

/** @type {Record<string, (ctx: object) => Promise<{ applied: boolean, filesTouched?: number, adapter?: string, error?: string }>>} */
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
  'DET.PY.KS_HASH_ATTRS': runRepoProductionFixer,
  'DET.PY.OPTIONAL_REGIONS': runRepoProductionFixer,
  'DET.SCREENSHOT.STATUS': runRepoProductionFixer,
  'DET.HASH.REGISTRY_ROW': runRepoProductionFixer,
  'DET.DIAGRAM.ASSET_REGISTRY': runRepoProductionFixer,
  'DET.CATALOG.CONTRACT_SPECIFICITY': runRepoProductionFixer,
  'DET.REACT.KS_ATTRS': runReactKsAttrsFixer,
  'DET.REACT.A11Y_ROLE': patchLandmarksRequired,
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
};

/**
 * @param {string} ruleId
 * @param {object} ctx
 */
export async function runProductionFixerForRule(ruleId, ctx) {
  const fn = PRODUCTION_FIXER_BY_RULE[ruleId];
  if (!fn) {
    return { applied: false, error: `no production fixer for ${ruleId}` };
  }
  return fn({ ...ctx, ruleId });
}

export function listProductionFixerRuleIds() {
  return Object.keys(PRODUCTION_FIXER_BY_RULE).sort();
}
