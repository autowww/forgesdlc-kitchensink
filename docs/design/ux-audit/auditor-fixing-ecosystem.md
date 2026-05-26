# Auditor and fixing ecosystem

Kitchen Sink ships a **website UX auditor** (`tools/website-ux-auditor/`) that crawls live sites with Playwright, runs **deterministic** (`DET.*`) and **AI-assisted** (`AI.*`) design rules, emits remediation plans, and applies **deterministic fixers** before optional Cursor agent remediation.

This chapter is the narrative parent for the rule catalog, harness campaigns, and per-rule handbook pages. **Full Before/After HTML for every rule** is compiled into the showcase gallery (`ux-audit-ecosystem-examples.html`) from the same Markdown siblings used by defect fixtures and fixers.

## Scope and boundaries

| In scope | Out of scope |
|----------|----------------|
| KS-wide rules, harness, fixers, remediation loop | Product-specific audit profiles (e.g. a single consumer brand) |
| Synthetic defect fixtures under `workbench/ux-auditor/` | Declaring a consumer site “clean” from static-only crawls |
| Pilot **DET** fixers (`lib/ux-deterministic-fixers/`) | Deterministic auto-fix for **AI** rules (agent-only lane) |

**Non-negotiable split:** `analyze-website-ux.mjs` (auditor) and `score-website-ux.mjs` (scorer) share helpers but **must not call each other**.

## Artifact chain

```text
Ruleset (DET.* / AI.* catalogs + registry.generated.json)
    → Rule page (docs/design/ux-audit/rule-pages/*.md — Before/After HTML)
        → Detection check (*.check.js or AI prompt)
            → Fixture (defect campaign HTML under workbench/)
                → Auditor (analyze-website-ux.mjs on fixture URL)
                    → Deterministic fixer (pilot-registry — DET only)
                        → Remediation verify (0 findings for target rule)
                            → Production loop (fixers → Cursor agent → re-audit)
```

| Artifact | Location | Role |
|----------|----------|------|
| Ruleset | `deterministic-design-rules.md`, `ai-enabled-design-principles.md`, `registry.generated.json` | Stable rule IDs and implementation status |
| Rule page | `rule-pages/<kebab>.md` | Handbook + **Before** (fail) / **After** (pass) examples |
| Detection | `design-rules/deterministic/generated/*.check.js` | Playwright/DOM/repo checks |
| Fixture | `generator/build_rule_defect_fixtures.py` | Copies **Before** into `website/*-fail.html` |
| Auditor | `analyze-website-ux.mjs` | Findings, plans, `audit-data.json` |
| Deterministic fixer | `lib/ux-deterministic-fixers/` | Applies **After** (or repo overlay) before agent |
| Remediation loop | `run-website-ux-remediation-loop.sh` | Score → audit → fixers → agent → repeat |
| Harness campaign | `auditor-tests/invoke-det-ruleset-*.sh` | Batch prove detection + remediation per rule |

Governance detail: [`harness/README.md`](harness/README.md).

## Two CLIs: auditor vs scorer

| Tool | Entry | Crawl | Use when |
|------|--------|-------|----------|
| **Auditor** | `analyze-website-ux.mjs` | Default **Major+ early stop**; use `--breadth-crawl` for full budget | Remediation loops, RCA prompts, plans |
| **Scorer** | `score-website-ux.mjs` | Always full crawl within `--max-pages` | Portfolio scorecard (`ux-quality-score.json`) |

The remediation loop runs the **scorer first**, then the **auditor**, and merges sitewide deltas when configured.

## Rule handbook (Before / After contract)

Every implemented rule should have a sibling Markdown page per [`rule-pages/RULE_PAGE_SCHEMA.md`](rule-pages/RULE_PAGE_SCHEMA.md):

1. **Before example** — fenced `html` that **fails** the rule on a harness fixture.
2. **After example** — fenced `html` that **passes** the rule (and drives deterministic fixers).

Those blocks are the **single source of truth** for:

- Showcase rule detail pages (`showcase/ux-audit-rules/`)
- Defect fixtures (`build_rule_defect_fixtures.py`)
- Harness remediation (`apply-harness-fixture-remediation.py`)
- Production fixers (`handbook_after` / `handbook_html_patch`)

**Per-rule handbook pages** (full narrative — not the examples-only gallery):

- Catalog with **Open handbook** links: [UX audit rules overview](ux-audit-rules.html)
- Direct URL pattern: `ux-audit-rules/{rule-id-kebab}.html` (e.g. `det-nav-dedup.html` for `DET.NAV.DEDUP`)
- Each page includes: Purpose, Passing/Failing signals, **How this rule is fixed**, Before/After HTML, Evidence and remediation

## Ruleset harness (DET)

**Detection harness** proves each **DET** rule fires on its defect fixture:

```bash
cd tools/website-ux-auditor/auditor-tests
./invoke-det-ruleset-harness.sh --only-rule DET.HASH.MARKERS --rebuild-fixtures
```

**Remediation verify** applies the **After** example (via fixer + handbook adapter), re-audits, and expects **zero** findings for that rule:

```bash
./invoke-det-ruleset-remediation-verify.sh --rebuild-fixtures
```

Fixture modes:

| Mode | Rules | Behavior |
|------|-------|----------|
| `standalone` | Most DET | Top-level Before HTML in `website/*-fail.html` |
| `repo_overlay` | Contract, inventory, token drift, PY hash, screenshot | Overlay tree under fixture; fixer patches repo files |
| `multi_page` | `DET.APP.PERSISTENT_CHROME` | `index.html` + `settings.html` |

Harness runs use `SKIP_CURSOR_AGENT=1` unless you opt into agents.

