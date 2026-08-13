#!/usr/bin/env node
/** Score gate evaluation for Studio UX PDCA cycles. */

import fs from "node:fs";
import path from "node:path";

const DEFAULT_THRESHOLDS = {
  overall: 75,
  improvement_delta: 10,
  absolute_pass: 85,
};

export function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

export function evaluateScoreGate({ before, after, thresholds = {}, minScores = {} }) {
  const t = { ...DEFAULT_THRESHOLDS, ...thresholds };
  const minOverall = minScores.overall ?? t.overall;
  const beforeOverall = Number(before?.overall ?? 0);
  const afterOverall = Number(after?.overall ?? 0);
  const delta = afterOverall - beforeOverall;
  const axes = ["enterprise_ux", "human_friendliness", "wiki_functionality"];
  const allAxesPass = axes.every((k) => Number(after?.[k] ?? 0) >= t.absolute_pass);
  const improved =
    afterOverall >= minOverall &&
    (delta >= t.improvement_delta || afterOverall >= t.absolute_pass);
  const absolutePass = afterOverall >= t.absolute_pass && allAxesPass;
  return {
    before_overall: beforeOverall,
    after_overall: afterOverall,
    delta,
    min_overall: minOverall,
    thresholds: t,
    score_ok: improved || absolutePass,
    absolute_pass: absolutePass,
    reason: improved
      ? delta >= t.improvement_delta
        ? `improvement ${delta.toFixed(1)} >= ${t.improvement_delta}`
        : `absolute ${afterOverall} >= ${t.absolute_pass}`
      : `after ${afterOverall} < min ${minOverall} or delta ${delta.toFixed(1)} < ${t.improvement_delta}`,
  };
}

export function aggregateGates({ scoreGate, pytestOk, playwrightOk, dualWikiOk, deterministicOk }) {
  const passed =
    Boolean(scoreGate?.score_ok) &&
    Boolean(pytestOk) &&
    Boolean(playwrightOk) &&
    Boolean(deterministicOk) &&
    (dualWikiOk === undefined || dualWikiOk === true);
  return {
    pytest_ok: Boolean(pytestOk),
    playwright_ok: Boolean(playwrightOk),
    dual_wiki_ok: dualWikiOk !== false,
    score_ok: Boolean(scoreGate?.score_ok),
    deterministic_ok: Boolean(deterministicOk),
    passed,
  };
}

function main() {
  const scoresPath = process.argv[2];
  const outPath = process.argv[3];
  if (!scoresPath || !outPath) {
    console.error("usage: gates.mjs <scores.json> <out-gates.json> [--thresholds JSON]");
    process.exit(2);
  }
  const scores = loadJson(scoresPath);
  let thresholds = {};
  const idx = process.argv.indexOf("--thresholds");
  if (idx !== -1 && process.argv[idx + 1]) {
    thresholds = JSON.parse(process.argv[idx + 1]);
  }
  const scoreGate = evaluateScoreGate({
    before: scores.before,
    after: scores.after,
    thresholds,
    minScores: scores.min_scores ?? {},
  });
  const gates = aggregateGates({
    scoreGate,
    pytestOk: scores.pytest_ok,
    playwrightOk: scores.playwright_ok,
    dualWikiOk: scores.dual_wiki_ok,
    deterministicOk: scores.deterministic_ok !== false,
  });
  const payload = { score_gate: scoreGate, gates, updated_at: new Date().toISOString() };
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(JSON.stringify(payload));
  process.exit(gates.passed ? 0 : 1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
