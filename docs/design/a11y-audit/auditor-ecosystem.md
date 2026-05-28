# Accessibility auditor ecosystem

Kitchen Sink ships a **website accessibility auditor** (`tools/website-a11y-auditor/`) that crawls live sites with Playwright, runs **axe-core** (WCAG-tagged), **deterministic** (`DET.A11Y.GENERIC.*` / `DET.A11Y.KS.*`) rules, and documents **AI-assisted** (`AI.A11Y.*`) principles for judgment-heavy review.

This chapter is the narrative parent for the rule catalog, harness campaigns, and per-rule handbook pages. **Full Before/After HTML for every rule** is compiled into the showcase gallery (`a11y-audit-ecosystem-examples.html`) from Markdown siblings under `docs/design/a11y-audit/rule-pages/`.

## Scope and boundaries

| In scope | Out of scope |
|----------|----------------|
| WCAG-oriented axe tags and scoped DET rules | Legal conformance claims or VPAT signing |
| **Generic** rules (`-generic-` modules) for any site | Product-specific audit profiles |
| **KS** rules (`-ks-` modules) when repo/DOM detects Kitchen Sink | Merging `analyze-website-a11y.mjs` and `score-website-a11y.mjs` |
| Harness under `auditor-tests/` | Replacing **forge-accessibility** Studio (CDP deep dives) |

**Non-negotiable split:** `analyze-website-a11y.mjs` (auditor) and `score-website-a11y.mjs` (scorer) share helpers but **must not call each other**.

## Three lanes

| Lane | Flag | Role |
|------|------|------|
| **axe** | default in `--lanes axe,det` | Deque axe-core violations → `AXE.*` findings |
| **DET** | `--lanes det` | `DET.A11Y.GENERIC.*` and (when KS) `DET.A11Y.KS.*` |
| **AI** | `--enable-ai` | Lists eligible `AI.A11Y.*` prompts (Cursor/agent) |

Use `--rules-scope auto` (default), `generic`, `ks`, or `all` to control KS rule packs.

## Artifact chain

```text
Ruleset (deterministic-a11y-rules.md + registry.generated.json)
    → Rule page (docs/design/a11y-audit/rule-pages/*.md — Before/After HTML)
        → Detection check (det-a11y-generic-*.check.js / det-a11y-ks-*.check.js)
            → Fixture (auditor-tests/fixtures/*.html)
                → Auditor (analyze-website-a11y.mjs on fixture URL)
                    → Optional fixer pilot (`lib/a11y-deterministic-fixers/`) + AI audit + remediation loop
```

| Artifact | Location | Role |
|----------|----------|------|
| Ruleset | `deterministic-a11y-rules.md`, `ai-enabled-a11y-principles.md`, `registry.generated.json` | Stable rule IDs, `scope`, axe standards |
| Rule page | `rule-pages/<kebab>.md` | Handbook + **Before** (fail) / **After** (pass) examples |
| Detection | `design-rules/deterministic/generated/*.check.js` | DOM/repo checks |
| Auditor | `analyze-website-a11y.mjs` | `a11y-audit-data.json`, report |
| Scorer | `score-website-a11y.mjs` | Sitewide `a11y-quality-score.json` |
| Harness | `auditor-tests/invoke-a11y-ruleset-harness.sh` | Prove one DET rule on a fixture |

## Two CLIs: auditor vs scorer

| Tool | Entry | Crawl | Use when |
|------|--------|-------|----------|
| **Auditor** | `analyze-website-a11y.mjs` | Major+ early stop by default; `--breadth-crawl` for full budget | Campaign reports, rule-scoped runs |
| **Scorer** | `score-website-a11y.mjs` | Full crawl within `--max-pages` | Portfolio scorecard |

## Rule handbook (Before / After contract)

Every rule has a sibling Markdown page per [`rule-pages/RULE_PAGE_SCHEMA.md`](rule-pages/RULE_PAGE_SCHEMA.md):

1. **Before example** — fenced `html` that **fails** the rule on a harness fixture.
2. **After example** — fenced `html` that **passes** the rule.

Those blocks feed:

- Showcase rule detail pages (`showcase/a11y-audit-rules/`)
- The **Before/After gallery** on this ecosystem chapter

**Per-rule handbook pages:**

- Catalog with **Open handbook** links: [Accessibility audit rules overview](a11y-audit-rules.html)
- Direct URL: `a11y-audit-rules/{rule-id-kebab}.html` (e.g. `det-a11y-generic-lang.html`)
- Each page: Purpose, Passing/Failing signals, **How this rule is checked**, Before/After, Evidence

## Standards traceability matrix (RTM)

`npm run blend-rules` generates a **traceability matrix** for WCAG 2.1 AA and 2.2 AA: which success criteria are covered by axe vs Forge DET/AI rules, which criteria lack automation, and which rules are untied. See [`standards-traceability.md`](standards-traceability.md) and [`standards-traceability-gaps.md`](standards-traceability-gaps.md).

## Compliance profiles (standards bundles)

Operators choose a **compliance profile** (`--standard` or `--compliance-profile`) to bundle:

- **axe** tag sets (most WCAG automation),
- **DET** rules whose `standards[]` overlap the profile,
- Report **coverage map** (in-scope DET, excluded DET, manual testing themes).

| Profile | Typical use |
|---------|-------------|
| `wcag22aa` | Forge default |
| `wcag21aa` | Procurement / WCAG 2.1 AA |
| `ada-title-ii-wcag21aa` | US state/local gov (same automation as `wcag21aa`) |
| `ada-title-iii-wcag21aa` | US public accommodations web |
| `section508` | US federal ICT |
| `en301549` | EU ICT |

See [`compliance-profiles.md`](compliance-profiles.md) and the showcase **Compliance profiles** table on [Accessibility audit rules](a11y-audit-rules.html#aar-compliance).

**Disclaimer:** automated runs are not legal conformance or VPAT sign-off.

## Ruleset harness (DET)

```bash
cd tools/website-a11y-auditor/auditor-tests
./invoke-a11y-ruleset-harness.sh DET.A11Y.GENERIC.LANG
```

## Full example gallery

The showcase build compiles **every rule** in `rule-pages.manifest.json` into one gallery page with Before/After cards, scope metadata, and links to handbook detail pages.

## Related documentation

- Operator manual: [`tools/website-a11y-auditor/README.md`](../../tools/website-a11y-auditor/README.md)
- Compliance profiles: [`compliance-profiles.md`](compliance-profiles.md)
- Standards matrix: [`standards-matrix.md`](standards-matrix.md)
- UX auditor (copy/IA): [`../ux-audit/README.md`](../ux-audit/README.md)