## Ruleset harness (AI)

AI rules use **Before** defect pages and a **Cursor CLI agent** per rule (`invoke-ai-ruleset-harness.sh`). There is **no** deterministic fixer lane for `AI.*`; failures route to agent remediation plans.

## Deterministic fixers (DET pilot)

Pilot registry: `tools/website-ux-auditor/lib/ux-deterministic-fixers/pilot-registry.json` (regenerate: `npm run fixers:generate-pilot-registry`).

| `fixerId` | Harness | Production site |
|-----------|---------|-----------------|
| `handbook_after` | Python `apply-harness-fixture-remediation.py` | Node `handbook_html_patch` (HTML patches) |
| `repo_overlay` | Same Python (overlay remediate) | `repo_overlay` Node adapter |

**Fixer-first policy** (`FORGE_UX_FIXERS=1` on `run-website-ux-remediation-loop.sh`):

1. Audit → run pilot fixers → re-audit.
2. If quality gate passes → stop (no Cursor agent).
3. Else → `cursor-agent-run-ux-plan.sh` on `forge-ux-remediation.plan.md`.

Readiness: [`harness/definition-of-ready-deterministic-fixer.md`](harness/definition-of-ready-deterministic-fixer.md).

## Production remediation loop

```bash
cd tools/website-ux-auditor
./run-website-ux-remediation-loop.sh /path/to/website-repo /path/to/website-repo/website
```

Artifacts land under `workbench/ux-auditor/ux-audit/<repo>/<campaign>/` (or `UX_AUDIT_OUT_DIR`):

- `audit-data.json`, `audit-report.md`
- `forge-ux-remediation.plan.md` + defect plans
- `deterministic-fixer-report.json`
- `remediation-agent.log` (when agent runs)

Operator runbook: [`tools/website-ux-auditor/UX-AUDIT-REMEDIATION-CYCLE.md`](../../tools/website-ux-auditor/UX-AUDIT-REMEDIATION-CYCLE.md).

## Full example gallery

The showcase build compiles **every rule** in `rule-pages.manifest.json` into one gallery page with Before/After cards, fixer metadata, and links to handbook detail pages. Embedded Before/After HTML is scoped by `.ux-rule-example` in `forge-theme.css` so production sidebar scroll/sticky does not add incidental scrollbars inside the card (see [`rule-pages/RULE_PAGE_SCHEMA.md`](rule-pages/RULE_PAGE_SCHEMA.md)).

### Public site (Firebase Hosting)

The Kitchen Sink showcase deploys to Firebase project **`forge-kitchen-sink`** under **`/cases/showcase/`** (custom domain **`ks.forgesdlc.com`** when DNS is configured).

| Page | URL |
|------|-----|
| **Ecosystem chapter** | https://ks.forgesdlc.com/cases/showcase/ux-audit-ecosystem.html |
| **All rule examples** | https://ks.forgesdlc.com/cases/showcase/ux-audit-ecosystem-examples.html |
| **Rule catalog** (table → **Open handbook**) | https://ks.forgesdlc.com/cases/showcase/ux-audit-rules.html |
| **Per-rule handbook** (purpose, fixer, Before/After, remediation) | https://ks.forgesdlc.com/cases/showcase/ux-audit-rules/`{rule-kebab}.html` — e.g. [DET.NAV.DEDUP](https://ks.forgesdlc.com/cases/showcase/ux-audit-rules/det-nav-dedup.html) |
| **Examples-only gallery** (Before/After without full narrative) | https://ks.forgesdlc.com/cases/showcase/ux-audit-ecosystem-examples.html |
| **Showcase home** | https://ks.forgesdlc.com/cases/showcase/index.html |

Alternate host: https://forge-kitchen-sink.web.app/cases/showcase/… (same paths).

Deploy from repo root:

```bash
./scripts/deploy-firebase.sh
```

(`stage-dist.sh` runs `build-showcase.py` then copies `showcase/` → `dist/cases/showcase/`.)

### Local only

```bash
python3 generator/build-showcase.py
python3 -m http.server 8765 --directory showcase
# http://127.0.0.1:8765/ux-audit-ecosystem.html
```

## Operator cheat sheet

```bash
# Registry + handbook
cd tools/website-ux-auditor
npm run blend-rules
npm run pagegen -- --lane both --max-rules 10
npm run pagegen:manifest

# Showcase (ecosystem + examples + rule pages)
cd ../..
python3 generator/build-showcase.py

# Harness
cd tools/website-ux-auditor/auditor-tests
./invoke-det-ruleset-harness.sh
./invoke-det-ruleset-remediation-verify.sh --rebuild-fixtures
./invoke-ai-ruleset-harness.sh --only-rule AI.CONTEXT.COGNITIVE_CLARITY
```

## Related documents

| Document | Topic |
|----------|--------|
| [`deterministic-design-rules.md`](deterministic-design-rules.md) | DET catalog tables |
| [`ai-enabled-design-principles.md`](ai-enabled-design-principles.md) | AI catalog tables |
| [`harness/README.md`](harness/README.md) | DoR/DoD per artifact |
| [`tools/website-ux-auditor/README.md`](../../tools/website-ux-auditor/README.md) | CLI flags, watch TUI, env vars |
| [`../forge-enterprise-ai-website-standard.md`](../forge-enterprise-ai-website-standard.md) | Consumer site quality bar |
| **Accessibility auditor** (separate tool) | Showcase: `a11y-audit-ecosystem.html`, `a11y-audit-rules.html`, `a11y-audit-ecosystem-examples.html` — see [`../a11y-audit/README.md`](../a11y-audit/README.md) |
