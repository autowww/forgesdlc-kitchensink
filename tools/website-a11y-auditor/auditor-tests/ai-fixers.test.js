import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';

import { runAiFixers } from '../lib/a11y-ai-fixers/index.mjs';
import { resolveAiFixerId } from '../lib/a11y-ai-fixers/registry.mjs';

describe('a11y-ai-fixers', () => {
  it('resolveAiFixerId defaults to plan_only', () => {
    assert.equal(resolveAiFixerId('AI.A11Y.GENERIC.UNKNOWN'), 'plan_only');
  });

  it('runAiFixers writes ai-fixer-report.json for AI findings', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'ai-fix-'));
    const auditPath = path.join(tmp, 'a11y-audit-data.json');
    await fs.writeFile(
      auditPath,
      `${JSON.stringify({
        findings: [
          {
            ruleId: 'AI.A11Y.GENERIC.KEYBOARD_TASK_FLOW',
            severity: 'major',
            message: 'keyboard task flow issue',
          },
        ],
      })}\n`,
    );
    const { reportPath, report } = await runAiFixers({ auditDataPath: auditPath, outDir: tmp });
    assert.ok(reportPath.endsWith('ai-fixer-report.json'));
    assert.equal(report.summary.rulesProcessed, 1);
    const row = report.rules['AI.A11Y.GENERIC.KEYBOARD_TASK_FLOW'];
    assert.equal(row.fixerId, 'plan_only');
    assert.match(String(row.suggestedAction || ''), /keyboard/i);
  });
});
