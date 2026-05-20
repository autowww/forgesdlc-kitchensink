import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const toolRoot = path.resolve(__dirname, '..');
const blenderPath = path.resolve(toolRoot, 'design-rules/blender/design-rules-blender.mjs');
const registryPath = path.resolve(toolRoot, 'design-rules/registry.generated.json');

test('design rules blender generates registry with deterministic and AI lanes', async () => {
  const run = spawnSync('node', [blenderPath], { cwd: toolRoot, encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr || run.stdout);

  const raw = JSON.parse(await fs.readFile(registryPath, 'utf8'));
  assert.ok(raw.fingerprint);
  assert.ok(Array.isArray(raw.deterministicRules));
  assert.ok(Array.isArray(raw.aiRules));
  assert.ok(raw.deterministicRules.some((r) => r.id === 'DET.PAGE.LANG'));
  assert.ok(raw.aiRules.some((r) => r.id === 'AI.CONTEXT.COGNITIVE_CLARITY'));
  assert.ok(raw.deterministicCoverage);
  assert.ok(raw.deterministicCoverage.implementedCount >= 12);
  assert.ok(raw.deterministicRules.some((r) => r.id === 'DET.CHROME.BOUNDARY' && r.status === 'implemented'));
});
