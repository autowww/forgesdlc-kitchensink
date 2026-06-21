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
# Writes studio-ux-quality-score.json (+ .md) with uxScores (dimension rollup),
# scoreBand, topDamageContributors, coverage metadata; passGate remains independent.
node generate-studio-remediation-plan.mjs --audit /path/to/audit-out/audit-data.json
```

Product one-shot: [forge-accessibility-leo/scripts/run-sealed-studio-smoke.sh](../../forge-accessibility-leo/scripts/run-sealed-studio-smoke.sh).  
Remediation loop (unified `--app` mode): [tools/website-ux-auditor/run-website-ux-remediation-loop.sh](../website-ux-auditor/run-website-ux-remediation-loop.sh) or product wrapper [forge-accessibility-leo/scripts/run-sealed-studio-remediation-loop.sh](../../forge-accessibility-leo/scripts/run-sealed-studio-remediation-loop.sh).

## Smoke plan from Markdown contract

```bash
node sync-smoke-plan-from-contract.mjs \
  --app-repo /path/to/forge-accessibility-leo \
  --smoke-plan docs/studio/smoke-plan.yaml \
  --dry-run
```

Product wrapper: `./scripts/sync-smoke-plan-from-docs.sh` (sync + `check-smoke-plan-contract.mjs`).

Scenarios support **`steps[]`** with per-step **`render_roots`** (files that influence DOM). See `lib/smoke-plan.mjs` (`normalizeScenarioSteps`, `getScenarioRenderRoots`).

## Guided failure analysis (landing E2E)

```bash
node analyze-scenario-failures.mjs \
  --audit /path/to/audit-data.json \
  --smoke-plan docs/studio/smoke-plan.yaml \
  --app-repo /path/to/forge-accessibility-leo \
  --scenario-id home-shell \
  --guided-first-run \
  --out landing-e2e-analysis.md
```

Product orchestrator: [forge-accessibility-leo/scripts/run-studio-landing-e2e.sh](../../forge-accessibility-leo/scripts/run-studio-landing-e2e.sh).

## Step-scoped agents + external library fixes

- `run-scenario-step-remediation.mjs` — one agent job per `(scenarioId, stepId)`; writes `scenario-remediation-manifest.json`.
- Unified loop flags: `--external-library-path1=../forgesdlc-kitchensink`, `FORGE_UX_FIX_ROOTS`, `--step-agents`, `--sync-smoke-plan`.
- Product script: `scripts/cursor-agent-run-studio-step.sh`.

## Studio dynamic UX ruleset

For `siteKind` `a11y-studio` / `app-shell`, scenario audit runs an **explicit allowlist** (~38 DOM rules + optional React/hash primitives) via `lib/studio-dynamic-ux-ruleset.mjs`. Repo-static rules (`DET.CONTRACT.*`, `DET.PY.*`, …) and handbook exclusions are omitted.

New dynamic rules: `DET.APP.PRIMARY_STATE`, `DET.APP.PRIMARY_CTA`, `DET.APP.DEMO_DISCLOSURE`, `DET.APP.TILE_AFFORDANCE`, `DET.APP.TAB_PANEL`.

## Smoke-plan generation (Vite/React)

Infer **candidate** scenarios (never overwrites human `implemented` rows):

```bash
node generate-vite-react-smoke-plan.mjs \
  --app-repo /path/to/app \
  --smoke-plan /path/to/docs/studio/smoke-plan.yaml
```

Sources: React Router `path` attrs/objects, `src/pages|routes|views|app` filenames, nav `<a href>` in shell HTML, plus existing plan anchors.

## Scenario coverage

After audit (`--emit-coverage` or `FORGE_STUDIO_EMIT_COVERAGE=1`), or standalone:

```bash
node report-scenario-coverage.mjs \
  --smoke-plan docs/studio/smoke-plan.yaml \
  --audit audit/audit-data.json \
  --app-repo .
```

Writes `scenario-coverage.json` schema: `knownRouteCount`, `scenariosAudited`, `missingRouteCandidates`, `tiersCovered`, `failuresByLane`, `failuresByScenario`.

## Per-scenario fixer verify

```bash
node run-scenario-fixer-verify.mjs \
  --repo-root . --audit-data audit/audit-data.json \
  --site http://127.0.0.1:PORT --smoke-plan docs/studio/smoke-plan.yaml \
  --out-dir audit/verify --rule-id DET.APP.PRIMARY_STATE \
  --promote-full-smoke
```

Re-audits only impacted scenarios; optional full `smoke,demo` promotion when impacted pass.

| Env | Effect |
|-----|--------|
| `FORGE_STUDIO_UX_FIXERS=1` | UX deterministic fixers (default on) |
| `FORGE_STUDIO_A11Y_FIXERS=1` | A11y deterministic fixers in verify/loop |
| `FORGE_STUDIO_A11Y_AI_FIXERS=1` | A11y AI fixers (`plan_only` unless mode set) |
| `FORGE_STUDIO_ENABLE_AI_AUDIT=1` | Manifest AI audit in scenario audit (CI off by default) |
| `FORGE_STUDIO_EXECUTE_AI_AUDIT=1` | Run `run-website-ux-ai-audit.mjs --execute` after manifest |

## Studio fixers and agent

- **UX HTML fixers** — `website-ux-auditor` resolves `sources[]` and `forge_accessibility/static/` (hash → partials). Most Studio KPI/cards are JS-built; fix product code or use the agent for those.
- **Remediation loop** — `run-sealed-studio-remediation-loop.sh` uses `run-scenario-fixer-verify.mjs` when `FORGE_STUDIO_SCENARIO_VERIFY=1`. Set `FORGE_STUDIO_SKIP_FIXERS=1` when the gate is already green.
- **Agent** — `run-studio-ux-agent-next.sh` (UX DET only) or `cursor-agent-run-studio-finding.sh` with `FORGE_STUDIO_AGENT_GATE=ux|a11y|all` and optional `RULE_ID`.
- React primitive scenarios use `DET.APP.PRIMITIVE_*` / `DET.APP.CONTROL_A11Y` via `STUDIO_DYNAMIC_UX_PRIMITIVE_RULES` when `includePrimitives` is true.

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
