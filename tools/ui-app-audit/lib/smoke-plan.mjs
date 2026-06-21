import fs from 'node:fs/promises';
import path from 'node:path';
import yaml from 'js-yaml';

/**
 * @typedef {object} RenderRoot
 * @property {string} [repo]
 * @property {string} path
 * @property {string} [role]
 */

/**
 * @typedef {object} SmokeStep
 * @property {string} stepId
 * @property {string} [description]
 * @property {{ hash?: string, path?: string, query?: string }} [navigate]
 * @property {string} [ready]
 * @property {string[]} [ready_selectors]
 * @property {string} [assert_text_contains]
 * @property {string} [click]
 * @property {string} [wait_for]
 * @property {string} [state]
 * @property {string} [press]
 * @property {RenderRoot[]} [render_roots]
 */

/**
 * @typedef {object} SmokeScenario
 * @property {string} scenarioId
 * @property {string} [doc_anchor]
 * @property {string} [tier]
 * @property {string} [status]
 * @property {{ hash?: string, path?: string, query?: string }} [navigate]
 * @property {string} [ready]
 * @property {string[]} [ready_selectors]
 * @property {string} [assert_text_contains]
 * @property {string[]} [audit_lanes]
 * @property {RenderRoot[]} [ownership]
 * @property {RenderRoot[]} [render_roots]
 * @property {SmokeStep[]} [steps]
 */

/**
 * @param {string} filePath
 * @returns {Promise<{ planId: string, baseUrl: string | null, scenarios: SmokeScenario[] }>}
 */
export async function loadSmokePlan(filePath) {
  const raw = await fs.readFile(path.resolve(filePath), 'utf8');
  const doc = yaml.load(raw);
  if (!doc || typeof doc !== 'object') {
    throw new Error(`Invalid smoke plan: ${filePath}`);
  }
  const scenarios = Array.isArray(doc.scenarios) ? doc.scenarios : [];
  for (const s of scenarios) {
    if (!s.scenarioId) throw new Error(`smoke plan scenario missing scenarioId in ${filePath}`);
  }
  return {
    planId: String(doc.planId || 'default'),
    baseUrl: doc.baseUrl ? String(doc.baseUrl) : null,
    scenarios,
  };
}

/**
 * @param {SmokeScenario} scenario
 * @param {string} siteBase
 * @param {{ hash?: string, path?: string, query?: string }} [navOverride]
 */
export function scenarioUrl(scenario, siteBase, navOverride) {
  const base = siteBase.replace(/\/$/, '');
  const nav = navOverride || scenario.navigate || {};
  const q = nav.query ? (nav.query.startsWith('?') ? nav.query : `?${nav.query}`) : '';
  const h = nav.hash ? (nav.hash.startsWith('#') ? nav.hash : `#${nav.hash}`) : '';
  if (nav.path) {
    const p = nav.path.startsWith('/') ? nav.path : `/${nav.path}`;
    return `${base}${p}${q}${h}`;
  }
  return `${base}/${q}${h}`.replace(/([^:])\/{2,}/g, '$1/').replace(/\/#/, '#').replace(/\/\?/, '?');
}

/**
 * @param {string[]} tiers
 * @param {SmokeScenario} scenario
 */
export function scenarioMatchesTiers(tiers, scenario) {
  if (!tiers?.length) return true;
  const t = String(scenario.tier || 'smoke').toLowerCase();
  return tiers.map((x) => x.toLowerCase()).includes(t);
}

/**
 * Normalize to executable steps (implicit `land` when flat navigate/ready only).
 * @param {SmokeScenario} scenario
 * @returns {SmokeStep[]}
 */
export function normalizeScenarioSteps(scenario) {
  if (Array.isArray(scenario.steps) && scenario.steps.length) {
    return scenario.steps.map((step, i) => ({
      stepId: step.stepId || `step-${i + 1}`,
      ...step,
    }));
  }
  const land = {
    stepId: 'land',
    description: 'Navigate and wait for ready selectors',
    navigate: scenario.navigate,
    ready: scenario.ready,
    ready_selectors: scenario.ready_selectors,
    assert_text_contains: scenario.assert_text_contains,
    render_roots: scenario.render_roots || scenario.ownership,
  };
  return [land];
}

/**
 * @param {SmokeScenario} scenario
 * @param {string} [stepId]
 * @returns {RenderRoot[]}
 */
export function getScenarioRenderRoots(scenario, stepId) {
  if (stepId) {
    const step = normalizeScenarioSteps(scenario).find((s) => s.stepId === stepId);
    if (step?.render_roots?.length) return step.render_roots;
  }
  const roots = [];
  const seen = new Set();
  const add = (list) => {
    for (const r of list || []) {
      const key = `${r.repo || ''}:${r.path}`;
      if (!r.path || seen.has(key)) continue;
      seen.add(key);
      roots.push(r);
    }
  };
  for (const step of normalizeScenarioSteps(scenario)) add(step.render_roots);
  add(scenario.render_roots);
  add(scenario.ownership);
  return roots;
}

/**
 * @param {SmokeScenario} scenario
 * @param {string} siteBase
 * @param {SmokeStep} step
 */
export function scenarioStepUrl(scenario, siteBase, step) {
  if (step.navigate) return scenarioUrl(scenario, siteBase, step.navigate);
  return scenarioUrl(scenario, siteBase);
}
