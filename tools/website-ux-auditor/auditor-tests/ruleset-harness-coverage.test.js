import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import {
  activeAiRules,
  activeDetRules,
  buildHarnessCoverageReport,
  HARNESS_REPO_OVERLAY_RULE_IDS,
  validateAiDefectPrompts,
  validateDetFixerDecisions,
  validateDetHarnessFixtures,
  validateStudioDynamicAllowlist,
} from '../lib/harness-coverage-matrix.mjs';
import * as studioDynamic from '../../ui-app-audit/lib/studio-dynamic-ux-ruleset.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AUDITOR_ROOT = path.resolve(__dirname, '..');
const KS_ROOT = path.resolve(AUDITOR_ROOT, '../..');
const REGISTRY_PATH = path.join(AUDITOR_ROOT, 'design-rules/registry.generated.json');

function loadRegistry() {
  return JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
}

test('active DET rules have harness fixture path (Before example or repo overlay)', () => {
  const registry = loadRegistry();
  const result = validateDetHarnessFixtures({ ksRoot: KS_ROOT, registry });
  assert.equal(
    result.ok,
    true,
    result.missing.map((m) => `${m.id}: ${m.reason}`).join('\n'),
  );
  assert.ok(activeDetRules(registry).length >= 60);
});

test('active AI rules have defect prompt files', () => {
  const registry = loadRegistry();
  const result = validateAiDefectPrompts({ auditorRoot: AUDITOR_ROOT, registry });
  assert.equal(
    result.ok,
    true,
    result.missing.map((m) => `${m.id}: ${m.path}`).join('\n'),
  );
  assert.ok(activeAiRules(registry).length >= 18);
});

test('every active DET rule has fixer decision (auto, pilot, or plan-only with reason)', () => {
  const registry = loadRegistry();
  const result = validateDetFixerDecisions(registry);
  assert.equal(result.ok, true, [
    ...result.missing.map((id) => `missing decision: ${id}`),
    ...result.invalid.map((x) => `${x.id}: ${x.reason}`),
  ].join('\n'));
});

test('Studio dynamic allowlist explicitly includes or excludes every app-safe DET.APP rule', () => {
  const registry = loadRegistry();
  const result = validateStudioDynamicAllowlist(registry, studioDynamic);
  assert.equal(
    result.ok,
    true,
    [
      result.unlisted.length ? `unlisted: ${result.unlisted.join(', ')}` : '',
      result.falsePositives.length ? `conflicts: ${result.falsePositives.join(', ')}` : '',
    ]
      .filter(Boolean)
      .join('; '),
  );
  assert.ok(result.dynamicCount >= 35, `expected ≥35 dynamic rules, got ${result.dynamicCount}`);
});

test('repo-overlay harness rules are documented in matrix constants', () => {
  const registry = loadRegistry();
  const ids = activeDetRules(registry).map((r) => r.id);
  for (const id of HARNESS_REPO_OVERLAY_RULE_IDS) {
    assert.ok(ids.includes(id), `${id} should be implemented in registry`);
  }
});

test('harness coverage report aggregates counts for release pack', () => {
  const registry = loadRegistry();
  const report = buildHarnessCoverageReport({
    ksRoot: KS_ROOT,
    auditorRoot: AUDITOR_ROOT,
    registry,
    studioModule: studioDynamic,
  });
  assert.equal(report.ok, true, JSON.stringify(report, null, 2));
  assert.ok(report.det.implemented >= 60);
  assert.ok(report.ai.active >= 18);
  assert.ok(report.fixerCounts.total === report.det.implemented);
  assert.ok(report.fixerCounts.productionAuto >= 8);
  assert.ok(report.fixerCounts.planOnly >= 10);
});
