import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

import {
  kebabFromRuleId,
  computeContentVersion,
  evaluateRulePage,
  buildManifest,
  selectPagegenTargets,
  RULE_PAGES_DIR,
  MANIFEST_PATH,
} from '../design-rules/blender/rule-page-version.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const toolRoot = path.resolve(__dirname, '..');
const registryPath = path.resolve(toolRoot, 'design-rules/registry.generated.json');
const versionScript = path.resolve(toolRoot, 'design-rules/blender/rule-page-version.mjs');

test('kebabFromRuleId normalizes dots and underscores', () => {
  assert.equal(kebabFromRuleId('DET.NAV.DEDUP'), 'det-nav-dedup');
  assert.equal(kebabFromRuleId('AI.CONTEXT.COGNITIVE_CLARITY'), 'ai-context-cognitive-clarity');
});

test('rule page manifest writes and summarizes registry rules', async () => {
  const blender = spawnSync(
    'node',
    [path.resolve(toolRoot, 'design-rules/blender/design-rules-blender.mjs')],
    { cwd: toolRoot, encoding: 'utf8' },
  );
  assert.equal(blender.status, 0, blender.stderr || blender.stdout);

  const run = spawnSync('node', [versionScript, '--write-manifest'], {
    cwd: toolRoot,
    encoding: 'utf8',
  });
  assert.equal(run.status, 0, run.stderr || run.stdout);

  const registry = JSON.parse(await fs.readFile(registryPath, 'utf8'));
  const manifest = JSON.parse(await fs.readFile(MANIFEST_PATH, 'utf8'));

  assert.ok(manifest.summary.total >= 1);
  assert.equal(manifest.summary.total, manifest.rules.length);
  assert.ok(manifest.rules.some((r) => r.id === 'DET.PAGE.LANG'));
  assert.ok(['current', 'stale', 'missing'].includes(manifest.rules[0].status));

  const row = registry.deterministicRules.find((r) => r.id === 'DET.PAGE.LANG');
  assert.ok(row);
  const evaluated = await evaluateRulePage(
    {
      id: row.id,
      lane: 'deterministic',
      registryStatus: row.status,
      modulePath: row.modulePath || '',
      promptPath: '',
      sourceRule: row.sourceRule || '',
    },
    registry,
  );
  const version = await computeContentVersion(
    {
      id: row.id,
      lane: 'deterministic',
      registryStatus: row.status,
      modulePath: row.modulePath || '',
      promptPath: '',
      sourceRule: row.sourceRule || '',
    },
    registry,
  );
  assert.equal(evaluated.contentVersion, version);
  assert.equal(evaluated.mdPath, `docs/design/ux-audit/rule-pages/${kebabFromRuleId(row.id)}.md`);
});

test('selectPagegenTargets skips current pages unless override', async () => {
  const registry = JSON.parse(await fs.readFile(registryPath, 'utf8'));
  const row = registry.deterministicRules[0];
  const evaluated = await evaluateRulePage(
    {
      id: row.id,
      lane: 'deterministic',
      registryStatus: row.status,
      modulePath: row.modulePath || '',
      promptPath: '',
      sourceRule: row.sourceRule || '',
    },
    registry,
  );

  const mdPath = path.join(RULE_PAGES_DIR, `${kebabFromRuleId(row.id)}.md`);
  const hadFile = await fs
    .access(mdPath)
    .then(() => true)
    .catch(() => false);

  if (evaluated.status !== 'current') {
    await fs.mkdir(RULE_PAGES_DIR, { recursive: true });
    const front = [
      '---',
      `rule_id: ${row.id}`,
      'lane: deterministic',
      `page_version: ${evaluated.contentVersion}`,
      'generated_at: 2026-05-19T12:00:00Z',
      '---',
      '',
      '## Purpose',
      'Test stub for pagegen skip logic.',
    ].join('\n');
    await fs.writeFile(mdPath, front, 'utf8');
  }

  const reeval = await evaluateRulePage(
    {
      id: row.id,
      lane: 'deterministic',
      registryStatus: row.status,
      modulePath: row.modulePath || '',
      promptPath: '',
      sourceRule: row.sourceRule || '',
    },
    registry,
  );
  assert.equal(reeval.status, 'current');

  const allTargets = await selectPagegenTargets({
    lane: 'deterministic',
    maxRules: 0,
    onlyRules: [],
    overrideVersion: false,
  });
  assert.ok(!allTargets.some((t) => t.id === row.id));

  const forced = await selectPagegenTargets({
    lane: 'deterministic',
    maxRules: 0,
    onlyRules: [row.id],
    overrideVersion: false,
  });
  assert.equal(forced.length, 1);
  assert.equal(forced[0].id, row.id);

  if (!hadFile && evaluated.status !== 'current') {
    await fs.unlink(mdPath).catch(() => {});
  }
});
