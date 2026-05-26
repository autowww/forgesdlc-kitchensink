#!/usr/bin/env node
/**
 * Regenerate harness E2E coverage matrix and fixture/script test map from:
 * - registry.generated.json
 * - rule-pages.manifest.json
 * - workbench campaign state.jsonl (detection, remediation, agent, AI)
 * - rule-defect-fixtures manifest.json
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TESTS_ROOT = __dirname;
const AUDITOR_ROOT = path.resolve(TESTS_ROOT, "..");
const KS_ROOT = path.resolve(AUDITOR_ROOT, "../..");
const DEFAULT_OUT = path.join(KS_ROOT, "docs/design/ux-audit/harness");

function parseArgs(argv) {
  const opts = {
    outDir: DEFAULT_OUT,
    workbenchRoot: "",
    detectionCampaign: "",
    remediationCampaign: "",
    agentCampaign: "",
    aiCampaign: "",
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--out-dir" && argv[i + 1]) opts.outDir = path.resolve(argv[++i]);
    else if (a === "--workbench-root" && argv[i + 1])
      opts.workbenchRoot = path.resolve(argv[++i]);
    else if (a === "--detection-campaign" && argv[i + 1])
      opts.detectionCampaign = path.resolve(argv[++i]);
    else if (a === "--remediation-campaign" && argv[i + 1])
      opts.remediationCampaign = path.resolve(argv[++i]);
    else if (a === "--agent-campaign" && argv[i + 1])
      opts.agentCampaign = path.resolve(argv[++i]);
    else if (a === "--ai-campaign" && argv[i + 1]) opts.aiCampaign = path.resolve(argv[++i]);
    else if (a === "--help" || a === "-h") {
      console.log(`Usage: node generate-harness-e2e-matrix.mjs [options]

  --out-dir <path>           Default: docs/design/ux-audit/harness
  --workbench-root <path>      Default: <Code>/workbench/ux-auditor
  --detection-campaign <dir>   ux-audit/ruleset-harness-* (latest if omitted)
  --remediation-campaign <dir> ux-audit/ruleset-remediation-verify-*
  --agent-campaign <dir>       ux-audit/ruleset-agent-pilot*
  --ai-campaign <dir>          ux-audit/ai-ruleset-harness-*`);
      process.exit(0);
    }
  }
  return opts;
}

function findCodeWorkbenchRoot() {
  let dir = KS_ROOT;
  for (let i = 0; i < 8; i++) {
    const parent = path.dirname(dir);
    if (path.basename(dir) === "Code") {
      return path.join(dir, "workbench", "ux-auditor");
    }
    if (parent === dir) break;
    dir = parent;
  }
  return path.join(path.dirname(KS_ROOT), "workbench", "ux-auditor");
}

function campaignSortKey(dirPath) {
  const name = path.basename(dirPath);
  const m = name.match(/(\d{8}T\d{6}Z?|\d{8})/);
  if (m) return m[1].replace(/Z$/, "");
  const stat = fs.statSync(dirPath);
  return String(stat.mtimeMs);
}

function listCampaignDirs(uxAuditDir, prefix) {
  if (!fs.existsSync(uxAuditDir)) return [];
  return fs
    .readdirSync(uxAuditDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name.startsWith(prefix))
    .map((d) => path.join(uxAuditDir, d.name));
}

function pickLatest(dirs) {
  if (!dirs.length) return "";
  return [...dirs].sort((a, b) => campaignSortKey(a).localeCompare(campaignSortKey(b))).at(-1);
}

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function loadStateMap(campaignDir) {
  const map = new Map();
  const statePath = path.join(campaignDir, "state.jsonl");
  if (!fs.existsSync(statePath)) return map;
  const lines = fs.readFileSync(statePath, "utf8").trim().split("\n").filter(Boolean);
  for (const line of lines) {
    try {
      const row = JSON.parse(line);
      if (row.ruleId) map.set(row.ruleId, row);
    } catch {
      /* skip */
    }
  }
  return map;
}

