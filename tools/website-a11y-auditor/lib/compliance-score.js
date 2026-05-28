import fs from 'node:fs';
import path from 'node:path';

import { STANDARDS_PACKS_DIR } from './build-standards-pack.js';
import { resolveRtmProfileId } from './build-traceability-matrix.js';
import { getComplianceProfile } from './compliance-profiles.js';

/**
 * @param {string} profileOrPath
 */
export function loadStandardsPack(profileOrPath) {
  const raw = String(profileOrPath || '').trim();
  if (!raw) throw new Error('pack profile id or path required');

  let packPath = raw;
  if (!raw.endsWith('.json') && !raw.includes(path.sep)) {
    const rtmId = resolveRtmProfileId(raw);
    packPath = path.join(STANDARDS_PACKS_DIR, `${rtmId}.pack.json`);
  } else if (!path.isAbsolute(raw)) {
    packPath = path.resolve(raw);
  }

  if (!fs.existsSync(packPath)) {
    throw new Error(`Standards pack not found: ${packPath} (run npm run blend-rules)`);
  }
  return JSON.parse(fs.readFileSync(packPath, 'utf8'));
}

/**
 * @param {object} pack
 */
export function buildRuleToCriteriaMap(pack) {
  /** @type {Map<string, Set<string>>} */
  const map = new Map();
  for (const entry of pack.rulesIndex || []) {
    const set = map.get(entry.ruleId) || new Set();
    for (const sc of entry.wcagCriteria || []) set.add(sc);
    map.set(entry.ruleId, set);
  }
  for (const c of pack.criteria || []) {
    for (const lane of ['axe', 'det', 'ai']) {
      for (const ruleId of c.rules?.[lane] || []) {
        const set = map.get(ruleId) || new Set();
        set.add(c.id);
        map.set(ruleId, set);
      }
    }
  }
  return map;
}

/**
 * Classify a finding into axe | det | ai for compliance rollup.
 * @param {object} finding
 */
export function classifyFindingLane(finding) {
  const ruleId = String(finding.ruleId || finding.checkId || '').trim();
  if (ruleId.startsWith('AI.') || finding.lane === 'ai') return 'ai';
  if (
    ruleId.startsWith('AXE.') ||
    finding.checkId === 'axe-lane' ||
    finding.lane === 'axe'
  ) {
    return 'axe';
  }
  if (ruleId.startsWith('DET.A11Y.') || finding.lane === 'deterministic') return 'det';
  return 'other';
}

/**
 * @param {object[]} failingFindings
 */
export function failingRulesByLane(failingFindings) {
  const out = { axe: [], det: [], ai: [], other: [] };
  for (const f of failingFindings || []) {
    const lane = classifyFindingLane(f);
    const ruleId = String(f.ruleId || f.checkId || '').trim();
    if (!ruleId) continue;
    const key = lane === 'other' ? 'other' : lane;
    if (!out[key].includes(ruleId)) out[key].push(ruleId);
  }
  return out;
}

/**
 * @param {object[]} findings
 * @param {Map<string, Set<string>>} ruleToCriteria
 */
export function mapFindingsToCriteria(findings, ruleToCriteria) {
  /** @type {Map<string, object[]>} */
  const byCriterion = new Map();
  for (const f of findings || []) {
    const ruleId = String(f.ruleId || f.checkId || '').trim();
    if (!ruleId) continue;
    const criteria = ruleToCriteria.get(ruleId);
    if (!criteria?.size) continue;
    for (const sc of criteria) {
      const list = byCriterion.get(sc) || [];
      list.push(f);
      byCriterion.set(sc, list);
    }
  }
  return byCriterion;
}

/**
 * @param {object} pack
 * @param {Map<string, object[]>} findingsByCriterion
 */
export function computeCriteriaResults(pack, findingsByCriterion) {
  return (pack.criteria || []).map((c) => {
    const uncovered = (pack.validation?.uncoveredCriteria || []).includes(c.id);
    if (uncovered) {
      return {
        id: c.id,
        title: c.title,
        level: c.level,
        status: 'automation_gap',
        tooling: c.tooling || [],
        failingRules: [],
        findingCount: 0,
      };
    }

    if ((c.tooling || []).includes('manual') && !(c.tooling || []).some((t) => t === 'axe' || t === 'det')) {
      return {
        id: c.id,
        title: c.title,
        level: c.level,
        status: 'manual',
        tooling: c.tooling || [],
        failingRules: [],
        findingCount: 0,
      };
    }

    const findings = findingsByCriterion.get(c.id) || [];
    const failing = findings.filter((f) => {
      const sev = String(f.severity || 'minor').toLowerCase();
      return sev === 'blocker' || sev === 'critical' || sev === 'major';
    });
    if (failing.length) {
      const failingRules = [...new Set(failing.map((f) => f.ruleId).filter(Boolean))];
      const failingByLane = failingRulesByLane(failing);
      return {
        id: c.id,
        title: c.title,
        level: c.level,
        status: 'fail',
        tooling: c.tooling || [],
        failingRules,
        failingByLane: {
          axe: failingByLane.axe,
          det: failingByLane.det,
          ai: failingByLane.ai,
        },
        findingCount: findings.length,
      };
    }

    if (findings.length) {
      return {
        id: c.id,
        title: c.title,
        level: c.level,
        status: 'pass_with_warnings',
        tooling: c.tooling || [],
        failingRules: [],
        findingCount: findings.length,
      };
    }

    return {
      id: c.id,
      title: c.title,
      level: c.level,
      status: 'pass',
      tooling: c.tooling || [],
      failingRules: [],
      findingCount: 0,
    };
  });
}

