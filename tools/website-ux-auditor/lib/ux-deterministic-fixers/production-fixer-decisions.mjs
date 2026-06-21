/**
 * Intentional production fixer decisions for every DET rule.
 * Used by generate-pilot-registry.mjs and patch-registry.mjs.
 *
 * @typedef {{
 *   fixerId: string,
 *   productionHandler?: string,
 *   verifyMode?: string,
 *   harnessModes?: string[],
 *   planOnly?: boolean,
 *   planOnlyReason?: string,
 *   verifyAuditHint?: string,
 * }} FixerDecision
 */

/** @type {Record<string, FixerDecision>} */
export const FIXER_DECISIONS = {
  // --- App / Vite React (auto when sources or HTML are reliable) ---
  'DET.APP.DEMO_DISCLOSURE': {
    fixerId: 'handbook_after',
    productionHandler: 'app_vite_react',
    verifyMode: 'expect_rule_clean',
    harnessModes: ['standalone', 'live_scenario'],
  },
  'DET.APP.PRIMARY_CTA': {
    fixerId: 'handbook_after',
    productionHandler: 'app_vite_react',
    verifyMode: 'expect_rule_clean',
    harnessModes: ['standalone', 'live_scenario'],
  },
  'DET.APP.PRIMARY_STATE': {
    fixerId: 'handbook_after',
    productionHandler: 'app_vite_react',
    verifyMode: 'expect_rule_clean',
    harnessModes: ['standalone', 'live_scenario'],
  },
  'DET.APP.TAB_PANEL': {
    fixerId: 'handbook_after',
    productionHandler: 'app_vite_react',
    verifyMode: 'expect_rule_clean',
    harnessModes: ['standalone', 'live_scenario'],
  },
  'DET.APP.TILE_AFFORDANCE': {
    fixerId: 'handbook_after',
    productionHandler: 'app_vite_react',
    verifyMode: 'expect_rule_clean',
    harnessModes: ['standalone', 'live_scenario'],
  },
  'DET.APP.PRIMITIVE_STYLES': {
    fixerId: 'handbook_after',
    productionHandler: 'app_vite_react',
    verifyMode: 'expect_rule_clean',
    harnessModes: ['standalone', 'live_scenario'],
  },
  'DET.APP.SHELL_INTEGRATION': {
    fixerId: 'handbook_after',
    productionHandler: 'app_vite_react',
    verifyMode: 'expect_rule_clean',
    harnessModes: ['standalone', 'live_scenario'],
  },
  'DET.APP.PRIMITIVE_SOURCE': {
    fixerId: 'app_primitive_source',
    productionHandler: 'app_primitive_source',
    verifyMode: 'expect_rule_clean',
    harnessModes: ['repo_overlay', 'live_scenario'],
  },
  'DET.APP.PRIMITIVE_MARKERS': {
    fixerId: 'handbook_after',
    productionHandler: 'app_primitive_markers',
    verifyMode: 'expect_rule_clean',
    harnessModes: ['standalone', 'live_scenario'],
  },
  'DET.APP.CONTROL_A11Y': {
    fixerId: 'handbook_after',
    productionHandler: 'app_control_a11y',
    verifyMode: 'live_scenario',
    harnessModes: ['standalone', 'live_scenario'],
  },
  'DET.APP.FOCUS_TRAP': {
    fixerId: 'handbook_after',
    productionHandler: 'patch_app_focus_trap',
    verifyMode: 'expect_rule_clean',
    harnessModes: ['standalone', 'live_scenario'],
  },
  'DET.APP.PERSISTENT_CHROME': {
    fixerId: 'handbook_after',
    productionHandler: 'nav_breadcrumb',
    verifyMode: 'expect_rule_clean',
    harnessModes: ['multi_page', 'live_scenario'],
  },

  // --- Prompt 03 app rules (scenario / live — plan_only) ---
  'DET.APP.ROUTE_DEEPLINK_STATE': {
    fixerId: 'plan_only',
    planOnly: true,
    planOnlyReason: 'Route/deep-link state requires live navigation replay — patch routing in app source manually',
    verifyMode: 'live_scenario',
    harnessModes: ['live_scenario'],
  },
  'DET.APP.ERROR_BOUNDARY_RECOVERY': {
    fixerId: 'plan_only',
    planOnly: true,
    planOnlyReason: 'Error boundary recovery needs React error boundary component — unsafe to scaffold automatically',
    verifyMode: 'live_scenario',
    harnessModes: ['live_scenario'],
  },
  'DET.APP.EMPTY_LOADING_ERROR_SUCCESS': {
    fixerId: 'plan_only',
    planOnly: true,
    planOnlyReason: 'Workspace state panels need product-specific copy and wiring',
    verifyMode: 'live_scenario',
    harnessModes: ['live_scenario'],
  },
  'DET.APP.DISABLED_REASON': {
    fixerId: 'plan_only',
    planOnly: true,
    planOnlyReason: 'Disabled control reasons are context-specific — add visible precondition text in source',
    verifyMode: 'live_scenario',
    harnessModes: ['live_scenario'],
  },
  'DET.APP.TOAST_LIFECYCLE': {
    fixerId: 'plan_only',
    planOnly: true,
    planOnlyReason: 'Toast lifecycle touches live regions and dismiss handlers — patch in react notification primitive',
    verifyMode: 'live_scenario',
    harnessModes: ['live_scenario'],
  },
  'DET.APP.MODAL_DISMISSAL_GUARD': {
    fixerId: 'plan_only',
    planOnly: true,
    planOnlyReason: 'Modal dismissal guards need workflow-aware unsaved-change logic',
    verifyMode: 'live_scenario',
    harnessModes: ['live_scenario'],
  },
  'DET.APP.WIZARD_PROGRESS_CONTROLS': {
    fixerId: 'plan_only',
    planOnly: true,
    planOnlyReason: 'Wizard step controls require step state machine edits',
    verifyMode: 'live_scenario',
    harnessModes: ['live_scenario'],
  },
  'DET.APP.BULK_ACTION_SCOPE': {
    fixerId: 'plan_only',
    planOnly: true,
    planOnlyReason: 'Bulk action scope labels depend on selection model',
    verifyMode: 'live_scenario',
    harnessModes: ['live_scenario'],
  },
  'DET.APP.DATA_REFRESH_STALENESS': {
    fixerId: 'plan_only',
    planOnly: true,
    planOnlyReason: 'Data freshness UI is product-specific — add last-updated and refresh affordance manually',
    verifyMode: 'live_scenario',
    harnessModes: ['live_scenario'],
  },
  'DET.APP.CLIENT_ERROR_LOG_CLEAN': {
    fixerId: 'plan_only',
    planOnly: true,
    planOnlyReason: 'Console errors after scenario steps need runtime debugging — not safe for static patchers',
    verifyMode: 'live_scenario',
    verifyAuditHint: 'scenario-audit-data.json',
    harnessModes: ['live_scenario'],
  },

  // --- Prompt 04 KS governance (plan_only) ---
  'DET.KS.PRIMITIVE_VERSION_MATCH': {
    fixerId: 'plan_only',
    planOnly: true,
    planOnlyReason: 'Primitive version drift must align registry, contracts, and runtime bundle — manual governance',
    verifyMode: 'expect_rule_clean',
    harnessModes: ['repo_overlay'],
  },
  'DET.KS.CONSUMER_ASSET_BUNDLE': {
    fixerId: 'plan_only',
    planOnly: true,
    planOnlyReason: 'Consumer asset bundle integrity requires build pipeline and Vite config review',
    verifyMode: 'live_scenario',
    harnessModes: ['live_scenario'],
  },
  'DET.KS.HASH_SEMANTIC_UNIQUENESS': {
    fixerId: 'plan_only',
    planOnly: true,
    planOnlyReason: 'Hash semantic collisions need catalog/registry deduplication',
    verifyMode: 'expect_rule_clean',
    harnessModes: ['repo_overlay'],
  },
  'DET.KS.CONTRACT_EXAMPLE_SYNC': {
    fixerId: 'plan_only',
    planOnly: true,
    planOnlyReason: 'Contract example sync spans fixtures, rule pages, and contracts — use agent with hash context',
    verifyMode: 'expect_rule_clean',
    harnessModes: ['repo_overlay'],
  },
  'DET.KS.CSS_SCOPE_LEAK': {
    fixerId: 'plan_only',
    planOnly: true,
    planOnlyReason: 'CSS scope leaks need theme scoping under :where([data-ks-hash]) — broad auto-patch is destructive',
    verifyMode: 'live_scenario',
    harnessModes: ['live_scenario'],
  },
  'DET.KS.VISUAL_FAMILY_COVERAGE': {
    fixerId: 'plan_only',
    planOnly: true,
    planOnlyReason: 'Visual family coverage requires registry row and contract authoring',
    verifyMode: 'expect_rule_clean',
    harnessModes: ['repo_overlay'],
  },

  // --- Prompt 05 generic website rules ---
  'DET.ROUTE.HTTP_STATUS_CANONICAL': {
    fixerId: 'plan_only',
    planOnly: true,
    planOnlyReason: 'Crawl-level route defects need redirect/canonical fixes per URL — not a single HTML patch',
    verifyMode: 'count_only',
    harnessModes: ['multi_page'],
  },
  'DET.ROUTE.CONTENT_UNIQUENESS': {
    fixerId: 'plan_only',
    planOnly: true,
    planOnlyReason: 'Duplicate titles/H1 across routes need per-page content edits',
    verifyMode: 'count_only',
    harnessModes: ['multi_page'],
  },
  'DET.RESPONSIVE.NO_HORIZONTAL_OVERFLOW': {
    fixerId: 'handbook_after',
    productionHandler: 'app_vite_react',
    verifyMode: 'live_scenario',
    harnessModes: ['standalone', 'live_scenario'],
  },
  'DET.MOBILE.NAV_DISCLOSURE': {
    fixerId: 'plan_only',
    planOnly: true,
    planOnlyReason: 'Mobile nav offcanvas behavior needs JS focus trap and ARIA — manual component fix',
    verifyMode: 'live_scenario',
    harnessModes: ['live_scenario'],
  },
  'DET.FORM.LABEL_ERROR_SUMMARY': {
    fixerId: 'plan_only',
    planOnly: true,
    planOnlyReason: 'Form labels and error summary need field-specific ids and copy',
    verifyMode: 'expect_rule_clean',
    harnessModes: ['standalone'],
  },
  'DET.SEARCH.FILTER_STATE': {
    fixerId: 'plan_only',
    planOnly: true,
    planOnlyReason: 'Search/filter UI state is page-specific',
    verifyMode: 'expect_rule_clean',
    harnessModes: ['standalone'],
  },
  'DET.TABLE.RESPONSIVE_CONTROLS': {
    fixerId: 'plan_only',
    planOnly: true,
    planOnlyReason: 'Dense table responsive controls need layout and pagination wiring',
    verifyMode: 'expect_rule_clean',
    harnessModes: ['standalone'],
  },
  'DET.LOADING.EMPTY_ERROR_STATES': {
    fixerId: 'plan_only',
    planOnly: true,
    planOnlyReason: 'Loading/empty/error states need product copy and mutual exclusion in components',
    verifyMode: 'expect_rule_clean',
    harnessModes: ['standalone'],
  },
  'DET.STATUS.FEEDBACK_REGION': {
    fixerId: 'plan_only',
    planOnly: true,
    planOnlyReason: 'Status feedback regions need aria-live wiring on action handlers',
    verifyMode: 'live_scenario',
    harnessModes: ['live_scenario'],
  },
  'DET.METADATA.SOCIAL_PREVIEW': {
    fixerId: 'plan_only',
    planOnly: true,
    planOnlyReason: 'Social preview metadata is page-specific — extend page meta patcher per route',
    verifyMode: 'expect_rule_clean',
    harnessModes: ['standalone'],
  },
  'DET.EXTERNAL_LINK.SAFETY': {
    fixerId: 'plan_only',
    planOnly: true,
    planOnlyReason: 'External link rel=noopener patches need per-link review (partial auto-patch deferred)',
    verifyMode: 'expect_rule_clean',
    harnessModes: ['standalone'],
  },
  'DET.MEDIA.ASPECT_RATIO': {
    fixerId: 'plan_only',
    planOnly: true,
    planOnlyReason: 'Media aspect-ratio needs width/height on each asset',
    verifyMode: 'expect_rule_clean',
    harnessModes: ['standalone'],
  },

  // --- Theme font stack: repo overlay + vite css ---
  'DET.THEME.FONT_STACK': {
    fixerId: 'repo_overlay',
    productionHandler: 'app_vite_react',
    verifyMode: 'expect_rule_clean',
    harnessModes: ['repo_overlay', 'live_scenario'],
  },
};