function moduleExists(modulePath) {
  if (!modulePath) return false;
  const full = path.join(AUDITOR_ROOT, modulePath);
  return fs.existsSync(full);
}

function handbookQuality(ruleId, pagesById) {
  const page = pagesById.get(ruleId);
  if (!page) return "missing";
  const mdPath = path.join(KS_ROOT, page.mdPath || "");
  if (!fs.existsSync(mdPath)) return "missing_file";
  const text = fs.readFileSync(mdPath, "utf8");
  const modelMatch = text.match(/^agent_model:\s*(.+)$/m);
  const model = modelMatch ? modelMatch[1].trim() : page.agentModel || "";
  if (model.includes("bootstrap-missing-rule-pages")) return "bootstrap";
  if (model.includes("handbook-version-sync")) return "version_sync";
  if (model.includes("composer") || model.includes("pagegen")) return "pagegen";
  return page.status === "current" ? "pagegen" : "other";
}

function computeTier({
  lane,
  implStatus,
  detectStatus,
  remedStatus,
  agentStatus,
  fixerOk,
}) {
  if (
    detectStatus === "detection_miss" ||
    remedStatus === "remediation_fail" ||
    agentStatus === "missing_fixture"
  ) {
    return "gap";
  }
  if (agentStatus === "remediation_ok") return "agent_e2e";
  if (
    lane === "deterministic" &&
    detectStatus === "detection_ok" &&
    remedStatus === "remediation_ok" &&
    fixerOk === "Y"
  ) {
    return "fixer_e2e";
  }
  if (lane === "deterministic" && detectStatus === "detection_ok" && remedStatus === "remediation_ok") {
    return "full_e2e";
  }
  if (detectStatus === "detection_ok" && lane === "ai") return "detect_e2e";
  if (detectStatus === "detection_ok") return "detect_e2e";
  if (implStatus === "stub" || implStatus === "planned") return "catalog_only_stub";
  return "catalog_only";
}

function nextWork(tier, pageStatus, handbookQ, detectStatus, remedStatus, agentStatus) {
  if (tier === "gap") {
    if (detectStatus === "detection_miss") return "check tuning / fixture";
    if (remedStatus === "remediation_fail") return "After HTML / apply fix";
    if (agentStatus === "missing_fixture") return "set FORGE_UX_RULESET_FIXTURE_ROOT";
    return "harness investigation";
  }
  if (agentStatus === "remediation_fail" && tier === "full_e2e") {
    return "agent prompt (optional)";
  }
  if (pageStatus === "missing") return "create handbook page";
  if (tier === "catalog_only_stub") return "stub excluded from harness";
  if (pageStatus === "stale" && handbookQ === "bootstrap") return "pagegen + commit MD";
  if (tier === "catalog_only") return "implement check";
  if (tier === "detect_e2e" && handbookQ === "bootstrap") return "pagegen (optional)";
  if (tier === "full_e2e" && handbookQ === "bootstrap") return "pagegen (quality)";
  return "";
}

function escCell(s) {
  return String(s || "").replace(/\|/g, "\\|");
}

