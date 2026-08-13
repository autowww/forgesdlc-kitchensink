# Enterprise app UX rules (Studio / operator SPAs)

Stable rule IDs for **Forge Studio applications**—Forge Market, Lenses Studio, Cockpit, Intelligence Studio—and the **Studio UX PDCA** workcell. These rules are **product-agnostic** (no named consumer audit profile).

## Canonical standard

**[Forge enterprise app UX standard](../forge-enterprise-app-ux-standard.md)** — shell anatomy, first-viewport budgets, copy pattern, page-type table.

Visual direction: **[Forge enterprise UI](../forge-enterprise-ui.md)** (`data-fs-pack="enterprise"`).

## Machine ruleset (PDCA workcell)

| Artifact | Role |
|----------|------|
| [`tools/studio-ux-pdca/lib/enterprise-app-ruleset.json`](../../tools/studio-ux-pdca/lib/enterprise-app-ruleset.json) | Closed rule pack: axes, DET/AI ids, handbook slugs, KS components |
| [`tools/studio-ux-pdca/lib/load-ruleset.mjs`](../../tools/studio-ux-pdca/lib/load-ruleset.mjs) | Load pack; build GPT prompt appendix; validate `rule_id` |
| [`tools/studio-ux-pdca/score-page.mjs`](../../tools/studio-ux-pdca/score-page.mjs) | Deterministic scoring from `page.json` |
| [`tools/studio-ux-pdca/prompts/assess-studio-ux.txt`](../../tools/studio-ux-pdca/prompts/assess-studio-ux.txt) | ChatGPT assessment contract |

Public handbook (when built): `{KS_PUBLIC_BASE}/cases/showcase/ux-audit-rules.html` — filter **Studio** rules via `DET.STUDIO.*` and shared `DET.APP.*` / `AI.APP.*` entries.

## Assessment axes (Studio UX PDCA)

| Axis | Primary rules | Weight |
|------|---------------|--------|
| `page_identity` | `DET.STUDIO.H1`, `DET.STUDIO.TITLE_NAV_MATCH` | Equal in `overall` |
| `job_budget` | `DET.STUDIO.JOB_BUDGET`, `DET.APP.TAB_PANEL` | Equal |
| `control_density` | `DET.BUTTON.GROUP.MAX`, `DET.APP.PRIMARY_CTA`, `DET.CARD.ACTION_LIMIT` | Equal |
| `human_outcome` | `DET.STUDIO.MECHANISM_LEAD` | Equal |
| `wiki_functionality` | Dual-wiki affordances | Equal on wiki/graph pages only; else 100 (N/A) |
| `enterprise_ux` | Rollup ≈ mean(identity, job_budget, control_density) | Back-compat score |

## `DET.STUDIO.*` (Studio-specific deterministic)

| Rule ID | Check |
|---------|--------|
| `DET.STUDIO.H1` | Visible `h1` in workspace |
| `DET.STUDIO.TITLE_NAV_MATCH` | H1 matches active app-rail label |
| `DET.STUDIO.JOB_BUDGET` | ≤2 H2 without tablist (warn); >4 without tablist (fail); tabs demote competing jobs |
| `DET.STUDIO.MECHANISM_LEAD` | Lead copy outcome-led, not mechanism-first |
| `DET.STUDIO.FULLPAGE_SHOT` | Capture expanded nested scroll (`main.fc-main`) |
| `DET.STUDIO.HASH` | At least one `data-ks-hash` on page |
| `DET.STUDIO.TESTID` | At least one `data-testid` for stable automation |

Full definitions: [`deterministic-design-rules.md`](deterministic-design-rules.md#studio--enterprise-operator-apps-detstudio).

Handbook pages: `rule-pages/det-studio-*.md`.

## Shared rules (also in website / ui-app-audit registry)

| Rule ID | Studio use |
|---------|------------|
| `DET.BUTTON.GROUP.MAX` | ≤3 horizontal actions per toolbar row |
| `DET.APP.PRIMARY_CTA` | ≤1 primary CTA per workspace |
| `DET.CARD.ACTION_LIMIT` | ≤1 primary action per card |
| `DET.APP.TAB_PANEL` | Tab ↔ panel ARIA wiring |
| `DET.APP.PERSISTENT_CHROME` | Stable rail/header across routes |
| `DET.LANDMARKS.REQUIRED` | `main`, `nav` landmarks |
| `AI.APP.DENSITY_BALANCE` | Governed density, not flat widget walls |
| `AI.APP.WORKFLOW_CONTINUITY` | Sense of place; selection → next step (`Sab`) |
| `AI.DASHBOARD.ACTIONABILITY_PRIORITY` | Actionable rows, not vanity metrics |
| `AI.PREMIUM.ENTERPRISE_FEEL` | Calm enterprise polish on operator chrome |

Sealed dynamic DET runs: `tools/ui-app-audit/lib/studio-dynamic-ux-ruleset.mjs` (excludes marketing-only rules such as `DET.SECTION.SINGLE_JOB`).

## Relationship to public website UX audit

| Lane | Website / handbook | Studio SPA |
|------|-------------------|------------|
| Section job | `DET.SECTION.SINGLE_JOB` (NLP/heuristic) | `DET.STUDIO.JOB_BUDGET` (H2 + tablist) |
| Primary CTA | `DET.CTA.HIERARCHY` (hero regions) | `DET.APP.PRIMARY_CTA` (workspace) |
| Enterprise feel | `AI.PREMIUM.ENTERPRISE_FEEL` (landing) | Same id; judge app chrome density |

## Governance

Per [`ks-ux-component-rules-governance`](../../../.cursor/rules/ks-ux-component-rules-governance.mdc):

- No Fleet-specific profile
- Prefer deterministic rules for repeatable Studio defects
- AI findings should cite `candidateDeterministicRule` when promoting to `DET.STUDIO.*` or `DET.APP.*`
- `analyze-website-ux.mjs` and `score-website-ux.mjs` must not call each other (Studio PDCA uses its own scorer)

## Refresh handbook pages

```bash
cd tools/website-ux-auditor
npm run blend-rules
npm run pagegen:manifest
cd ../..
python3 generator/build-showcase.py
```
