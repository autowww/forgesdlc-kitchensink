import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PILOT_REGISTRY_PATH = path.join(__dirname, 'pilot-registry.json');

/** @typedef {{ ruleId: string, fixerId: string, verifyMode?: string, harnessModes?: string[], planOnly?: boolean, planOnlyReason?: string, productionHandler?: string, pendingRegistry?: boolean }} PilotRuleEntry */

let cached = null;

export function loadPilotRegistry() {
  if (cached) return cached;
  const raw = JSON.parse(fs.readFileSync(PILOT_REGISTRY_PATH, 'utf8'));
  const byRuleId = new Map();
  for (const entry of raw.rules || []) {
    byRuleId.set(entry.ruleId, entry);
  }
  cached = { schemaVersion: raw.schemaVersion || 1, byRuleId, rules: raw.rules || [] };
  return cached;
}

/** @param {string} ruleId */
export function getPilotEntry(ruleId) {
  return loadPilotRegistry().byRuleId.get(ruleId) || null;
}

export function listPilotRuleIds() {
  return loadPilotRegistry().rules.map((r) => r.ruleId);
}

export function isPilotRule(ruleId) {
  return loadPilotRegistry().byRuleId.has(ruleId);
}
