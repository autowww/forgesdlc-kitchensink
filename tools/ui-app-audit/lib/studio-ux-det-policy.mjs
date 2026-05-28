/**
 * UX DET policy for sealed Studio / app-shell scenario audits.
 * Excludes handbook-oriented rules that dominate Major+ on operator UIs.
 */

/** @type {readonly string[]} */
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

/**
 * @param {string} siteKind
 * @returns {{ excludeDeterministicRuleIds: string[] }}
 */
export function studioUxDetRuntimeOpts(siteKind) {
  if (siteKind === 'a11y-studio' || siteKind === 'app-shell') {
    return { excludeDeterministicRuleIds: [...A11Y_STUDIO_UX_DET_EXCLUDED] };
  }
  return { excludeDeterministicRuleIds: [] };
}
