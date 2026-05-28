import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { buildTraceabilityIndex } from '../lib/build-traceability-index.mjs';
import { KS_ROOT_DEFAULT } from '../lib/paths.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE_PLAN = path.join(__dirname, 'fixtures', 'mini-smoke-plan.yaml');

test('buildTraceabilityIndex includes scenario entries', async () => {
  const appRepo = path.resolve(__dirname, '../../../../forge-accessibility-leo');
  let index;
  try {
    index = await buildTraceabilityIndex({
      appRepo,
      ksRepo: KS_ROOT_DEFAULT,
      smokePlanPath: FIXTURE_PLAN,
      appRepoName: 'forge-accessibility-leo',
    });
  } catch (e) {
    if (e.code === 'ENOENT') {
      return;
    }
    throw e;
  }
  assert.ok(index.entries.some((e) => e.id === 'a11y.studio.registry-overview'));
  assert.equal(index.byScenarioId['registry-overview'], 'a11y.studio.registry-overview');
});
