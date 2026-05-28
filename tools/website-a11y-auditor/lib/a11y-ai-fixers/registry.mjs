import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REGISTRY_PATH = path.join(__dirname, 'ai-fixer-registry.json');

let cached = null;

export function loadAiFixerRegistry() {
  if (!cached) {
    cached = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
  }
  return cached;
}

/**
 * @param {string} ruleId
 */
export function resolveAiFixerId(ruleId) {
  const reg = loadAiFixerRegistry();
  const row = (reg.rules || []).find((r) => r.ruleId === ruleId);
  return row?.fixerId || reg.defaultFixerId || 'plan_only';
}