/** Rules excluded from pilot registry (not yet blended or intentionally skipped). */
export const PILOT_EXCLUDED = new Set([
  /* none — all implemented registry rules participate */
]);

/**
 * @param {string} ruleId
 */
export function getFixerDecision(ruleId) {
  return FIXER_DECISIONS[ruleId] || null;
}

/**
 * Default decision for registry rules without explicit entry.
 * @param {string} ruleId
 */
export function defaultFixerDecision(ruleId) {
  const repoOverlay = [
    'DET.CONTRACT.PATH',
    'DET.CONTRACT.PLACEHOLDERS',
    'DET.INVENTORY.CROSSWALK',
    'DET.TOKEN.NO_DRIFT',
    'DET.PY.KS_HASH_ATTRS',
    'DET.SCREENSHOT.STATUS',
  ];
  if (repoOverlay.includes(ruleId)) {
    return {
      fixerId: 'repo_overlay',
      verifyMode: 'expect_rule_clean',
      harnessModes: ['repo_overlay'],
    };
  }
  if (ruleId === 'DET.APP.PERSISTENT_CHROME') {
    return {
      fixerId: 'handbook_after',
      verifyMode: 'expect_rule_clean',
      harnessModes: ['multi_page'],
    };
  }
  return {
    fixerId: 'handbook_after',
    verifyMode: 'expect_rule_clean',
    harnessModes: ['standalone'],
  };
}

/**
 * @param {string} ruleId
 */
export function resolveFixerDecision(ruleId) {
  return FIXER_DECISIONS[ruleId] || defaultFixerDecision(ruleId);
}

/**
 * @param {string[]} registryRuleIds
 */
export function validateFixerDecisions(registryRuleIds) {
  /** @type {string[]} */
  const missing = [];
  for (const id of registryRuleIds) {
    if (PILOT_EXCLUDED.has(id)) continue;
    const explicit = FIXER_DECISIONS[id];
    const fallback = defaultFixerDecision(id);
    if (!explicit && !fallback) missing.push(id);
  }
  return { ok: missing.length === 0, missing };
}
