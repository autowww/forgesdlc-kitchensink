import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { loadSmokePlan, scenarioUrl } from '../lib/smoke-plan.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE = path.join(__dirname, 'fixtures', 'mini-smoke-plan.yaml');

test('loadSmokePlan reads scenarios', async () => {
  const plan = await loadSmokePlan(FIXTURE);
  assert.equal(plan.scenarios.length, 2);
  assert.equal(plan.scenarios[0].scenarioId, 'home-shell');
});

test('scenarioUrl builds hash route', async () => {
  const plan = await loadSmokePlan(FIXTURE);
  const reg = plan.scenarios.find((s) => s.scenarioId === 'registry-overview');
  const url = scenarioUrl(reg, 'http://127.0.0.1:8765');
  assert.ok(url.includes('#registry-section'), url);
});
