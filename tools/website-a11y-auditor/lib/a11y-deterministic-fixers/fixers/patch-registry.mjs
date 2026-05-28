/**
 * Per-rule production fixers for DET.A11Y.* (reuses UX patch modules where safe).
 */
import {
  patchAmbientZIndex,
  patchAppFocusTrap,
  patchCtaHierarchy,
} from '../../../../website-ux-auditor/lib/ux-deterministic-fixers/fixers/patches/chrome-nav.mjs';
import {
  patchCtaLabelNonempty,
  patchDataTableHeaders,
  patchDiagramAlt,
  patchLandmarksRequired,
  patchMotionNoAutoplay,
  patchMotionReduced,
  patchNavInPageToc,
  patchSectionHeading,
} from '../../../../website-ux-auditor/lib/ux-deterministic-fixers/fixers/patches/dom-accessibility.mjs';
import {
  patchPageLang,
  patchPageMode,
  patchPageViewport,
} from '../../../../website-ux-auditor/lib/ux-deterministic-fixers/fixers/patches/page-meta.mjs';
import { runHashMarkersFixer } from '../../../../website-ux-auditor/lib/ux-deterministic-fixers/fixers/hash-markers.mjs';
import { runNavBreadcrumbFixer } from '../../../../website-ux-auditor/lib/ux-deterministic-fixers/fixers/nav-breadcrumb.mjs';
import { runPageTitleFixer } from '../../../../website-ux-auditor/lib/ux-deterministic-fixers/fixers/page-title.mjs';
import { runRepoProductionFixer } from '../../../../website-ux-auditor/lib/ux-deterministic-fixers/fixers/repo-production.mjs';
import {
  patchAccessibleAuth,
  patchConcurrentInput,
  patchDraggingMovements,
  patchErrorPrevention,
  patchGlossaryAbbr,
  patchReadingLevel,
  patchRedundantEntry,
  patchReAuthentication,
} from '../../../../website-ux-auditor/lib/ux-deterministic-fixers/fixers/patches/a11y-supplemental.mjs';
import { runRemediationNoteFixer } from '../../a11y-ai-fixers/fixers/remediation-note.mjs';

