---
id: forge.enterprise-app-ux-standard
kind: design-principle
status: draft
owner: Forge UX
applies_to:
  - forge-market-studio
  - forge-lenses-studio
  - forge-cockpit-web
  - forge-intelligence-studio
aliases:
  - Forge enterprise app UX standard
  - Studio operator UX standard
  - Enterprise SPA UX standard
updated: 2026-08-13
---

# Forge enterprise app UX standard

## Purpose

Operator and analyst **Studio SPAs** (Forge Market, Lenses Studio, Cockpit, Intelligence Studio) must feel **calm, governed, and outcome-led**—not like internal admin panels or mechanism dumps. A first-time operator should understand **where they are**, **what job this screen does**, **what to do next**, and **what happens when they act**—without reading API names first.

This standard complements:

- **[Forge enterprise UI](forge-enterprise-ui.md)** — visual packs (`data-fs-pack="enterprise"`), matte surfaces, accent roles
- **[Forge enterprise AI website standard](forge-enterprise-ai-website-standard.md)** — public marketing sites (different shell; do not apply homepage-first-screen budgets to Studio workspaces)
- **[UX audit enterprise app rules](ux-audit/enterprise-app-ux-rules.md)** — machine rule IDs for Studio UX PDCA and ui-app-audit

## Core principle

**One primary job per workspace view.** Secondary jobs live behind tabs (`Svc`), filters (`Ftb`), or disclosure—not as peer scroll sections. Lead with **human outcome**, then show mechanism and data.

## Shell anatomy (Studio SPA)

| Region | Job | Rules |
|--------|-----|-------|
| App rail | Persistent navigation; one active destination | `DET.STUDIO.TITLE_NAV_MATCH`, `DET.APP.PERSISTENT_CHROME` |
| Page header | H1 + outcome-led lead (one paragraph) | `DET.STUDIO.MECHANISM_LEAD`, `DET.STUDIO.H1` |
| Mode tabs / lens | Secondary jobs (Screen, Alerts, Compare, Charts, Wiki) | `DET.STUDIO.JOB_BUDGET`, `DET.APP.TAB_PANEL` |
| Workspace `main` | Primary data table, chart, or builder | `AI.APP.DENSITY_BALANCE`, `DET.LANDMARKS.REQUIRED` |
| Action row | ≤3 visible actions; ≤1 primary CTA | `DET.BUTTON.GROUP.MAX`, `DET.APP.PRIMARY_CTA` |
| Selection bar (`Sab`) | Contextual bulk actions after row select | `AI.APP.WORKFLOW_CONTINUITY` |

Preferred KS remediation components (closed list for agents): **`Svc`** (segmented tabs), **`Ftb`** (filter toolbar), **`Sab`** (sticky action bar), **`Cap`** (app shell panels), existing `studio-ui/src/ks/*` wrappers.

## First viewport budget (workspace)

| Signal | Budget |
|--------|--------|
| Primary jobs visible without scroll | **1** (one table, one chart stack, or one builder) |
| Visible H2 sections without `[role=tablist]` | ≤ **2** warn; > **4** fail `DET.STUDIO.JOB_BUDGET` |
| Horizontal action buttons per row | ≤ **3** (`DET.BUTTON.GROUP.MAX`) |
| Primary filled CTAs (`.fc-btn` non-ghost) | ≤ **1** (`DET.APP.PRIMARY_CTA`) |
| H1 vs active rail label | Must match after normalization (`DET.STUDIO.TITLE_NAV_MATCH`) |

## Copy pattern

Use the website standard message order, adapted for operators:

1. **Outcome** — what the user can accomplish on this screen
2. **Scope** — what list, issuer, or time range is in view
3. **Mechanism** — harvest, pipeline, API (only after outcome or behind disclosure)
4. **Next action** — one obvious primary step
5. **Trust boundary** — what the system will / will not do on this action

Fail `DET.STUDIO.MECHANISM_LEAD` when the lead paragraph opens with harvest/API/pipeline language without outcome verbs (find, compare, track, review, watch, monitor).

## Page-type expectations

| Surface | Primary job | Wiki / graph axis |
|---------|-------------|-------------------|
| Lists / watchlists | Review one list scope | N/A (pass) |
| Company hub | Issuer summary + sub-tabs | Weight wiki only on Wiki tab |
| Filings / Facts / Ingest / Analysis | Operational pipeline view | N/A unless wiki links present |
| Dual-wiki / Graph | Navigation + evidence affordances | Full `wiki_functionality` weight |

## Visual and enterprise feel

Apply **`forge-enterprise-ui.md`** enterprise pack where Studio embeds KS CSS:

- Matte panels, restrained motion, amber/cyan as signals—not decoration on every tile
- Grouped regions with `card-label` / section labels
- Judgment overlay: **`AI.PREMIUM.ENTERPRISE_FEEL`**, **`AI.APP.DENSITY_BALANCE`**

## Capture and audit contract (Studio UX PDCA)

| Check | Rule ID | Layer |
|-------|---------|-------|
| Full scroll visible to assessor | `DET.STUDIO.FULLPAGE_SHOT` | Capture gate |
| Governed visual roots | `DET.STUDIO.HASH` | DOM |
| Stable E2E anchors | `DET.STUDIO.TESTID` | DOM |
| Deterministic score rollup | `enterprise_ux` axis | mean(identity, job_budget, control_density) |

Machine-readable pack: `tools/studio-ux-pdca/lib/enterprise-app-ruleset.json`.

## Non-goals

- Do **not** apply marketing **`DET.SECTION.SINGLE_JOB`** NLP heuristics to Studio SPAs; use **`DET.STUDIO.JOB_BUDGET`** (H2/tablist density) instead.
- Do **not** add product-specific audit profiles (e.g. a named Fleet-only pack). Forge Market may appear only as a generic regression example.
- Do **not** merge website auditor and scorer CLIs; Studio PDCA may **reuse** shared DET checks via ui-app-audit allowlists.

## References

- Studio UX PDCA harness: `tools/studio-ux-pdca/README.md`
- Sealed Studio DET allowlist: `tools/ui-app-audit/lib/studio-dynamic-ux-ruleset.mjs`
- Desktop/app DET catalog: `docs/design/ux-audit/deterministic-design-rules.md` (Desktop / app interfaces)
- Element matrix: `docs/design/ux-audit/element-level-ruleset-matrix.md`