function buildRows(registry, pagesManifest, fixtureManifest, maps, opts) {
  const pagesById = new Map(pagesManifest.rules.map((r) => [r.id, r]));
  const fixtureById = new Map((fixtureManifest.rules || []).map((r) => [r.ruleId, r]));

  const rows = [];
  const detRules = registry.deterministicRules || [];
  const aiRules = registry.aiRules || [];
  const implementedSet = new Set(registry.deterministicCoverage?.implementedRuleIds || []);

  for (const rule of [...detRules, ...aiRules]) {
    const id = rule.id;
    const lane = rule.lane || (id.startsWith("AI.") ? "ai" : "deterministic");
    const page = pagesById.get(id);
    const pageStatus = page?.status || "missing";
    const implStatus =
      rule.status ||
      (implementedSet.has(id) ? "implemented" : lane === "ai" ? "generated" : "planned");
    const modPath = rule.modulePath || rule.promptPath || "";
    const checkOk = moduleExists(modPath) ? "Y" : "N";
    const fix = fixtureById.get(id);
    const fixtureMode = fix?.fixtureMode || "-";
    const detectRow = maps.detection.get(id);
    const remedRow = maps.remediation.get(id);
    const agentRow = maps.agent.get(id);
    const aiRow = maps.ai.get(id);
    const detectStatus =
      lane === "ai"
        ? aiRow?.status || "-"
        : detectRow?.status || "-";
    const remedStatus = remedRow?.status || "-";
    const agentStatus = agentRow?.status || "-";
    const fixerOk = remedRow?.fixerOk || "-";
    const agentRequired = remedRow?.agentRequired || "-";
    const hq = handbookQuality(id, pagesById);
    const tier = computeTier({
      lane,
      implStatus,
      detectStatus,
      remedStatus,
      agentStatus,
      fixerOk,
    });
    const nw = nextWork(tier, pageStatus, hq, detectStatus, remedStatus, agentStatus);
    rows.push({
      id,
      lane,
      ruleset: implStatus,
      rule_page: pageStatus,
      handbook_quality: hq,
      detection_check: checkOk,
      fixture: fixtureMode,
      auditor_detect: detectStatus,
      remediation_fix: remedStatus,
      fixer_ok: fixerOk,
      agent_required: agentRequired,
      remediation_agent: agentStatus,
      e2e_tier: tier,
      next_work: nw,
    });
  }
  return rows.sort((a, b) => a.id.localeCompare(b.id));
}

function summarize(rows) {
  const counts = {};
  for (const r of rows) {
    const key = `${r.lane}:${r.e2e_tier}`;
    counts[key] = (counts[key] || 0) + 1;
  }
  const det = rows.filter((r) => r.lane === "deterministic");
  const ai = rows.filter((r) => r.lane === "ai");
  const tierCount = (arr, tier) => arr.filter((r) => r.e2e_tier === tier).length;
  const bootstrap = rows.filter((r) =>
    ["bootstrap", "version_sync"].includes(r.handbook_quality),
  ).length;
  return { counts, det, ai, tierCount, bootstrap };
}

function renderMatrixMd(rows, summary, opts, campaigns) {
  const ts = new Date().toISOString();
  const lines = [
    "# E2E coverage matrix (ruleset harness)",
    "",
    `Generated: \`${ts}\` by \`tools/website-ux-auditor/auditor-tests/generate-harness-e2e-matrix.mjs\`.`,
    "",
    "Column keys map to [harness DoR/DoD](README.md) artifacts.",
    "",
    "## Campaign sources",
    "",
    "| Lane | Campaign directory |",
    "|------|-------------------|",
    `| DET detection | \`${campaigns.detection || "(none)"}\` |`,
    `| DET remediation fix | \`${campaigns.remediation || "(none)"}\` |`,
    `| DET agent pilot | \`${campaigns.agent || "(none)"}\` |`,
    `| AI detection | \`${campaigns.ai || "(none)"}\` |`,
    "",
    "## Summary by E2E tier",
    "",
    "| Lane | fixer_e2e | full_e2e | detect_e2e | agent_e2e | gap | catalog_only |",
    "|------|-----------|----------|------------|-----------|-----|--------------|",
    `| DET (${summary.det.length} rows) | ${summary.tierCount(summary.det, "fixer_e2e")} | ${summary.tierCount(summary.det, "full_e2e")} | ${summary.tierCount(summary.det, "detect_e2e")} | ${summary.tierCount(summary.det, "agent_e2e")} | ${summary.tierCount(summary.det, "gap")} | ${summary.tierCount(summary.det, "catalog_only_stub")} stub |`,
    `| AI (${summary.ai.length} rows) | ${summary.tierCount(summary.ai, "full_e2e")} | ${summary.tierCount(summary.ai, "detect_e2e")} | ${summary.tierCount(summary.ai, "agent_e2e")} | ${summary.tierCount(summary.ai, "gap")} | ${summary.tierCount(summary.ai, "catalog_only")} |`,
    "",
    `Handbook **bootstrap/version_sync** flag (quality, not tier): **${summary.bootstrap}** rules.`,
    "",
    "### Tier definitions",
    "",
    "| Tier | Meaning |",
    "|------|---------|",
    "| fixer_e2e | detection_ok + remediation_ok + fixer_ok (deterministic fixer lane) |",
    "| full_e2e | detection_ok + remediation_ok (DET deterministic fix; fixer_ok not recorded) |",
    "| detect_e2e | detection_ok; no DET remediation verify (AI default) |",
    "| agent_e2e | remediation_ok via --enable-agents |",
    "| gap | detection_miss, remediation_fail, missing_fixture |",
    "| catalog_only_stub | Registry stub; excluded from defect fixtures (e.g. DET.THEME.FONT_STACK) |",
    "| catalog_only | Not in implemented harness set or no campaign row |",
    "",
    "## Per-rule matrix",
    "",
    "| ruleId | lane | ruleset | rule_page | handbook_quality | detection_check | fixture | auditor_detect | remediation_fix | fixer_ok | agent_required | remediation_agent | e2e_tier | next_work |",
    "|--------|------|---------|-----------|------------------|-----------------|---------|----------------|-------------------|----------|----------------|-------------------|----------|-----------|",
  ];
  for (const r of rows) {
    lines.push(
      `| ${escCell(r.id)} | ${r.lane} | ${escCell(r.ruleset)} | ${escCell(r.rule_page)} | ${escCell(r.handbook_quality)} | ${r.detection_check} | ${escCell(r.fixture)} | ${escCell(r.auditor_detect)} | ${escCell(r.remediation_fix)} | ${escCell(r.fixer_ok)} | ${escCell(r.agent_required)} | ${escCell(r.remediation_agent)} | ${escCell(r.e2e_tier)} | ${escCell(r.next_work)} |`,
    );
  }
  lines.push("");
  return lines.join("\n");
}