/** @type {Record<string, string>} */
export const FIXER_ID_BY_RULE = {
  'DET.A11Y.GENERIC.LANG': 'patch_page_lang',
  'DET.A11Y.GENERIC.TITLE': 'patch_page_title',
  'DET.A11Y.GENERIC.VIEWPORT': 'patch_page_viewport',
  'DET.A11Y.GENERIC.LANDMARKS': 'patch_landmarks',
  'DET.A11Y.GENERIC.IMAGES_ALT': 'patch_diagram_alt',
  'DET.A11Y.GENERIC.DIAGRAM_ALT': 'patch_diagram_alt',
  'DET.A11Y.GENERIC.DATA_TABLE_HEADERS': 'patch_data_table',
  'DET.A11Y.GENERIC.MOTION_REDUCED': 'patch_motion_reduced',
  'DET.A11Y.GENERIC.MOTION_FLASH': 'patch_motion_flash',
  'DET.A11Y.GENERIC.APP_FOCUS_TRAP': 'patch_app_focus_trap',
  'DET.A11Y.GENERIC.SECTION_HEADINGS': 'patch_section_heading',
  'DET.A11Y.GENERIC.ORIENTATION': 'patch_page_viewport',
  'DET.A11Y.GENERIC.RESIZE_TEXT': 'patch_page_viewport',
  'DET.A11Y.GENERIC.TEXT_SPACING': 'patch_page_mode',
  'DET.A11Y.GENERIC.HOVER_FOCUS_CONTENT': 'patch_ambient_z',
  'DET.A11Y.GENERIC.LABEL_IN_NAME': 'patch_cta_label',
  'DET.A11Y.GENERIC.LABELS_INSTRUCTIONS': 'patch_cta_label',
  'DET.A11Y.GENERIC.LINK_PURPOSE': 'patch_cta_label',
  'DET.A11Y.GENERIC.STATUS_MESSAGES': 'patch_section_heading',
  'DET.A11Y.GENERIC.PAGE_LOCATION': 'patch_nav_toc',
  'DET.A11Y.GENERIC.NON_TEXT_CONTRAST': 'patch_page_mode',
  'DET.A11Y.KS.HASH_MARKERS': 'hash_markers',
  'DET.A11Y.KS.BREADCRUMB': 'nav_breadcrumb',
  'DET.A11Y.KS.REACT_A11Y_ROLE': 'patch_landmarks',
  'DET.A11Y.KS.PY_HASH_ATTRS': 'repo_production',
  'DET.A11Y.KS.HANDBOOK_SINGLE_H1': 'patch_section_heading',
  'DET.A11Y.GENERIC.CONTRAST': 'patch_page_mode',
  'DET.A11Y.GENERIC.CONTRAST_ENHANCED': 'patch_page_mode',
  'DET.A11Y.GENERIC.CONSISTENT_NAV': 'patch_nav_toc',
  'DET.A11Y.GENERIC.CONSISTENT_LABELS': 'patch_cta_label',
  'DET.A11Y.GENERIC.CONSISTENT_HELP': 'patch_nav_toc',
  'DET.A11Y.GENERIC.MULTIPLE_WAYS': 'patch_nav_toc',
  'DET.A11Y.GENERIC.FOCUS_ORDER': 'patch_landmarks',
  'DET.A11Y.GENERIC.FOCUS_CONTEXT_CHANGE': 'patch_app_focus_trap',
  'DET.A11Y.GENERIC.INPUT_CONTEXT_CHANGE': 'patch_app_focus_trap',
  'DET.A11Y.GENERIC.KEYBOARD_ACCESS': 'patch_landmarks',
  'DET.A11Y.GENERIC.READING_ORDER': 'patch_landmarks',
  'DET.A11Y.GENERIC.USE_OF_COLOR': 'patch_cta_label',
  'DET.A11Y.GENERIC.IMAGES_OF_TEXT': 'patch_diagram_alt',
  'DET.A11Y.GENERIC.MEDIA_TRACKS': 'patch_diagram_alt',
  'DET.A11Y.GENERIC.AUTOPLAY_AUDIO': 'patch_motion_flash',
  'DET.A11Y.GENERIC.FLASH_THRESHOLD': 'patch_motion_flash',
  'DET.A11Y.GENERIC.TIMING': 'patch_motion_reduced',
  'DET.A11Y.GENERIC.MOTION_ACTUATION': 'patch_motion_reduced',
  'DET.A11Y.GENERIC.FOCUS_NOT_OBSCURED': 'patch_ambient_z',
  'DET.A11Y.GENERIC.FOCUS_OBSCURED_ENHANCED': 'patch_ambient_z',
  'DET.A11Y.GENERIC.FOCUS_APPEARANCE': 'patch_page_mode',
  'DET.A11Y.GENERIC.TARGET_SIZE_MIN': 'patch_page_viewport',
  'DET.A11Y.GENERIC.INPUT_PURPOSE': 'patch_page_mode',
  'DET.A11Y.GENERIC.POINTER_GESTURES': 'patch_cta_label',
  'DET.A11Y.GENERIC.POINTER_CANCELLATION': 'patch_cta_label',
  'DET.A11Y.GENERIC.LOW_BACKGROUND_AUDIO': 'patch_motion_flash',
  'DET.A11Y.GENERIC.VISUAL_PRESENTATION_AAA': 'patch_page_mode',
  'DET.A11Y.GENERIC.SENSORY_CUES': 'patch_cta_label',
  'DET.A11Y.GENERIC.LANG_OF_PARTS': 'patch_page_lang',
  'DET.A11Y.GENERIC.PAUSE_STOP_HIDE': 'patch_motion_flash',
  'DET.A11Y.GENERIC.CHARACTER_SHORTCUTS': 'patch_page_mode',
  'DET.A11Y.GENERIC.CONTEXT_HELP': 'patch_nav_toc',
  'DET.A11Y.GENERIC.INTERRUPTIONS': 'patch_motion_reduced',
  'DET.A11Y.GENERIC.CHANGE_ON_REQUEST': 'patch_motion_reduced',
  'DET.A11Y.GENERIC.ACCESSIBLE_AUTHENTICATION': 'patch_accessible_auth',
  'DET.A11Y.GENERIC.CONCURRENT_INPUT': 'patch_concurrent_input',
  'DET.A11Y.GENERIC.DRAGGING_MOVEMENTS': 'patch_dragging_movements',
  'DET.A11Y.GENERIC.ERROR_PREVENTION': 'patch_error_prevention',
  'DET.A11Y.GENERIC.GLOSSARY_ABBR': 'patch_glossary_abbr',
  'DET.A11Y.GENERIC.RE_AUTHENTICATION': 'patch_re_authentication',
  'DET.A11Y.GENERIC.READING_LEVEL_HEURISTIC': 'patch_reading_level',
  'DET.A11Y.GENERIC.REDUNDANT_ENTRY': 'patch_redundant_entry',
};

/** @type {Record<string, (ctx: object) => Promise<{ applied: boolean, filesTouched?: number, error?: string }>>} */
export const A11Y_FIXER_BY_ID = {
  patch_page_lang: patchPageLang,
  patch_page_title: runPageTitleFixer,
  patch_page_viewport: patchPageViewport,
  patch_landmarks: patchLandmarksRequired,
  patch_diagram_alt: patchDiagramAlt,
  patch_data_table: patchDataTableHeaders,
  patch_motion_reduced: patchMotionReduced,
  patch_motion_flash: patchMotionNoAutoplay,
  patch_app_focus_trap: patchAppFocusTrap,
  patch_section_heading: patchSectionHeading,
  patch_page_mode: patchPageMode,
  patch_cta_label: patchCtaLabelNonempty,
  patch_cta_hierarchy: patchCtaHierarchy,
  patch_nav_toc: patchNavInPageToc,
  patch_ambient_z: patchAmbientZIndex,
  hash_markers: runHashMarkersFixer,
  nav_breadcrumb: runNavBreadcrumbFixer,
  repo_production: runRepoProductionFixer,
  remediation_note: runRemediationNoteFixer,
  patch_glossary_abbr: patchGlossaryAbbr,
  patch_error_prevention: patchErrorPrevention,
  patch_reading_level: patchReadingLevel,
  patch_dragging_movements: patchDraggingMovements,
  patch_redundant_entry: patchRedundantEntry,
  patch_accessible_auth: patchAccessibleAuth,
  patch_re_authentication: patchReAuthentication,
  patch_concurrent_input: patchConcurrentInput,
};

/**
 * @param {string} ruleId
 */
export function defaultFixerIdForRule(ruleId) {
  return FIXER_ID_BY_RULE[ruleId] || 'handbook_after';
}
