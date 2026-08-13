#!/usr/bin/env node
/**
 * Load enterprise app UX ruleset for Studio UX PDCA (GPT prompt + scorer validation).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_RULESET_PATH = path.join(__dirname, "enterprise-app-ruleset.json");

let _cached = null;

export function loadEnterpriseAppRuleset(rulesetPath = DEFAULT_RULESET_PATH) {
  if (_cached && _cached._path === rulesetPath) {
    return _cached.data;
  }
  const raw = fs.readFileSync(rulesetPath, "utf8");
  const data = JSON.parse(raw);
  const byId = new Map(data.rules.map((r) => [r.id, r]));
  _cached = { _path: rulesetPath, data: { ...data, byId } };
  return _cached.data;
}

export function ruleIdsInPack(ruleset = loadEnterpriseAppRuleset()) {
  return ruleset.rules.map((r) => r.id);
}

export function isAllowedRuleId(ruleId, ruleset = loadEnterpriseAppRuleset()) {
  if (ruleId == null || ruleId === "null" || ruleId === "") return true;
  return ruleset.byId.has(ruleId);
}

export function handbookUrl(ruleId, ksPublicBase, ruleset = loadEnterpriseAppRuleset()) {
  const row = ruleset.byId.get(ruleId);
  if (!row?.handbookSlug) return null;
  const base = (ksPublicBase || "https://ks.forgesdlc.com").replace(/\/$/, "");
  return `${base}/cases/showcase/ux-audit-rules/${row.handbookSlug}.html`;
}

/**
 * Markdown appendix for ChatGPT / Cursor prompts.
 */
export function formatRulesetPromptAppendix(ksPublicBase, ruleset = loadEnterpriseAppRuleset()) {
  const base = (ksPublicBase || "https://ks.forgesdlc.com").replace(/\/$/, "");
  const lines = [
    "## Enterprise app UX ruleset (Studio PDCA pack)",
    "",
    `Canonical standard: \`${ruleset.standardPath}\``,
    `ENT.APP contracts: \`${ruleset.enterpriseAppContractsPath || "docs/design/enterprise-app/README.md"}\``,
    `Rule catalog index: ${base}/cases/showcase/ux-audit-rules.html`,
    "",
    "Cite **only** rule IDs from this closed pack (or `null` when no rule applies):",
    "",
    "| Rule ID | Axis | Lane | Remediation | Handbook |",
    "|---------|------|------|-------------|----------|",
  ];
  for (const r of ruleset.rules) {
    const url = handbookUrl(r.id, base, ruleset);
    const link = url ? `[open](${url})` : "—";
    const ks = r.suggestedKsComponent || "—";
    lines.push(
      `| \`${r.id}\` | ${r.axis} | ${r.lane} | ${ks} | ${link} |`,
    );
  }
  lines.push(
    "",
    "### KS remediation components (closed list)",
    "",
    ...ruleset.ksComponents.map((c) => `- **${c.id}** — ${c.name}. ${c.useWhen}.`),
    "",
    "### Axis weights",
    "",
    "`overall` = weighted mean of page_identity, job_budget, control_density, human_outcome, wiki_functionality (equal weights).",
    "On non-wiki pages, score wiki_functionality as 100 (N/A).",
    "`enterprise_ux` ≈ mean(page_identity, job_budget, control_density).",
    "",
    "Studio pages use **`DET.STUDIO.JOB_BUDGET`**, not marketing **`DET.SECTION.SINGLE_JOB`**.",
  );
  return lines.join("\n");
}

export function scorerRuleIds(ruleset = loadEnterpriseAppRuleset()) {
  return ruleset.rules.filter((r) => r.scorer).map((r) => r.id);
}
