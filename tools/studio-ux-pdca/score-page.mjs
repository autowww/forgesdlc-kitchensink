#!/usr/bin/env node
/** Deterministic Studio UX scoring (DET subset + density/IA). */
import fs from "node:fs";
import path from "node:path";

function normalizeLabel(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function scoreFromPageJson(pageJson) {
  const findings = [];
  let score = 100;

  const h1 = pageJson.h1 || "";
  if (!h1) {
    findings.push({ severity: "major", rule: "DET.STUDIO.H1", message: "Missing visible H1" });
    score -= 15;
  }

  const rail = pageJson.active_rail_label || "";
  if (h1 && rail && normalizeLabel(h1) !== normalizeLabel(rail)) {
    findings.push({
      severity: "critical",
      rule: "DET.STUDIO.TITLE_NAV_MATCH",
      message: `H1 "${h1}" does not match active rail "${rail}"`,
    });
    score -= 25;
  }

  const h2 = pageJson.h2_count ?? 0;
  const hasTabs = Boolean(pageJson.has_tablist);
  if (!hasTabs && h2 > 4) {
    findings.push({
      severity: "major",
      rule: "DET.STUDIO.JOB_BUDGET",
      message: `${h2} H2 sections without tablist — competing jobs on one scroll`,
    });
    score -= 20;
  } else if (!hasTabs && h2 > 2) {
    findings.push({
      severity: "warn",
      rule: "DET.STUDIO.JOB_BUDGET",
      message: `${h2} H2 sections without mode tabs`,
    });
    score -= 10;
  }

  const maxRow = pageJson.max_action_row_buttons ?? 0;
  if (maxRow > 3) {
    findings.push({
      severity: "major",
      rule: "DET.BUTTON.GROUP.MAX",
      message: `Action row has ${maxRow} buttons (max 3)`,
    });
    score -= 15;
  }

  const primary = pageJson.primary_cta_count ?? 0;
  if (primary > 1) {
    findings.push({
      severity: "major",
      rule: "DET.APP.PRIMARY_CTA",
      message: `${primary} primary CTAs visible (max 1)`,
    });
    score -= 12;
  }

  const lead = (pageJson.lead_text || "").toLowerCase();
  const mechanism = /\b(harvest|api|pipeline|edgar|tv |xbrl|multi-select)\b/.test(lead);
  const outcome = /\b(find|compare|track|review|watch|list|monitor|open)\b/.test(lead);
  if (lead && mechanism && !outcome) {
    findings.push({
      severity: "warn",
      rule: "DET.STUDIO.MECHANISM_LEAD",
      message: "Lead copy is mechanism-first without outcome language",
    });
    score -= 8;
  }

  const scrollH = pageJson.scroll_height ?? 0;
  const shotH = pageJson.screenshot_height ?? 0;
  if (scrollH > 900 && shotH > 0 && shotH < scrollH * 0.9 && !pageJson.capture_capped) {
    findings.push({
      severity: "critical",
      rule: "DET.STUDIO.FULLPAGE_SHOT",
      message: `Screenshot height ${shotH} << scroll height ${scrollH}`,
    });
    score -= 20;
  }

  if ((pageJson.ks_hash_count ?? 0) < 1) {
    findings.push({ severity: "warn", rule: "DET.STUDIO.HASH", message: "No data-ks-hash on page" });
    score -= 5;
  }
  if ((pageJson.testid_count ?? 0) < 1) {
    findings.push({ severity: "minor", rule: "DET.STUDIO.TESTID", message: "No data-testid anchors" });
    score -= 3;
  }

  const blocker = findings.filter((f) => f.severity === "blocker").length;
  const critical = findings.filter((f) => f.severity === "critical").length;
  score = Math.max(0, Math.min(100, score));
  return { score, findings, blocker, critical, deterministic_ok: blocker === 0 && critical === 0 };
}

function main() {
  const cycleDir = process.argv[2];
  const outPath = process.argv[3] || path.join(cycleDir, "scores.json");
  if (!cycleDir) {
    console.error("usage: score-page.mjs <cycleDir> [outPath]");
    process.exit(2);
  }
  const beforePath = path.join(cycleDir, "page.json");
  const afterPath = path.join(cycleDir, "after-page.json");
  let before = { overall: 0 };
  let after = { overall: 0 };
  let deterministic = { deterministic_ok: true, findings: [] };

  if (fs.existsSync(beforePath)) {
    const page = JSON.parse(fs.readFileSync(beforePath, "utf8"));
    const b = scoreFromPageJson(page);
    before = {
      enterprise_ux: b.score,
      human_friendliness: Math.max(0, b.score - 5),
      wiki_functionality: b.score,
      page_identity: b.findings.some((f) => f.rule === "DET.STUDIO.TITLE_NAV_MATCH") ? Math.min(40, b.score) : b.score,
      job_budget: b.findings.some((f) => f.rule === "DET.STUDIO.JOB_BUDGET") ? Math.min(45, b.score) : b.score,
      control_density: b.findings.some((f) => f.rule === "DET.BUTTON.GROUP.MAX" || f.rule === "DET.APP.PRIMARY_CTA")
        ? Math.min(50, b.score)
        : b.score,
      overall: b.score,
    };
    if (!fs.existsSync(afterPath)) {
      deterministic = b;
    }
  }

  if (fs.existsSync(afterPath)) {
    const page = JSON.parse(fs.readFileSync(afterPath, "utf8"));
    deterministic = scoreFromPageJson(page);
    after = {
      enterprise_ux: deterministic.score,
      human_friendliness: Math.max(0, deterministic.score - 5),
      wiki_functionality: deterministic.score,
      page_identity: deterministic.findings.some((f) => f.rule === "DET.STUDIO.TITLE_NAV_MATCH")
        ? Math.min(40, deterministic.score)
        : deterministic.score,
      job_budget: deterministic.findings.some((f) => f.rule === "DET.STUDIO.JOB_BUDGET")
        ? Math.min(45, deterministic.score)
        : deterministic.score,
      control_density: deterministic.findings.some(
        (f) => f.rule === "DET.BUTTON.GROUP.MAX" || f.rule === "DET.APP.PRIMARY_CTA",
      )
        ? Math.min(50, deterministic.score)
        : deterministic.score,
      overall: deterministic.score,
    };
  } else if (fs.existsSync(path.join(cycleDir, "assessment.json"))) {
    const assessment = JSON.parse(fs.readFileSync(path.join(cycleDir, "assessment.json"), "utf8"));
    if (assessment.scores) {
      after = { ...assessment.scores };
      before = assessment.prior_scores ?? before;
    }
  }

  const payload = {
    before,
    after,
    deterministic_findings: deterministic.findings,
    deterministic_ok: deterministic.deterministic_ok,
    ruleset_pack: "forge-enterprise-app-pdca",
    ruleset_path: "tools/studio-ux-pdca/lib/enterprise-app-ruleset.json",
  };
  fs.writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(JSON.stringify(payload));
}

main();
