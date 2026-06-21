export { CONFIDENCE_HIGH, CONFIDENCE_MEDIUM, CONFIDENCE_LOW, shouldRefusePatch, labelConfidence } from './confidence.mjs';
export { buildPlanOnlyResult } from './plan-only.mjs';
export { locateSourceCandidates, locateCssCandidates, locateViteEntry } from './source-locator.mjs';
export {
  patchJsxForRule,
  patchJsxRootAttrs,
  patchDemoDisclosureJsx,
  patchPrimaryCtaJsx,
  patchPrimaryStateJsx,
  patchTabPanelJsx,
  patchTileAffordanceJsx,
} from './jsx-patcher.mjs';
export {
  patchFontStackRule,
  ensureCssImportInTs,
  ensureCssLinkInHtml,
  patchResponsiveOverflow,
  patchPrimitiveStylesHtml,
} from './css-patcher.mjs';
