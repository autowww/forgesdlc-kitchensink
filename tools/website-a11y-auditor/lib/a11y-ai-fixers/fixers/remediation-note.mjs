import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * Writes a remediation note file (no DOM mutation). Counts as applied when findings exist.
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
    lines.push(`- **${f.severity || 'unknown'}**: ${f.message || '(no message)'}`);
    if (f.evidence) lines.push(`  - Evidence: ${String(f.evidence).slice(0, 300)}`);
  }
  lines.push('', '## Suggested steps', '', '1. Apply content/DOM fix per rule prompt.', '2. Re-run audit with `--lanes axe,det,ai` when agent is available.', '');
  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(notePath, `${lines.join('\n')}`, 'utf8');
  return {
    applied: true,
    fixerId: 'remediation_note',
    notePath,
    findingCount: findings.length,
  };
}
