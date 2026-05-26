import { summarizeBySeverity } from '../../website-ux-auditor/lib/severity.js';
import { COMPLIANCE_DISCLAIMER } from './compliance-profiles.js';

/**
 * @param {object} auditData
 */
export function buildCoverageMapSection(auditData) {
  const map = auditData.coverageMap || {};
  const lines = [];
  lines.push('## Coverage map');
  lines.push('');
  lines.push(`> ${COMPLIANCE_DISCLAIMER}`);
  lines.push('');
  const profile = auditData.complianceProfile || auditData.standards?.complianceProfile;
  if (profile) {
    lines.push(`**Profile:** ${profile.label || profile.id} (\`${profile.id}\`)`);
    if (profile.wcagVersion && profile.level) {
      lines.push(`**WCAG:** ${profile.wcagVersion} Level ${profile.level}`);
    }
    if (profile.jurisdictionNotes) {
      lines.push('');
      lines.push(profile.jurisdictionNotes);
    }
    lines.push('');
  }
  lines.push('### Axe lane');
  lines.push('');
  lines.push(`Tags: \`${(map.axeTags || auditData.standards?.axeTags || []).join(', ')}\``);
  lines.push('');
  lines.push('### Deterministic rules in scope');
  lines.push('');
  const detInScope = map.detRulesInScope || auditData.deterministicRuleIds || [];
  if (detInScope.length) {
    for (const id of detInScope) lines.push(`- ${id}`);
  } else {
    lines.push('- _(none)_');
  }
  lines.push('');
  const excluded = map.detRulesExcluded || auditData.excludedDeterministicRuleIds || [];
  if (excluded.length) {
    lines.push('### Deterministic rules excluded by profile');
    lines.push('');
    for (const id of excluded) lines.push(`- ${id}`);
    lines.push('');
  }
  const manual = profile?.manualTestingRequired || map.manualTestingRequired || [];
  if (manual.length) {
    lines.push('### Manual testing still required');
    lines.push('');
    for (const item of manual) lines.push(`- ${item}`);
    lines.push('');
  }
  return lines;
}

/**
 * @param {object} auditData
 */
function buildTraceabilitySection(auditData) {
  const t = auditData.traceabilitySummary;
  if (!t) return [];
  const lines = [];
  lines.push('### Standards traceability (RTM)');
  lines.push('');
  lines.push(
    `RTM profile \`${t.rtmProfileId}\`: **${t.covered}** / ${t.totalCriteria} criteria have axe and/or Forge rule mapping; ` +
      `**${t.manualExpected}** manual-expected; **${t.uncovered}** uncovered automation gaps; ` +
      `**${t.untiedRuleCount}** untied Forge/axe rules.`,
  );
  lines.push('');
  lines.push(`Full gap lists: \`${t.gapsDocPath}\` (regenerate via \`npm run blend-rules\` in website-a11y-auditor).`);
  lines.push(`Machine-readable matrix: \`${t.matrixPath}\`.`);
  lines.push('');
  return lines;
}

/**
 * @param {object[]} findings
 */
function groupFindingsByLane(findings) {
  const axe = [];
  const det = [];
  const other = [];
  for (const f of findings || []) {
    const rid = String(f.ruleId || '');
    if (rid.startsWith('AXE.') || f.checkId === 'axe-lane' || f.lane === 'axe') {
      axe.push(f);
    } else if (rid.startsWith('DET.A11Y.') || f.lane === 'deterministic') {
      det.push(f);
    } else {
      other.push(f);
    }
  }
  return { axe, det, other };
}

/**
 * @param {object} auditData
 */
export function buildA11yAuditReportMarkdown(auditData) {
  const lines = [];
  lines.push('# Forge Website Accessibility Audit Report');
  lines.push('');
  lines.push(`Generated: ${auditData.generatedAt}`);
  lines.push(
    `Compliance profile: ${auditData.complianceProfile?.label || auditData.standards?.label || '—'} ` +
      `(\`${auditData.complianceProfile?.id || auditData.standards?.presetId || ''}\`)`,
  );
  lines.push(`Axe tags: \`${auditData.standards?.standardsProfile || ''}\``);
  lines.push(
    `Rules scope: ${auditData.rulesScope?.effectiveScope || '—'} (KS-driven: ${auditData.ksDetection?.ksDriven ? 'yes' : 'no'})`,
  );
  lines.push(`Lanes: ${(auditData.lanes || []).join(', ')}`);
  lines.push('');
  lines.push(`> ${COMPLIANCE_DISCLAIMER}`);
  lines.push('');

  const summary = summarizeBySeverity(auditData.findings || []);
  lines.push('## Severity summary');
  lines.push('');
  for (const [sev, count] of Object.entries(summary)) {
    if (count) lines.push(`- **${sev}**: ${count}`);
  }
  lines.push('');

  lines.push(...buildCoverageMapSection(auditData));
  lines.push(...buildTraceabilitySection(auditData));

  lines.push('## KS detection');
  lines.push('');
  lines.push('```json');
  lines.push(JSON.stringify(auditData.ksDetection || {}, null, 2));
  lines.push('```');
  lines.push('');

  lines.push('## Crawl');
  lines.push('');
  lines.push('```json');
  lines.push(JSON.stringify(auditData.crawlSummary || {}, null, 2));
  lines.push('```');
  lines.push('');

  const { axe, det, other } = groupFindingsByLane(auditData.findings || []);

  const renderFinding = (f) => {
    const block = [];
    block.push(`### ${f.severity} — ${f.ruleId || f.checkId || 'finding'}`);
    block.push('');
    block.push(f.message || '');
    block.push('');
    if (f.evidence) block.push(`Evidence: ${f.evidence}`);
    if (f.remediation) block.push(`Remediation: ${f.remediation}`);
    block.push('');
    return block;
  };

  if (axe.length) {
    lines.push('## Findings — axe lane (sample)');
    lines.push('');
    for (const f of axe.slice(0, 40)) lines.push(...renderFinding(f));
  }

  if (det.length) {
    lines.push('## Findings — deterministic lane (sample)');
    lines.push('');
    for (const f of det.slice(0, 40)) lines.push(...renderFinding(f));
  }

  if (other.length) {
    lines.push('## Findings — other (sample)');
    lines.push('');
    for (const f of other.slice(0, 20)) lines.push(...renderFinding(f));
  }

  const totalShown = Math.min(axe.length, 40) + Math.min(det.length, 40) + Math.min(other.length, 20);
  const totalFindings = (auditData.findings || []).length;
  if (totalFindings > totalShown) {
    lines.push(`_… ${totalFindings - totalShown} additional findings in a11y-audit-data.json_`);
    lines.push('');
  }

  if ((auditData.aiRulesEligible || []).length) {
    lines.push('## AI rules eligible this run');
    lines.push('');
    for (const id of auditData.aiRulesEligible) lines.push(`- ${id}`);
    lines.push('');
  }

  return `${lines.join('\n')}\n`;
}
