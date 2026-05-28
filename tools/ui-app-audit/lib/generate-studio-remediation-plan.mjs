import fs from 'node:fs/promises';
import path from 'node:path';

import { isMajorPlus } from '../../website-ux-auditor/lib/severity.js';

/**
 * @param {object} auditData
 * @param {string} outPath
 */
export async function writeStudioRemediationPlan(auditData, outPath) {
  const findings = Array.isArray(auditData.findings) ? auditData.findings : [];
  const majorPlus = findings.filter((f) => isMajorPlus(f.severity));
  const byScenario = new Map();
  for (const f of majorPlus) {
    const sid = f.scenarioId || 'unknown';
    if (!byScenario.has(sid)) byScenario.set(sid, []);
    byScenario.get(sid).push(f);
  }

  const lines = [
    '---',
    'name: Forge Studio remediation',
    `auditRunId: ${auditData.auditRunId || 'unknown'}`,
    `generatedAt: ${auditData.generatedAt || new Date().toISOString()}`,
    `planId: ${auditData.planId || 'forge-a11y-studio'}`,
    `siteKind: ${auditData.siteKind || 'a11y-studio'}`,
    'todos:',
  ];

  let idx = 0;
  for (const [scenarioId, list] of [...byScenario.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    for (const f of list.slice(0, 12)) {
      idx += 1;
      const id = `studio-${String(idx).padStart(3, '0')}`;
      const rule = f.ruleId || f.checkId || 'finding';
      const msg = String(f.message || '').replace(/\n/g, ' ').slice(0, 120);
      lines.push(`  - id: ${id}`);
      lines.push(`    content: "[${scenarioId}] ${rule}: ${msg}"`);
      lines.push('    status: pending');
    }
  }

  if (idx === 0) {
    lines.push('  - id: studio-000');
    lines.push('    content: No Major+ findings — verify gate and close plan.');
    lines.push('    status: completed');
  }

  lines.push('---', '');
  lines.push('# Forge Studio remediation plan', '');
  lines.push(`Generated from scenario smoke audit (\`${auditData.auditRunId || ''}\`).`, '');
  lines.push(`- **Scenarios:** ${auditData.crawlSummary?.scenariosTotal ?? '—'}`);
  lines.push(`- **Major+ findings:** ${majorPlus.length}`);
  lines.push(`- **Rules scope:** ${auditData.rulesScope?.effectiveScope ?? '—'} (${auditData.rulesScope?.reason ?? ''})`);
  lines.push('');
  lines.push('## Agent instructions', '');
  lines.push('1. Work todos in order; use each finding\'s `sources[]` from `audit-data.json` only.');
  lines.push('2. After fixes: `npm run build:studio-js` then re-run `./scripts/run-sealed-studio-smoke.sh`.');
  lines.push('3. Do not change smoke-plan scenarios unless the contract table in `docs/studio-functionality.md` is updated.');
  lines.push('');

  if (majorPlus.length) {
    lines.push('## Major+ summary', '');
    for (const [scenarioId, list] of [...byScenario.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
      lines.push(`### ${scenarioId}`, '');
      for (const f of list.slice(0, 8)) {
        const rule = f.ruleId || f.checkId || '?';
        lines.push(`- **${f.severity}** \`${rule}\`: ${f.message || ''}`);
        if (f.sources?.length) {
          for (const s of f.sources.slice(0, 3)) {
            lines.push(`  - \`${s.path}\` (${s.role || 'source'})`);
          }
        }
      }
      if (list.length > 8) lines.push(`- … and ${list.length - 8} more`, '');
      lines.push('');
    }
  }

  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, `${lines.join('\n')}\n`, 'utf8');
}
