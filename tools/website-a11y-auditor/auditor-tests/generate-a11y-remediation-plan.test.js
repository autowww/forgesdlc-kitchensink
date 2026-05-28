import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';

import { generateA11yRemediationPlan } from '../lib/generate-a11y-remediation-plan.mjs';

describe('generate-a11y-remediation-plan', () => {
  it('writes plan with todos grouped by rule id', async () => {
    const outDir = await fs.mkdtemp(path.join(os.tmpdir(), 'a11y-plan-'));
    const repoRoot = path.join(outDir, 'repo');
    await fs.mkdir(repoRoot, { recursive: true });
    const auditPath = path.join(outDir, 'a11y-audit-data.json');
    await fs.writeFile(
      auditPath,
      JSON.stringify({
        standard: 'wcag21aa',
        findings: [
          { checkId: 'DET.A11Y.GENERIC.LANG', severity: 'serious', message: 'missing lang' },
          { checkId: 'DET.A11Y.GENERIC.LANG', severity: 'serious', message: 'missing lang 2' },
        ],
      }),
    );
    const { planPath, todoCount } = await generateA11yRemediationPlan({
      auditDataPath: auditPath,
      outDir,
      repoRoot,
    });
    const text = await fs.readFile(planPath, 'utf8');
    assert.ok(text.includes('a11y-01'));
    assert.ok(text.includes('DET.A11Y.GENERIC.LANG'));
    assert.equal(todoCount, 1);
    await fs.access(path.join(repoRoot, '.cursor/plans/forge-a11y-remediation/forge-a11y-remediation.plan.md'));
  });
});
