/**
 * Canonical UX AI rule ids, legacy aliases, and registry/doc alignment checks.
 */

import fs from 'node:fs/promises';
import path from 'node:path';

const TOOL_ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const KS_ROOT = path.resolve(TOOL_ROOT, '..', '..');
const DEFAULT_AI_DOC = path.resolve(KS_ROOT, 'docs/design/ux-audit/ai-enabled-design-principles.md');
const DEFAULT_RULE_PAGES_DIR = path.resolve(KS_ROOT, 'docs/design/ux-audit/rule-pages');

/** @type {Record<string, string>} legacy or synonym id → canonical registry id */
export const AI_RULE_ALIASES = {
  'AI.VISUAL.HIERARCHY_CONFIDENCE': 'AI.VISUAL.HIERARCHY',
  'AI.GOVERNANCE.CREDIBILITY': 'AI.CREDIBILITY.NO_OVERCLAIM',
  'AI.CONTRACT.ACTIONABILITY': 'AI.CONTRACT.IMPLEMENTATION_USEFULNESS',
};

/**
 * Doc vocabulary excluded from matrix/registry selection (not scored as active AI rules).
 * @type {Record<string, { kind: 'legacy' | 'discovery-only' | 'deprecated', reason: string, canonicalId?: string }>}
 */
export const AI_RULE_DOC_ONLY = {
  'AI.VISUAL.HIERARCHY_CONFIDENCE': {
    kind: 'legacy',
    canonicalId: 'AI.VISUAL.HIERARCHY',
    reason: 'Renamed to AI.VISUAL.HIERARCHY for matrix/taxonomy alignment; normalize findings to the canonical id.',
  },
  'AI.GOVERNANCE.CREDIBILITY': {
    kind: 'legacy',
    canonicalId: 'AI.CREDIBILITY.NO_OVERCLAIM',
    reason: 'Superseded by AI.CREDIBILITY.NO_OVERCLAIM and AI.TRUST.BOUNDARY_CLARITY in explicit-only registry selection.',
  },
  'AI.CONTRACT.ACTIONABILITY': {
    kind: 'legacy',
    canonicalId: 'AI.CONTRACT.IMPLEMENTATION_USEFULNESS',
    reason: 'Superseded by AI.CONTRACT.IMPLEMENTATION_USEFULNESS in matrix/taxonomy; same judgment lens.',
  },
  'AI.CONTRACT.FAMILY_COVERAGE_JUSTIFIED': {
    kind: 'discovery-only',
    reason: 'Extended contract vocabulary only; not in matrix/taxonomy explicit AI selection.',
  },
  'AI.RULE_DISCOVERY.CANDIDATE_DETERMINISTIC_RULE': {
    kind: 'discovery-only',
    reason: 'Metadata promotion path for candidateDeterministicRule; not a separate scored AI batch rule.',
  },
};

export function kebabFromRuleId(ruleId) {
  return String(ruleId || '')
    .toLowerCase()
    .replaceAll('.', '-')
    .replaceAll('_', '-')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function aiRuleDocAnchor(ruleId) {
  return `docs/design/ux-audit/ai-enabled-design-principles.md#${kebabFromRuleId(ruleId)}`;
}

export function extractAiRuleIdsFromMarkdown(markdown) {
  const rx = /`(AI\.[A-Z0-9_.]+)`/g;
  const out = [];
  for (const match of String(markdown || '').matchAll(rx)) out.push(match[1]);
  return [...new Set(out)].sort();
}

/**
 * @param {string} rawId
 * @returns {string}
 */
export function normalizeAiPrincipleId(rawId) {
  const id = String(rawId || '').trim();
  if (!id) return '';
  return AI_RULE_ALIASES[id] || id;
}

export function buildAiRuleGovernanceBlock() {
  return {
    aliases: Object.entries(AI_RULE_ALIASES).map(([from, to]) => ({ from, to })),
    docOnly: Object.entries(AI_RULE_DOC_ONLY).map(([id, meta]) => ({ id, ...meta })),
  };
}

function rulePagePathForId(rulePagesDir, ruleId) {
  return path.join(rulePagesDir, `${kebabFromRuleId(ruleId)}.md`);
}

async function fileExists(absPath) {
  try {
    await fs.access(absPath);
    return true;
  } catch {
    return false;
  }
}

function docMentionsRuleId(markdown, ruleId) {
  return markdown.includes(`\`${ruleId}\``);
}

/**
 * @param {object} opts
 * @param {object} opts.registry
 * @param {string} [opts.aiRulesDocMarkdown]
 * @param {string} [opts.toolRoot]
 * @param {string} [opts.ksRoot]
 * @param {string} [opts.rulePagesDir]
 */
export async function validateAiRuleRegistryAlignment(opts) {
  const registry = opts.registry || {};
  const toolRoot = path.resolve(opts.toolRoot || TOOL_ROOT);
  const ksRoot = path.resolve(opts.ksRoot || KS_ROOT);
  const rulePagesDir = path.resolve(opts.rulePagesDir || DEFAULT_RULE_PAGES_DIR);
  const aiDocPath = opts.aiRulesDocPath || DEFAULT_AI_DOC;

  let aiMarkdown = opts.aiRulesDocMarkdown;
  if (aiMarkdown == null) {
    aiMarkdown = await fs.readFile(aiDocPath, 'utf8');
  }

  const errors = [];
  const activeRules = Array.isArray(registry.aiRules) ? registry.aiRules : [];
  const activeIds = activeRules.map((r) => r.id).filter(Boolean);
  const activeSet = new Set(activeIds);
  const docIds = extractAiRuleIdsFromMarkdown(aiMarkdown);

  for (const rule of activeRules) {
    const id = rule.id;
    if (!docMentionsRuleId(aiMarkdown, id)) {
      errors.push(`registry AI id ${id} is not referenced in ai-enabled-design-principles.md (backtick anchor)`);
    }
    const pagePath = rulePagePathForId(rulePagesDir, id);
    if (!(await fileExists(pagePath))) {
      errors.push(`registry AI id ${id} missing handbook rule page: ${path.relative(ksRoot, pagePath)}`);
    }
    if (rule.promptPath) {
      const promptAbs = path.resolve(toolRoot, rule.promptPath);
      if (!(await fileExists(promptAbs))) {
        errors.push(`registry AI id ${id} missing prompt file: ${rule.promptPath}`);
      }
    } else {
      errors.push(`registry AI id ${id} has no promptPath`);
    }
  }

  for (const docId of docIds) {
    if (activeSet.has(docId)) continue;
    const docOnly = AI_RULE_DOC_ONLY[docId];
    if (docOnly) continue;
    if (AI_RULE_ALIASES[docId]) continue;
    errors.push(
      `doc AI id ${docId} is not in registry and is not marked legacy/discovery-only in AI_RULE_DOC_ONLY`,
    );
  }

  for (const [aliasFrom, aliasTo] of Object.entries(AI_RULE_ALIASES)) {
    if (!activeSet.has(aliasTo)) {
      errors.push(`alias target ${aliasTo} for ${aliasFrom} is not an active registry AI id`);
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    activeIds,
    docIds,
    aliasCount: Object.keys(AI_RULE_ALIASES).length,
    docOnlyCount: Object.keys(AI_RULE_DOC_ONLY).length,
  };
}

export const AI_RULE_PATHS = {
  toolRoot: TOOL_ROOT,
  ksRoot: KS_ROOT,
  aiRulesDoc: DEFAULT_AI_DOC,
  rulePagesDir: DEFAULT_RULE_PAGES_DIR,
};
