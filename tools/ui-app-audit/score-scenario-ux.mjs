#!/usr/bin/env node
/**
 * Lightweight scenario UX scorecard from audit-data.json (no crawl).
 */
import fs from 'node:fs/promises';
import path from 'node:path';

import { isMajorPlus } from '../website-ux-auditor/lib/severity.js';
import { evaluateStudioQualityGate } from './lib/studio-quality-gate.mjs';

function parseArgs(argv) {
  const opts = { audit: '', out: '' };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--audit' && argv[i + 1]) opts.audit = path.resolve(argv[++i]);
    else if (a === '--out' && argv[i + 1]) opts.out = path.resolve(argv[++i]);
  }
  return opts;
}

async function main() {
  const opts = parseArgs(process.argv);
  if (!opts.audit) {
    console.error('score-scenario-ux: --audit required');
    process.exit(2);
  }
  const auditData = JSON.parse(await fs.readFile(opts.audit, 'utf8'));
  const findings = auditData.findings || [];
  const majorPlus = findings.filter((f) => isMajorPlus(f.severity)).length;

  const appRepo = auditData.appRepo || path.dirname(path.dirname(opts.audit));
  const waiversPath =
    process.env.FORGE_STUDIO_WAIVERS_PATH ||
    path.join(appRepo, 'docs', 'studio', 'sealed-audit-waivers.yaml');
  const qualityGate =
    auditData.qualityGate ||
    (await evaluateStudioQualityGate(findings, { waiversPath }));

  const byLane = { legacy: 0, uxDet: 0, a11yDet: 0, axe: 0, other: 0 };
  for (const f of findings) {
    if (f.ruleId?.startsWith('DET.') && f.lane === 'deterministic') {
      if (f.checkId === 'a11y-rule-runtime' || String(f.ruleId).includes('A11Y')) byLane.a11yDet++;
      else byLane.uxDet++;
    } else if (f.checkId === 'axe-lane' || f.ruleId?.startsWith('AXE.')) byLane.axe++;
    else if (f.checkId === 'app-shell-inner') byLane.legacy++;
    else byLane.other++;
  }

  const score = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    sourceAuditRunId: auditData.auditRunId,
    planId: auditData.planId,
    siteKind: auditData.siteKind || 'a11y-studio',
    scenariosTotal: auditData.crawlSummary?.scenariosTotal ?? 0,
    findingsTotal: findings.length,
    majorPlusTotal: majorPlus,
    findingsByLane: byLane,
    qualityGate,
    passGate: qualityGate.pass,
  };

  const outDir = opts.out ? path.dirname(opts.out) : path.dirname(opts.audit);
  const outPath = opts.out || path.join(outDir, 'studio-ux-quality-score.json');
  await fs.writeFile(outPath, `${JSON.stringify(score, null, 2)}\n`, 'utf8');
  console.error(
    `score-scenario-ux: wrote ${outPath} majorPlus=${majorPlus} qualityGate=${qualityGate.pass ? 'pass' : 'fail'}`,
  );
  if (!qualityGate.pass) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