function renderFixtureScriptMapMd() {
  const ts = new Date().toISOString();
  return `# Fixture and script test map

Generated: \`${ts}\` by \`generate-harness-e2e-matrix.mjs\` (static template; update script when harness scripts change).

Maps **harness scripts** to **fixture requirements** and **automated tests** for validating the tooling itself (not per-rule E2E — see [E2E-COVERAGE-MATRIX.md](E2E-COVERAGE-MATRIX.md)).

## Script matrix

| Harness script | Fixture campaign needed | Gate / assertion | Automated test |
|----------------|-------------------------|------------------|----------------|
| \`invoke-det-ruleset-harness.sh\` | Rebuild or \`--rebuild-fixtures\`; full DET manifest | \`expect-rule-detection.sh\` → \`detection_ok\` | \`invoke-det-ruleset-harness.test.sh\` |
| \`invoke-det-ruleset-remediation-verify.sh\` | Same fixture root + \`harness-minimal-assets/\` | \`run-deterministic-fixers.mjs\` (handbook_after) + audit + \`expect-rule-clean.sh\` → \`remediation_ok\` / \`fixerOk\` | \`invoke-det-ruleset-remediation-verify.test.sh\` |
| \`invoke-ai-ruleset-harness.sh\` | AI defect fixtures campaign | AI detection gate | \`invoke-ai-ruleset-harness.test.sh\` |
| \`apply-harness-fixture-remediation.py\` | Per-rule \`fixture-website/\` or campaign \`website/\` | 0 targeted findings post-apply | Indirect (remediation-verify test only) |
| \`invoke-det-ruleset-harness.sh --enable-agents\` | **Must** set \`FORGE_UX_RULESET_FIXTURE_ROOT\` to existing detection campaign | \`remediation_ok\` | \`invoke-det-ruleset-harness-agent.test.sh\` |
| \`invoke-det-ruleset-handbook-upgrade.sh\` | None (repo Markdown only) | pagegen manifest \`current\` | \`invoke-det-ruleset-handbook-upgrade.test.sh\` |
| \`invoke-sync-handbook-versions.sh\` | None | manifest \`current\` | \`invoke-sync-handbook-versions.test.sh\` |
| \`generator/build_rule_defect_fixtures.py\` | Valid Before HTML in handbook | \`manifest.json\` + fail HTML | \`build-rule-defect-fixtures.test.sh\` |
| \`expect-rule-detection.sh\` / \`expect-rule-clean.sh\` | \`audit-data.json\` from prior loop step | exit 0 / 1 | Used inside harness tests |
| \`run-deterministic-fixers.mjs\` | Harness \`fixture-website/\` or production \`audit-data.json\` | \`deterministic-fixer-report.json\` | \`run-deterministic-fixers.test.sh\` |

## Known gaps

1. **Agent loop** (\`--enable-agents\`) still depends on Cursor quota; CI uses apply+clean smoke only.
2. **Full pagegen** for 28+ rules remains optional when \`invoke-sync-handbook-versions.sh\` suffices.
3. **Workbench-only fixtures** — full 50-rule campaigns are gitignored; CI tests use smaller fixtures or dry-run paths (see each \`*.test.sh\`).
4. Optional follow-up: committed \`auditor-tests/fixtures/golden/\` for offline tests without workbench (not implemented).

## Regenerate E2E rule matrix

\`\`\`bash
cd tools/website-ux-auditor/auditor-tests
node generate-harness-e2e-matrix.mjs
\`\`\`
`;
}

