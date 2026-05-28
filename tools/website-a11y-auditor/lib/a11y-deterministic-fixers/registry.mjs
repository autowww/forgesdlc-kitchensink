import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REGISTRY_PATH = path.join(__dirname, 'pilot-registry.json');

let _cache = null;

export function loadPilotRegistry() {
  if (_cache) return _cache;
  const raw = fs.readFileSync(REGISTRY_PATH, 'utf8');
  _cache = JSON.parse(raw);
  return _cache;
}

export function listPilotRuleIds() {
  return (loadPilotRegistry().rules || []).map((r) => r.ruleId);
}

export function getPilotEntry(ruleId) {
  return (loadPilotRegistry().rules || []).find((r) => r.ruleId === ruleId) || null;
}

export function isPilotRule(ruleId) {
  return Boolean(getPilotEntry(ruleId));
}
