# Learn 101 meta-agent — prompt/runner analysis (one shot)

You are analyzing **why the product remediation Cursor agent failed** to clear a single deterministic UX rule on one handbook page. Do **not** fix the Fleet website product in this task.

## Context

| Field | Value |
|-------|--------|
| Rule ID | `{{RULE_ID}}` |
| Target URL | `{{PAGE_URL}}` |
| Page HTML file | `{{PAGE_HTML}}` |
| Campaign OUT_DIR | `{{OUT_DIR}}` |
| Rule artifacts dir | `{{RULE_DIR}}` |

## Structured findings (still present after remediation)

Read `{{FINDINGS_JSON_PATH}}` (JSON array).

## Artifacts to read (in order)

1. `{{RULE_DIR}}/remediation.prompt.md` — what the product agent was told
2. `{{RULE_DIR}}/remediation-agent.log` — product agent transcript (if present)
3. `{{RULE_DIR}}/forge-ux-remediation.plan.md` — plan YAML
4. `{{OWNERSHIP_PATH}}` — root-cause ownership map
5. Rule handbook (if exists): `{{RULE_HANDBOOK_PATH}}`
6. `{{RULE_DIR}}/audit-report.md` — full audit table (if present)

## Your deliverable

Write **`{{PROPOSAL_PATH}}`** (Markdown) with these sections:

### 1. Failure classification

Choose one primary label:

- **product-blocked** — fix requires large IA/nav/chrome refactor; agent scope was unrealistic for one page
- **prompt-gap** — agent had wrong/missing instructions (layer, paths, verify steps)
- **runner-gap** — `cursor-agent-run-ux-plan.sh` AGENT_PROMPT or plan-runner rule insufficient
- **rule-gap** — DET check false positive/negative or threshold wrong for handbook-inner pages

### 2. What the product agent did wrong (evidence)

Bullet list citing log lines or missing edits.

### 3. Recommended changes (orchestration/prompts only)

For each recommendation, give **file path** + **concrete edit** (snippet or replacement text). Allowed targets:

- `forgesdlc-kitchensink/tools/website-ux-auditor/auditor-tests/invoke-learn-101-per-rule-loop.sh` (`write_rule_plan`, headers)
- `forgesdlc-kitchensink/tools/website-ux-auditor/cursor-agent-run-ux-plan.sh` (`AGENT_PROMPT`)
- `.cursor/rules/forge-ux-remediation-plan-runner.mdc`
- `forgesdlc-kitchensink/docs/design/ux-audit/rule-pages/<slug>.md`
- `forgesdlc-kitchensink/tools/website-ux-auditor/design-rules/deterministic/generated/<check>.js` (cite only; no blender)

Do **not** recommend auto-applying edits. Do **not** edit repos in this run except writing `{{PROPOSAL_PATH}}`.

### 4. Re-run hint

One command line to re-test this rule after humans apply recommendations.

## Constraints

- Single page only: `{{PAGE_HTML}}`
- One meta attempt; be specific and actionable
- If classification is **product-blocked**, say so clearly and list minimal product levers from OWNERSHIP.md
