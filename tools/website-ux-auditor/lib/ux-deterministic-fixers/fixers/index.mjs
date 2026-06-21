import { runHandbookAfterFixer } from '../handbook-after.mjs';
import { runRepoOverlayFixer } from '../repo-overlay.mjs';
import { runHashMarkersFixer } from './hash-markers.mjs';
import { runHtmlEmptyInlineFixer } from './html-empty-inline.mjs';
import { runLayoutGridConsistencyFixer } from './layout-grid-consistency.mjs';
import { runNavBreadcrumbFixer } from './nav-breadcrumb.mjs';
import { runPageTitleFixer } from './page-title.mjs';
import { runHandbookHtmlPatchFixer } from './handbook-html-patch.mjs';
import { runRepoProductionFixer } from './repo-production.mjs';
import { runAppPrimitiveSourceFixer } from './app-primitive-source-fixer.mjs';
import { runPlanOnlyDeterministicFixer } from './plan-only-fixer.mjs';

/**
 * @param {string} fixerId
 * @param {object} ctx
 */
export async function runFixerById(fixerId, ctx) {
  switch (fixerId) {
    case 'handbook_after':
      return runHandbookAfterFixer(ctx);
    case 'repo_overlay':
      return runRepoOverlayFixer(ctx);
    case 'repo_production':
      return runRepoProductionFixer(ctx);
    case 'hash_markers':
      return runHashMarkersFixer(ctx);
    case 'page_title':
      return runPageTitleFixer(ctx);
    case 'nav_breadcrumb':
      return runNavBreadcrumbFixer(ctx);
    case 'html_empty_inline':
      return runHtmlEmptyInlineFixer(ctx);
    case 'layout_grid_consistency':
      return runLayoutGridConsistencyFixer(ctx);
    case 'handbook_html_patch':
      return runHandbookHtmlPatchFixer(ctx);
    case 'plan_only':
      return runPlanOnlyDeterministicFixer(ctx);
    case 'app_primitive_source':
      return runAppPrimitiveSourceFixer(ctx);
    default:
      return { applied: false, error: `unknown fixerId: ${fixerId}` };
  }
}
