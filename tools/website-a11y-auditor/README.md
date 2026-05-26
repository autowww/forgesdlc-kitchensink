---
id: forge.website-a11y-auditor
kind: ks-tool
status: published
owner: Forge A11y
updated: 2026-05-26
---

# Forge Website Accessibility Auditor

Deterministic accessibility campaigns for **any** website, with optional Kitchen Sink (**KS**) rules when the repo or live site is KS-driven.

| CLI | Role |
|-----|------|
| `analyze-website-a11y.mjs` / `npm run audit` | Crawl + axe + DET rules → `a11y-audit-data.json`, `a11y-audit-report.md` |
| `score-website-a11y.mjs` / `npm run score` | Full-breadth crawl scorecard → `a11y-quality-score.json` |

**Governance:** `analyze-website-a11y.mjs` does **not** call `score-website-a11y.mjs`.

Design rule docs: [`docs/design/a11y-audit/README.md`](../../docs/design/a11y-audit/README.md).

## Setup

```bash
cd tools/website-a11y-auditor
npm install
npm run vendor:axe
npm run install-browsers
npm run blend-rules
```

## Quick start (consumer repo)

```bash
node kitchensink/tools/website-a11y-auditor/analyze-website-a11y.mjs \
  --repo . \
  --site http://127.0.0.1:8080 \
  --standard wcag22aa \
  --rules-scope auto \
  --lanes axe,det \
  --out ../workbench/a11y-auditor/my-campaign
```

## Lanes

| Lane | Flag | Description |
|------|------|-------------|
| **axe** | default in `--lanes` | axe-core WCAG-tagged violations → `AXE.*` findings |
| **det** | default | `DET.A11Y.GENERIC.*` and (when KS) `DET.A11Y.KS.*` |
| **ai** | `--enable-ai` | Lists eligible `AI.A11Y.*` rules in the report (prompts for Cursor/agent) |

`--skip-axe` / `--skip-det` remove lanes. `--lanes axe,det,ai` combines all.

## Rules scope

| `--rules-scope` | Behavior |
|-----------------|----------|
| `auto` (default) | KS DET/AI when repo or DOM signals exceed thresholds |
| `generic` | axe + `DET.A11Y.GENERIC.*` only |
| `ks` | Include `DET.A11Y.KS.*` / `AI.A11Y.KS.*` (harness) |
| `all` | Generic + KS rules regardless of detection |

## Compliance profiles / standards

Use **`--standard`** or **`--compliance-profile`** (alias) to select a named bundle:

| Profile | Notes |
|---------|--------|
| `wcag22aa` | Default — WCAG 2.2 AA axe tags |
| `wcag21aa` | WCAG 2.1 AA |
| `wcag21a` | Level A |
| `wcag22aaa` | AAA (includes `wcag22aaa` axe tag) |
| `ada-title-ii-wcag21aa` | ADA Title II — same automation as `wcag21aa` |
| `ada-title-iii-wcag21aa` | ADA Title III — same automation as `wcag21aa` |
| `section508` | US federal ICT |
| `en301549` | EU ICT |
| `best-practice` | Deque extras |

Example:

```bash
node analyze-website-a11y.mjs --repo . --site http://127.0.0.1:8080 \
  --compliance-profile ada-title-ii-wcag21aa
```

Reports include **`complianceProfile`** and **`coverageMap`** (axe tags, DET rules in scope, manual testing themes). **Not** legal conformance or VPAT.

Overrides: `--axe-tags`, `--wcag-level a|aa|aaa`, `--include-best-practice`.

Design docs: [`docs/design/a11y-audit/compliance-profiles.md`](../../docs/design/a11y-audit/compliance-profiles.md).

## Standards traceability matrix (RTM)

`npm run blend-rules` also writes:

- `design-rules/standards-traceability.generated.json` — WCAG 2.1 AA / 2.2 AA success criteria ↔ axe / DET / AI
- `docs/design/a11y-audit/standards-traceability-gaps.md` — uncovered criteria and untied rules

See [`docs/design/a11y-audit/standards-traceability.md`](../../docs/design/a11y-audit/standards-traceability.md). Audit reports include `traceabilitySummary` when the matrix is present.

## Narrowing scope

| Flag | Effect |
|------|--------|
| `--only-deterministic-rule-ids` | Run listed `DET.A11Y.*` rules only |
| `--only-ai-rule-ids` | Filter eligible AI rules |
| `--max-pages N` | Crawl budget (default 12 audit / 60 score) |
| `--breadth-crawl` | Disable Major+ early stop (audit) |
| `--static-only` | Repo inventory + warning (no Playwright) |

## Output

Default `--out` when omitted:

`workbench/a11y-auditor/a11y-audit/<repo-basename>/<UTC>_<id>/`

Override hub: `FORGE_A11Y_AUDIT_WORKBENCH_ROOT`.

## KS vs generic naming

- Generic modules: `det-a11y-generic-*.check.js`
- KS modules: `det-a11y-ks-*.check.js`

Registry `scope` must match the filename segment (`npm run blend-rules` enforces).

## Kitchen Sink showcase

After `python3 generator/build-showcase.py` from the KS repo root:

| Page | Path |
|------|------|
| Ecosystem chapter | `showcase/a11y-audit-ecosystem.html` |
| Rule catalog + tables | `showcase/a11y-audit-rules.html` |
| **Before/After gallery** (every rule) | `showcase/a11y-audit-ecosystem-examples.html` |
| Per-rule handbook | `showcase/a11y-audit-rules/<rule-kebab>.html` |

Refresh handbook Markdown: `python3 generator/bootstrap_a11y_rule_pages.py`.

## Related tools

- [**Website UX auditor**](../website-ux-auditor/README.md) — copy/IA; use **this** tool for WCAG/axe campaigns.
- [**forge-accessibility**](https://github.com/autowww/forge-accessibility) — Studio CDP + axe evidence (complementary).

## Tests

```bash
npm test
```
