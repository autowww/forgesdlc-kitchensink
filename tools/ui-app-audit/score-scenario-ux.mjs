#!/usr/bin/env node
/**
 * Scenario UX scorecard from audit-data.json (dimension-based, comparable to website scorer).
 */
import fs from 'node:fs/promises';
import path from 'node:path';

import { isMajorPlus } from '../website-ux-auditor/lib/severity.js';
import {
  evaluateStudioQualityGates,
  resolveStudioGateMode,
} from './lib/studio-quality-gate.mjs';
import {
  buildScenarioUxScoreMarkdown,
  compareScenarioUxScores,
  computeScenarioUxScores,
  formatScenarioUxScoreLoopDeltaVerbalParagraph,
} from './lib/scenario-ux-score.mjs';

const LOOP_DELTA_FILENAME = 'studio-ux-quality-score-loop-delta.json';
const PREVIOUS_FILENAME = 'studio-ux-quality-score.previous.json';

function parseArgs(argv) {
  const opts = { audit: '', out: '' };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--audit' && argv[i + 1]) opts.audit = path.resolve(argv[++i]);
    else if (a === '--out' && argv[i + 1]) opts.out = path.resolve(argv[++i]);
  }
  return opts;
}

async function fileExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
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
  const gates =
    auditData.qualityGate && auditData.uxQualityGate
      ? {
          mode: auditData.gateMode || resolveStudioGateMode(),
          pass: auditData.gatePass ?? auditData.qualityGate.pass,
          qualityGate: auditData.qualityGate,
          uxQualityGate: auditData.uxQualityGate,
        }
      : await evaluateStudioQualityGates(findings, { waiversPath });
  const { qualityGate, uxQualityGate, mode: gateMode, pass: passGate } = gates;

  const byLane = { legacy: 0, uxDet: 0, a11yDet: 0, axe: 0, ai: 0, other: 0 };
  for (const f of findings) {
    if (f.ruleId?.startsWith('DET.') && f.lane === 'deterministic') {
      if (f.checkId === 'a11y-rule-runtime' || String(f.ruleId).includes('A11Y')) byLane.a11yDet++;
      else byLane.uxDet++;
    } else if (f.checkId === 'axe-lane' || f.ruleId?.startsWith('AXE.')) byLane.axe++;
    else if (f.checkId === 'app-shell-inner') byLane.legacy++;
    else if (String(f.lane || '').toLowerCase() === 'ai') byLane.ai++;
    else byLane.other++;
  }

  const uxScores = computeScenarioUxScores({ auditData, findings });

  const outDir = opts.out ? path.dirname(opts.out) : path.dirname(opts.audit);
  const outPath = opts.out || path.join(outDir, 'studio-ux-quality-score.json');
  const prevPath = path.join(outDir, PREVIOUS_FILENAME);
  const mdPath = path.join(outDir, 'studio-ux-quality-score.md');
  const deltaPath = path.join(outDir, LOOP_DELTA_FILENAME);

  if (await fileExists(outPath)) {
    await fs.copyFile(outPath, prevPath);
  }

  /** @type {ReturnType<typeof compareScenarioUxScores> | null} */
  let loopDelta = null;
  let verbalSummary = null;
  if (await fileExists(prevPath)) {
    try {
      const prevParsed = JSON.parse(await fs.readFile(prevPath, 'utf8'));
      const priorUx = prevParsed.uxScores;
      if (priorUx?.overall != null && priorUx.dimensions) {
        loopDelta = compareScenarioUxScores(priorUx, uxScores);
        verbalSummary = formatScenarioUxScoreLoopDeltaVerbalParagraph(loopDelta);
        if (verbalSummary) console.error(`[studio-ux-score-loop] ${verbalSummary}`);
      }
    } catch (e) {
      console.warn(
        `[studio-ux-score-loop] Could not diff vs ${PREVIOUS_FILENAME}: ${String(e?.message ?? e)}`,
      );
    }
  }

  const score = {
    schemaVersion: 2,
    generatedAt: new Date().toISOString(),
    sourceAuditRunId: auditData.auditRunId,
    planId: auditData.planId,
    siteKind: auditData.siteKind || 'a11y-studio',
    scenariosTotal: auditData.crawlSummary?.scenariosTotal ?? 0,
    findingsTotal: findings.length,
    majorPlusTotal: majorPlus,
    findingsByLane: byLane,
    gateMode,
    qualityGate,
    uxQualityGate,
    passGate,
    uxScores,
    uxScoreDelta: loopDelta
      ? {
          baselinePath: PREVIOUS_FILENAME,
          verbalSummary,
          delta: loopDelta,
        }
      : null,
  };

  await fs.writeFile(outPath, `${JSON.stringify(score, null, 2)}\n`, 'utf8');
  await fs.writeFile(mdPath, buildScenarioUxScoreMarkdown(score), 'utf8');

  const loopDeltaPayload = {
    generatedAt: score.generatedAt,
    sourceAuditRunId: score.sourceAuditRunId,
    baselinePath: loopDelta ? PREVIOUS_FILENAME : null,
    delta: loopDelta,
    verbalSummary,
  };
  await fs.writeFile(deltaPath, `${JSON.stringify(loopDeltaPayload, null, 2)}\n`, 'utf8');

  console.error(
    `score-scenario-ux: wrote ${outPath} overall=${uxScores.overall} band=${uxScores.scoreBand?.id} majorPlus=${majorPlus} gateMode=${gateMode} passGate=${passGate ? 'pass' : 'fail'} uxGate=${uxQualityGate.pass ? 'pass' : 'fail'}`,
  );
  if (!passGate) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
