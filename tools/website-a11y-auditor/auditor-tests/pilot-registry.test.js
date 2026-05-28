import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

import { defaultFixerIdForRule, FIXER_ID_BY_RULE } from '../lib/a11y-deterministic-fixers/fixers/patch-registry.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOOL_ROOT = path.resolve(__dirname, '..');
const REGISTRY_PATH = path.join(TOOL_ROOT, 'design-rules/registry.generated.json');
const PILOT_PATH = path.join(TOOL_ROOT, 'lib/a11y-deterministic-fixers/pilot-registry.json');

describe('pilot-registry coverage', () => {
  it('every implemented DET rule has a pilot entry and known fixerId', () => {
    const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
    const pilot = JSON.parse(fs.readFileSync(PILOT_PATH, 'utf8'));
    const implemented = (registry.deterministicRules || []).filter((r) => r.status === 'implemented');
    const byRule = new Map((pilot.rules || []).map((r) => [r.ruleId, r]));
    assert.equal(byRule.size, implemented.length);
    for (const rule of implemented) {
      const row = byRule.get(rule.id);
      assert.ok(row, `missing pilot entry for ${rule.id}`);
      assert.equal(row.fixerId, defaultFixerIdForRule(rule.id));
    }
    assert.ok(Object.keys(FIXER_ID_BY_RULE).length >= 45);
  });
});
