#!/usr/bin/env node
/**
 * Regenerate pilot-registry.json from design-rules/registry.generated.json
 * (all implemented DET rules except DET.THEME.FONT_STACK).
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOOL_ROOT = path.resolve(__dirname, '../..');
const REGISTRY_PATH = path.join(TOOL_ROOT, 'design-rules/registry.generated.json');
const OUT_PATH = path.join(__dirname, 'pilot-registry.json');

const EXCLUDED = new Set(['DET.THEME.FONT_STACK']);
const REPO_OVERLAY = new Set([
  'DET.CONTRACT.PATH',
  'DET.CONTRACT.PLACEHOLDERS',
  'DET.INVENTORY.CROSSWALK',
  'DET.TOKEN.NO_DRIFT',
  'DET.PY.KS_HASH_ATTRS',
  'DET.SCREENSHOT.STATUS',
]);
const MULTI_PAGE = new Set(['DET.APP.PERSISTENT_CHROME']);

const reg = JSON.parse(await fs.readFile(REGISTRY_PATH, 'utf8'));
const rows = (reg.deterministicRules || [])
  .filter((r) => r.status === 'implemented' && r.modulePath && r.id)
  .filter((r) => !EXCLUDED.has(r.id))
  .sort((a, b) => String(a.id).localeCompare(String(b.id)));

const rules = rows.map((r) => {
  const ruleId = r.id;
  let fixerId = 'handbook_after';
  /** @type {string[]} */
  const harnessModes = ['standalone'];
  if (REPO_OVERLAY.has(ruleId)) {
    fixerId = 'repo_overlay';
    harnessModes.length = 0;
    harnessModes.push('repo_overlay');
  } else if (MULTI_PAGE.has(ruleId)) {
    harnessModes.length = 0;
    harnessModes.push('multi_page');
  }
  return {
    ruleId,
    fixerId,
    verifyMode: 'expect_rule_clean',
    harnessModes,
  };
});

const doc = {
  schemaVersion: 2,
  generatedAt: new Date().toISOString(),
  ruleCount: rules.length,
  rules,
};

await fs.writeFile(OUT_PATH, `${JSON.stringify(doc, null, 2)}\n`, 'utf8');
console.log(`generate-pilot-registry: wrote ${rules.length} rules → ${OUT_PATH}`);