function main() {
  const opts = parseArgs(process.argv);
  const wb =
    opts.workbenchRoot || process.env.FORGE_UX_AUDIT_WORKBENCH_ROOT || findCodeWorkbenchRoot();
  const uxAudit = path.join(wb, "ux-audit");
  const fixturesRoot = path.join(wb, "rule-defect-fixtures");

  const detectionDir =
    opts.detectionCampaign || pickLatest(listCampaignDirs(uxAudit, "ruleset-harness-"));
  const remediationDir =
    opts.remediationCampaign ||
    pickLatest(listCampaignDirs(uxAudit, "ruleset-remediation-verify-"));
  const agentDir =
    opts.agentCampaign || pickLatest(listCampaignDirs(uxAudit, "ruleset-agent-pilot"));
  const aiDir = opts.aiCampaign || pickLatest(listCampaignDirs(uxAudit, "ai-ruleset-harness-"));

  const registry = loadJson(path.join(AUDITOR_ROOT, "design-rules/registry.generated.json"));
  const pagesManifest = loadJson(
    path.join(KS_ROOT, "docs/design/ux-audit/rule-pages/rule-pages.manifest.json"),
  );

  let fixtureManifest = { rules: [] };
  if (detectionDir) {
    const base = path.basename(detectionDir);
    const manifestPath = path.join(fixturesRoot, base, "manifest.json");
    if (fs.existsSync(manifestPath)) fixtureManifest = loadJson(manifestPath);
  }

  const maps = {
    detection: detectionDir ? loadStateMap(detectionDir) : new Map(),
    remediation: remediationDir ? loadStateMap(remediationDir) : new Map(),
    agent: agentDir ? loadStateMap(agentDir) : new Map(),
    ai: aiDir ? loadStateMap(aiDir) : new Map(),
  };

  const rows = buildRows(registry, pagesManifest, fixtureManifest, maps, opts);
  const summary = summarize(rows);

  const campaigns = {
    detection: detectionDir,
    remediation: remediationDir,
    agent: agentDir,
    ai: aiDir,
  };

  fs.mkdirSync(opts.outDir, { recursive: true });
  const matrixPath = path.join(opts.outDir, "E2E-COVERAGE-MATRIX.md");
  const mapPath = path.join(opts.outDir, "FIXTURE-SCRIPT-TEST-MAP.md");
  fs.writeFileSync(matrixPath, renderMatrixMd(rows, summary, opts, campaigns));
  fs.writeFileSync(mapPath, renderFixtureScriptMapMd());

  console.log(`Wrote ${matrixPath}`);
  console.log(`Wrote ${mapPath}`);
  console.log(
    `DET full_e2e: ${summary.tierCount(summary.det, "full_e2e")}/${summary.det.length}, AI detect_e2e: ${summary.tierCount(summary.ai, "detect_e2e")}/${summary.ai.length}`,
  );
}

main();
