# UI app audit (sealed Studio smoke)

Playwright-only pipeline for **dynamic Studio UIs**: sealed data, YAML smoke plans, pre-run traceability, scenario audit (no BFS crawl, **no MCP**).

## Commands

From `forgesdlc-kitchensink/tools/ui-app-audit/` (after `npm install`):

```bash
# 1) Traceability index (before Playwright)
node build-ui-traceability.mjs \
  --app-repo /path/to/forge-accessibility-leo \
  --smoke-plan /path/to/forge-accessibility-leo/docs/studio/smoke-plan.yaml \
  --out /path/to/ui-traceability.generated.json

# 2) Scenario audit (Studio must be running)
node run-scenario-audit.mjs \
  --site http://127.0.0.1:PORT \
  --smoke-plan /path/to/docs/studio/smoke-plan.yaml \
  --out-dir /path/to/audit-out \
  --app-repo /path/to/forge-accessibility-leo \
  --site-kind a11y-studio \
  --rules-scope app \
  --lanes axe,det,ux-det \
  --tiers smoke,demo \
  --emit-plan

# 3) Enrich findings with sources[]
node enrich-findings-traceability.mjs \
  --audit /path/to/audit-out/audit-data.json \
  --traceability /path/to/ui-traceability.generated.json

# 4) Scorecard + remediation plan (optional)
node score-scenario-ux.mjs --audit /path/to/audit-out/audit-data.json
node generate-studio-remediation-plan.mjs --audit /path/to/audit-out/audit-data.json
```

Product one-shot: [forge-accessibility-leo/scripts/run-sealed-studio-smoke.sh](../../forge-accessibility-leo/scripts/run-sealed-studio-smoke.sh).  
Remediation loop: [forge-accessibility-leo/scripts/run-sealed-studio-remediation-loop.sh](../../forge-accessibility-leo/scripts/run-sealed-studio-remediation-loop.sh).

## Studio dynamic UX ruleset

For `siteKind` `a11y-studio` / `app-shell`, scenario audit runs an **explicit allowlist** (~38 DOM rules + optional React/hash primitives) via `lib/studio-dynamic-ux-ruleset.mjs`. Repo-static rules (`DET.CONTRACT.*`, `DET.PY.*`, …) and handbook exclusions are omitted.

New dynamic rules: `DET.APP.PRIMARY_STATE`, `DET.APP.PRIMARY_CTA`, `DET.APP.DEMO_DISCLOSURE`, `DET.APP.TILE_AFFORDANCE`, `DET.APP.TAB_PANEL`.

## Studio fixers and agent (partial)

- **UX HTML fixers** — `website-ux-auditor` resolves `sources[]` and `forge_accessibility/static/` (hash → partials). Most Studio KPI/cards are JS-built; fix product code or use the agent for those.
- **Remediation loop** — `run-sealed-studio-remediation-loop.sh` runs UX `DET.*` fixers with `--skip-verify` (no per-scenario re-audit yet). Set `FORGE_STUDIO_SKIP_FIXERS=1` when the gate is already green.
- **Agent** — `run-studio-ux-agent-next.sh` (UX DET only) or `cursor-agent-run-studio-finding.sh` with `FORGE_STUDIO_AGENT_GATE=ux|a11y|all` and optional `RULE_ID`.
- **Still deferred** — a11y fixer lane in the loop, per-scenario fixer verify, default `--enable-ai-audit` in smoke. React primitive scenarios use `DET.APP.PRIMITIVE_*` / `DET.APP.CONTROL_A11Y` via `STUDIO_DYNAMIC_UX_PRIMITIVE_RULES` when `includePrimitives` is true.

## Seal contract

| Variable | Meaning |
|----------|---------|
| `FORGE_SEAL_DIR` | Ephemeral run root (data + audit artifacts) |
| `FORGE_ACCESSIBILITY_DATA` | Isolated runs directory inside seal |
| `FORGE_ACCESSIBILITY_REGISTRY` | Generated QA registry JSON |

## Finding extensions (backward compatible)

Scenario audits may add per finding:

- `scenarioId`, `planId`
- `traceabilityId`
- `sources[]` — `{ repo, path, role }` after enrichment

Static-site `analyze-website-ux.mjs` output is unchanged.

## Tests

```bash
npm test
```

## No MCP

This package does not invoke Cursor MCP or browser MCP. Remediation uses optional `cursor-agent-run-studio-finding.sh` in the product repo with pre-resolved `sources[]` only.
