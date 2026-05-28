import fs from 'node:fs/promises';
import path from 'node:path';
import yaml from 'js-yaml';

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
 * @property {{ repo?: string, path: string, role?: string }[]} [ownership]
 */

/**
 * @param {string} filePath
 * @returns {Promise<{ planId: string, scenarios: SmokeScenario[] }>}
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
 */
export function scenarioUrl(scenario, siteBase) {
  const base = siteBase.replace(/\/$/, '');
  const nav = scenario.navigate || {};
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
