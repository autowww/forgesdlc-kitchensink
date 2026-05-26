import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';

import { markPlanTodosCompletedForRules } from './plan-trim.mjs';

describe('plan-trim', () => {
  it('marks matching todo status completed', async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'ux-plan-'));
    const planPath = path.join(dir, 'forge-ux-remediation.plan.md');
    await fs.writeFile(
      planPath,
      `---
todos:
  - id: ux-det-hash-markers
    content: Fix hash markers
    status: pending
  - id: ux-det-page-title
    content: Fix title
    status: pending
---
# Plan
`,
      'utf8',
    );
    const { trimmed } = await markPlanTodosCompletedForRules(planPath, new Set(['DET.HASH.MARKERS']));
    assert.ok(trimmed >= 1);
    const text = await fs.readFile(planPath, 'utf8');
    assert.match(text, /ux-det-hash-markers[\s\S]*status: completed/);
    assert.match(text, /ux-det-page-title[\s\S]*status: pending/);
  });
});
