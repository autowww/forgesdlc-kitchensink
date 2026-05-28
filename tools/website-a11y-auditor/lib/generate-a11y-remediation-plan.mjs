import fs from 'node:fs/promises';
import path from 'node:path';

const SEV_RANK = { blocker: 0, critical: 1, serious: 2, major: 2, warn: 3, minor: 4, trivial: 5, cosmetic: 6 };

/**
 * @param {object[]} findings
 */
function groupFindings(findings) {
  /** @type {Map<string, object[]>} */
  const byRule = new Map();
  for (const f of findings || []) {
    const ruleId =
      String(f.checkId || f.ruleId || f.axeRuleId || f.principleId || 'unknown').trim() || 'unknown';
    if (!byRule.has(ruleId)) byRule.set(ruleId, []);
    byRule.get(ruleId).push(f);
  }
  return [...byRule.entries()].sort((a, b) => {
    const sa = Math.min(...a[1].map((f) => SEV_RANK[String(f.severity || 'warn').toLowerCase()] ?? 9));
    const sb = Math.min(...b[1].map((f) => SEV_RANK[String(f.severity || 'warn').toLowerCase()] ?? 9));
    if (sa !== sb) return sa - sb;
    return b[1].length - a[1].length;
  });
}

/**
 * @param {object} opts
 * @param {string} opts.auditDataPath
 * @param {string} opts.outDir
 * @param {string} opts.repoRoot
 * @param {string} [opts.fixerReportPath]
 * @param {string} [opts.aiFixerReportPath]
 */
export async function generateA11yRemediationPlan(opts) {
  const { auditDataPath, outDir, repoRoot, fixerReportPath, aiFixerReportPath } = opts;
  const audit = JSON.parse(await fs.readFile(auditDataPath, 'utf8'));
  const findings = audit.findings || [];

  let fixerReport = null;
  if (fixerReportPath) {
    try {
      fixerReport = JSON.parse(await fs.readFile(fixerReportPath, 'utf8'));
    } catch {
      fixerReport = null;
    }
  }

  let aiFixerReport = null;
  if (aiFixerReportPath) {
    try {
      aiFixerReport = JSON.parse(await fs.readFile(aiFixerReportPath, 'utf8'));
    } catch {
      aiFixerReport = null;
    }
  }

  const verifiedRules = new Set();
  if (fixerReport?.rules) {
    for (const [rid, row] of Object.entries(fixerReport.rules)) {
      if (row.verifyOk) verifiedRules.add(rid);
    }
  }

  const groups = groupFindings(findings).filter(([ruleId]) => !verifiedRules.has(ruleId));
  const profile = audit.complianceProfile?.id || audit.standard || 'wcag21aa';
  const site = audit.site || audit.baseUrl || '';
  const runId = audit.auditRunId || path.basename(outDir);

  const todos = groups.map(([ruleId, rows], idx) => {
    const n = String(idx + 1).padStart(2, '0');
    const top = rows[0] || {};
    const sev = top.severity || 'warn';
    const sample = String(top.message || top.description || '').slice(0, 120);
    return {
      id: `a11y-${n}`,
      content: `Remediate \`${ruleId}\` (${rows.length} finding(s), ${sev}): ${sample}`,
      status: 'pending',
    };
  });

  if (!todos.length) {
    todos.push({
      id: 'a11y-00',
      content: 'No open findings after fixers — run final re-audit and document manual SC review in forge-accessibility Studio.',
      status: 'pending',
    });
  }

  const todoYaml = todos
    .map(
      (t) =>
        `  - id: ${t.id}\n    content: >-\n      ${t.content.replace(/\n/g, ' ')}\n    status: ${t.status}`,
    )
    .join('\n');

  const body = `# Forge a11y remediation

> ${audit.disclaimer || 'Automated audit output is not legal WCAG conformance. Use forge-accessibility Studio for manual success criteria.'}

**Profile:** \`${profile}\`  
**Site:** ${site || '_(not set)_'}  
**Run:** \`${runId}\`  
**Findings (open):** ${findings.length} total; ${groups.length} rule cluster(s) for agent

## Evidence

- Audit JSON: \`a11y-audit-data.json\`
- Fixer report: \`deterministic-fixer-report.json\` (when DET fixers ran)
- AI fixer report: \`ai-fixer-report.json\` (when AI fixers ran)
- Re-audit: \`./run-website-a11y-remediation-loop.sh\` or \`analyze-website-a11y.mjs\`

## Agent instructions

1. Prefer **generator / shared layout** fixes when the same \`DET.A11Y.*\` or axe rule repeats across pages.
2. For **manual_expected** SC (AI lane), improve HTML semantics and copy; do not claim legal conformance.
3. After each todo: rebuild static site if \`generator/build-site.py\` exists; re-run DET harness or analyzer on touched paths.
4. Handbook rule pages: \`docs/design/a11y-audit/rule-pages/\` in kitchensink.

## Findings by rule

${groups
  .map(([ruleId, rows]) => {
    const lines = rows
      .slice(0, 5)
      .map(
        (f) =>
          `- **${f.severity || 'warn'}** ${f.url || ''}: ${String(f.message || f.description || '').slice(0, 200)}`,
      );
    const more = rows.length > 5 ? `\n- _… ${rows.length - 5} more in audit JSON_` : '';
    return `### ${ruleId} (${rows.length})\n\n${lines.join('\n')}${more}\n`;
  })
  .join('\n')}
${
  aiFixerReport?.rules
    ? `\n## AI fixer suggestions\n\n${Object.entries(aiFixerReport.rules)
        .map(
          ([rid, row]) =>
            `- \`${rid}\` (${row.fixerId}): ${String(row.suggestedAction || '').slice(0, 240)}`,
        )
        .join('\n')}\n`
    : ''
}
`;

  const front = `---
name: forge-a11y-remediation
overview: Remediate accessibility findings from Forge Website A11y Auditor (${profile}, ${groups.length} rule cluster(s)).
todos:
${todoYaml}
---

`;

  const planText = `${front}${body}`;
  await fs.mkdir(outDir, { recursive: true });
  const outPlan = path.join(outDir, 'forge-a11y-remediation.plan.md');
  await fs.writeFile(outPlan, planText, 'utf8');

  const nested = path.join(repoRoot, '.cursor/plans/forge-a11y-remediation');
  await fs.mkdir(nested, { recursive: true });
  const repoPlan = path.join(nested, 'forge-a11y-remediation.plan.md');
  await fs.writeFile(repoPlan, planText, 'utf8');

  return { planPath: outPlan, repoPlanPath: repoPlan, todoCount: todos.length, openClusters: groups.length };
}
