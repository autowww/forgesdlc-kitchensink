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

## Phase B (deferred)

Studio-aware deterministic fixers (`sources[]`-first HTML under `forge_accessibility/static/`, a11y fixer lane in loop, React primitive scenarios) are **not** in scope for the trustworthy gate slice. Use `cursor-agent-run-studio-finding.sh` until Phase B lands.

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