/**
 * @param {ReturnType<typeof computeCriteriaResults>} criteriaResults
 * @param {object} pack
 */
export function computeComplianceScore(criteriaResults, pack) {
  const total = criteriaResults.length || 1;
  let passOrManual = 0;
  let penalty = 0;

  for (const row of criteriaResults) {
    if (row.status === 'pass' || row.status === 'pass_with_warnings' || row.status === 'manual') {
      passOrManual += 1;
    } else if (row.status === 'fail') {
      penalty += 8;
    } else if (row.status === 'automation_gap') {
      penalty += 2;
    }
  }

  const baseScore = (passOrManual / total) * 100;
  const complianceScore = Math.max(0, Math.min(100, Math.round((baseScore - penalty) * 10) / 10));

  return {
    complianceScore,
    automationCoveragePercent: pack.summary?.automationCoveragePercent ?? 0,
    criteriaTotal: total,
    criteriaPass: criteriaResults.filter((r) => r.status === 'pass' || r.status === 'pass_with_warnings')
      .length,
    criteriaFail: criteriaResults.filter((r) => r.status === 'fail').length,
    criteriaManual: criteriaResults.filter((r) => r.status === 'manual').length,
    criteriaAutomationGap: criteriaResults.filter((r) => r.status === 'automation_gap').length,
    penaltyPoints: penalty,
  };
}

/**
 * @param {object} pack
 * @param {object[]} [findings]
 */
export function buildComplianceReport(pack, findings = null) {
  const profileDef = getComplianceProfile(pack.packId);
  const ruleToCriteria = buildRuleToCriteriaMap(pack);
  const findingsByCriterion = findings ? mapFindingsToCriteria(findings, ruleToCriteria) : new Map();
  const criteriaResults = computeCriteriaResults(pack, findingsByCriterion);
  const scores = computeComplianceScore(criteriaResults, pack);

  return {
    generatedAt: new Date().toISOString(),
    packId: pack.packId,
    packLabel: pack.label,
    wcagVersion: pack.wcagVersion,
    level: pack.level,
    specUrl: pack.specUrl,
    disclaimer: pack.disclaimer,
    mode: findings ? 'site' : 'pack_only',
    complianceProfile: profileDef
      ? { id: profileDef.id, label: profileDef.label, wcagVersion: profileDef.wcagVersion, level: profileDef.level }
      : { id: pack.packId, label: pack.label },
    ...scores,
    packSummary: pack.summary,
    criteriaResults,
    validation: pack.validation,
  };
}

/**
 * @param {object} report
 */
export function renderComplianceScoreMarkdown(report) {
  const lines = [];
  lines.push('# Accessibility compliance score');
  lines.push('');
  lines.push(`> ${report.disclaimer || ''}`);
  lines.push('');
  lines.push(`**Pack:** ${report.packLabel} (\`${report.packId}\`)`);
  lines.push(`**Mode:** ${report.mode}`);
  if (report.mode === 'site') {
    lines.push(`**Compliance score:** ${report.complianceScore} / 100`);
  }
  lines.push(`**Automation coverage (design-time):** ${report.automationCoveragePercent}%`);
  lines.push('');
  lines.push('| Metric | Count |');
  lines.push('|--------|------:|');
  lines.push(`| Success criteria | ${report.criteriaTotal} |`);
  lines.push(`| Pass | ${report.criteriaPass} |`);
  lines.push(`| Fail | ${report.criteriaFail} |`);
  lines.push(`| Manual expected | ${report.criteriaManual} |`);
  lines.push(`| Automation gap | ${report.criteriaAutomationGap} |`);
  lines.push('');
  lines.push('## Criteria');
  lines.push('');
  lines.push('| SC | Status | Tooling | Failing rules |');
  lines.push('|----|--------|---------|---------------|');
  for (const row of report.criteriaResults || []) {
    const rules = row.failingRules?.length ? row.failingRules.join(', ') : '—';
    lines.push(`| ${row.id} | ${row.status} | ${(row.tooling || []).join('+') || '—'} | ${rules} |`);
  }
  lines.push('');

  const failingRows = (report.criteriaResults || []).filter((r) => r.status === 'fail');
  if (failingRows.length && report.mode === 'site') {
    lines.push('## Failures by lane');
    lines.push('');
    for (const row of failingRows) {
      const by = row.failingByLane || {};
      const parts = [];
      if (by.axe?.length) parts.push(`axe: ${by.axe.join(', ')}`);
      if (by.det?.length) parts.push(`det: ${by.det.join(', ')}`);
      if (by.ai?.length) parts.push(`ai: ${by.ai.join(', ')}`);
      lines.push(`- **${row.id}** — ${parts.length ? parts.join('; ') : row.failingRules?.join(', ') || '—'}`);
    }
    lines.push('');
  }

  if (report.auditDataPath) {
    lines.push(`Findings source: \`${report.auditDataPath}\``);
    lines.push('');
  }

  return lines.join('\n');
}
