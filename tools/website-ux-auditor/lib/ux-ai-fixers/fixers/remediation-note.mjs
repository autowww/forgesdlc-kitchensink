import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * @param {{ ruleId: string, findings: object[], outDir?: string }} ctx
 */
export async function runRemediationNoteFixer(ctx) {
  const { ruleId, findings } = ctx;
  if (!findings?.length) {
    return { applied: false, fixerId: 'remediation_note', reason: 'no_findings' };
  }
  const outDir = ctx.outDir || process.cwd();
  const safe = ruleId.replace(/[^a-zA-Z0-9._-]+/g, '_');
  const notePath = path.join(outDir, `ai-remediation-${safe}.md`);
  const lines = [
    `# Remediation note — ${ruleId}`,
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    '## Findings',
    '',
  ];
  for (const f of findings.slice(0, 20)) {
    lines.push(`- **${f.severity || 'unknown'}**: ${f.title || f.message || '(no message)'}`);
    if (f.remediation) lines.push(`  - Remediation: ${String(f.remediation).slice(0, 300)}`);
    if (f.recommendedFixScope) lines.push(`  - Scope: ${f.recommendedFixScope}`);
  }
  lines.push('', '## Suggested steps', '', '1. Apply fix per rule prompt.', '2. Re-run audit with AI execute enabled.', '');
  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(notePath, `${lines.join('\n')}`, 'utf8');
  return {
    applied: true,
    fixerId: 'remediation_note',
    notePath,
    findingCount: findings.length,
  };
}
