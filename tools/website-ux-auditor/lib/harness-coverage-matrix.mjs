/**
 * Harness matrix validation — DET fixtures, AI prompts, fixer decisions, Studio allowlist.
 * Used by auditor-tests/ruleset-harness-coverage.test.js and release-pack summaries.
 */
import fs from 'node:fs';
import path from 'node:path';

import {
  resolveFixerDecision,
  validateFixerDecisions,
} from './ux-deterministic-fixers/production-fixer-decisions.mjs';

/** Repo-overlay defect trees (mirrors generator/build_rule_defect_fixtures.py). */
export const HARNESS_REPO_OVERLAY_RULE_IDS = new Set([
  'DET.CONTRACT.PATH',
  'DET.INVENTORY.CROSSWALK',
  'DET.SCREENSHOT.STATUS',
  'DET.TOKEN.NO_DRIFT',
  'DET.THEME.FONT_STACK',
  'DET.PY.KS_HASH_ATTRS',
  'DET.APP.PRIMITIVE_SOURCE',
  'DET.CONTRACT.PLACEHOLDERS',
]);

export const HARNESS_MULTI_PAGE_RULE_IDS = new Set(['DET.APP.PERSISTENT_CHROME']);

/** Rules with no defect fixture by design (catalog-only / deferred harness). */
export const HARNESS_FIXTURE_EXCLUDED = new Set([]);

/**
 * @param {string} ruleId
 * @returns {string}
 */
export function ruleIdToKebab(ruleId) {
  return String(ruleId || '')
    .toLowerCase()
    .replaceAll('.', '-')
    .replaceAll('_', '-');
}

/**
 * @param {string} markdown
 * @returns {boolean}
 */
export function rulePageHasBeforeExample(markdown) {
  const m = markdown.match(/##\s+Before(?:\s+example)?\b[\s\S]*?```(?:html)?\s*([\s\S]*?)```/i);
  if (!m) return false;
  const body = m[1].trim();
  return body.length > 20;
}

/**
 * @param {object} registry
 * @returns {Array<{ id: string, modulePath?: string }>}
 */
export function activeDetRules(registry) {
  return (registry.deterministicRules || []).filter(
    (r) => r.status === 'implemented' && r.modulePath && r.id && !HARNESS_FIXTURE_EXCLUDED.has(r.id),
  );
}

/**
 * @param {object} registry
 * @returns {Array<{ id: string, promptPath?: string }>}
 */
export function activeAiRules(registry) {
  return (registry.aiRules || []).filter((r) => r.promptPath && r.id);
}

/**
 * @param {{ ksRoot: string, registry: object }} opts
 */
export function validateDetHarnessFixtures({ ksRoot, registry }) {
  const rulePagesDir = path.join(ksRoot, 'docs/design/ux-audit/rule-pages');
  const missing = [];

  for (const rule of activeDetRules(registry)) {
    const id = rule.id;
    if (
      HARNESS_REPO_OVERLAY_RULE_IDS.has(id) ||
      HARNESS_MULTI_PAGE_RULE_IDS.has(id)
    ) {
      continue;
    }
    const pagePath = path.join(rulePagesDir, `${ruleIdToKebab(id)}.md`);
    if (!fs.existsSync(pagePath)) {
      missing.push({ id, reason: `missing rule page ${pagePath}` });
      continue;
    }
    const md = fs.readFileSync(pagePath, 'utf8');
    if (!rulePageHasBeforeExample(md)) {
      missing.push({ id, reason: 'rule page lacks ## Before HTML example' });
    }
  }

  return { ok: missing.length === 0, missing };
}

/**
 * @param {{ auditorRoot: string, registry: object }} opts
 */
export function validateAiDefectPrompts({ auditorRoot, registry }) {
  const missing = [];
  for (const rule of activeAiRules(registry)) {
    const promptPath = path.join(auditorRoot, rule.promptPath);
    if (!fs.existsSync(promptPath)) {
      missing.push({ id: rule.id, path: rule.promptPath });
    }
  }
  return { ok: missing.length === 0, missing };
}

/**
 * @param {object} registry
 */
export function validateDetFixerDecisions(registry) {
  const ids = activeDetRules(registry).map((r) => r.id);
  const base = validateFixerDecisions(ids);
  const invalid = [];

  for (const id of ids) {
    const d = resolveFixerDecision(id);
    if (!d?.fixerId) {
      invalid.push({ id, reason: 'no fixerId' });
      continue;
    }
    if (d.planOnly && !d.planOnlyReason) {
      invalid.push({ id, reason: 'planOnly without planOnlyReason' });
    }
  }

  return {
    ok: base.ok && invalid.length === 0,
    missing: base.missing,
    invalid,
  };
}

/**
 * @param {object} registry
 * @param {typeof import('../ui-app-audit/lib/studio-dynamic-ux-ruleset.mjs')} studioModule
 */
export function validateStudioDynamicAllowlist(registry, studioModule) {
  const {
    isStudioDynamicUxRuleId,
    STUDIO_DYNAMIC_UX_RUN,
    STUDIO_DYNAMIC_UX_PRIMITIVE_RULES,
    STUDIO_DYNAMIC_UX_SKIP_EXACT,
    STUDIO_DYNAMIC_UX_SKIP_PREFIXES,
    resolveStudioDynamicUxRuleIds,
  } = studioModule;

  const implemented = new Set(
    (registry.deterministicRules || [])
      .filter((r) => r.status === 'implemented' && r.modulePath)
      .map((r) => r.id),
  );

  const appRules = [...implemented].filter((id) => id.startsWith('DET.APP.'));
  const unlisted = [];
  const falsePositives = [];

  for (const id of appRules) {
    const inRun =
      STUDIO_DYNAMIC_UX_RUN.includes(id) || STUDIO_DYNAMIC_UX_PRIMITIVE_RULES.includes(id);
    const excluded =
      STUDIO_DYNAMIC_UX_SKIP_EXACT.includes(id) ||
      STUDIO_DYNAMIC_UX_SKIP_PREFIXES.some((p) => id.startsWith(p));
    const dynamic = isStudioDynamicUxRuleId(id);
    if (!inRun && !excluded && !dynamic) {
      unlisted.push(id);
    }
    if (inRun && excluded) {
      falsePositives.push(id);
    }
  }

  const resolved = resolveStudioDynamicUxRuleIds(registry);
  const orphanInAllowlist = STUDIO_DYNAMIC_UX_RUN.filter(
    (id) => implemented.has(id) && !resolved.includes(id) && isStudioDynamicUxRuleId(id),
  );

  return {
    ok: unlisted.length === 0 && falsePositives.length === 0,
    unlisted,
    falsePositives,
    dynamicCount: resolved.length,
    appRuleCount: appRules.length,
    orphanInAllowlist,
  };
}

/**
 * @param {object} registry
 */
export function summarizeFixerDecisions(registry) {
  const ids = activeDetRules(registry).map((r) => r.id);
  let productionAuto = 0;
  let planOnly = 0;
  let handbookAfter = 0;
  let repoOverlay = 0;

  for (const id of ids) {
    const d = resolveFixerDecision(id);
    if (d.planOnly) planOnly += 1;
    else if (d.productionHandler) productionAuto += 1;
    else if (d.fixerId === 'repo_overlay') repoOverlay += 1;
    else handbookAfter += 1;
  }

  return { productionAuto, planOnly, handbookAfter, repoOverlay, total: ids.length };
}

/**
 * @param {object} registry
 */
export function summarizeAiGovernance(registry) {
  const active = activeAiRules(registry).map((r) => r.id);
  const docOnly = (registry.aiRuleGovernance?.docOnly || []).map((d) => d.id);
  const legacy = (registry.aiRuleGovernance?.docOnly || [])
    .filter((d) => d.kind === 'legacy')
    .map((d) => d.id);
  return {
    active: active.length,
    activeIds: active,
    docOnly: docOnly.length,
    legacy: legacy.length,
  };
}

/**
 * @param {{ ksRoot: string, auditorRoot: string, registry: object, studioModule: object }} opts
 */
export function buildHarnessCoverageReport(opts) {
  const detFixtures = validateDetHarnessFixtures({
    ksRoot: opts.ksRoot,
    registry: opts.registry,
  });
  const aiPrompts = validateAiDefectPrompts({
    auditorRoot: opts.auditorRoot,
    registry: opts.registry,
  });
  const fixers = validateDetFixerDecisions(opts.registry);
  const studio = validateStudioDynamicAllowlist(opts.registry, opts.studioModule);
  const fixerCounts = summarizeFixerDecisions(opts.registry);
  const ai = summarizeAiGovernance(opts.registry);
  const det = opts.registry.deterministicCoverage || {};

  return {
    ok:
      detFixtures.ok &&
      aiPrompts.ok &&
      fixers.ok &&
      studio.ok,
    det: {
      documented: det.documentedRuleCount ?? activeDetRules(opts.registry).length,
      implemented: det.implementedCount ?? activeDetRules(opts.registry).length,
      stubbed: (det.stubRuleIds || []).length,
    },
    ai,
    fixerCounts,
    studioDynamicRules: studio.dynamicCount,
    detFixtures,
    aiPrompts,
    fixers,
    studio,
  };
}

/**
 * @param {ReturnType<typeof buildHarnessCoverageReport>} report
 */
export function renderHarnessCoverageMarkdown(report) {
  const ts = new Date().toISOString();
  const lines = [
    '# Harness current coverage',
    '',
    `Generated: \`${ts}\` by \`lib/harness-coverage-matrix.mjs\` (Prompt 10 closure).`,
    '',
    '## Registry',
    '',
    `| Lane | Documented | Implemented | Stubbed |`,
    `|------|------------|-------------|---------|`,
    `| UX DET | ${report.det.documented} | ${report.det.implemented} | ${report.det.stubbed} |`,
    `| UX AI active | ${report.ai.active} | — | — |`,
    `| UX AI legacy/doc-only | ${report.ai.docOnly} | — | (${report.ai.legacy} legacy) |`,
    '',
    '## Production fixer decisions (UX DET)',
    '',
    `| Category | Count |`,
    `|----------|-------|`,
    `| Production auto-fix | ${report.fixerCounts.productionAuto} |`,
    `| Plan-only (intentional) | ${report.fixerCounts.planOnly} |`,
    `| Handbook After default | ${report.fixerCounts.handbookAfter} |`,
    `| Repo overlay | ${report.fixerCounts.repoOverlay} |`,
    '',
    `## Studio dynamic allowlist`,
    '',
    `- Resolved dynamic rules: **${report.studioDynamicRules}**`,
    `- App-safe allowlist gaps: **${report.studio.unlisted.length}**`,
    '',
    '## Matrix gates',
    '',
    `| Gate | Status |`,
    `|------|--------|`,
    `| DET harness fixture (rule page Before or repo overlay) | ${report.detFixtures.ok ? 'PASS' : 'FAIL'} |`,
    `| AI defect prompt on disk | ${report.aiPrompts.ok ? 'PASS' : 'FAIL'} |`,
    `| Fixer decision per DET rule | ${report.fixers.ok ? 'PASS' : 'FAIL'} |`,
    `| Studio dynamic allowlist complete | ${report.studio.ok ? 'PASS' : 'FAIL'} |`,
    '',
    '## Verification commands',
    '',
    '```bash',
    'cd forgesdlc-kitchensink/tools/website-ux-auditor',
    'npm run blend-rules',
    'npm run pagegen:manifest',
    'npm run preflight-deterministic',
    'npm test',
    'cd ../website-a11y-auditor && npm test',
    'cd ../ui-app-audit && npm test',
    'node ../../../workspace-scripts/verify-ruleset-pack-self-contained.mjs --root ../../..',
    '```',
    '',
  ];

  if (!report.detFixtures.ok) {
    lines.push('### DET fixture gaps', '');
    for (const m of report.detFixtures.missing) {
      lines.push(`- \`${m.id}\`: ${m.reason}`);
    }
    lines.push('');
  }

  return `${lines.join('\n')}\n`;
}
