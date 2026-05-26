---
hash: "Kdt"
name: "Design terminology docs"
type: "docs-family"
status: "active"
source_paths:
  - docs/design/forge-enterprise-ui.md
  - docs/design/forge-enterprise-ai-website-standard-v2-addendum.md
  - docs/design/forge-enterprise-ai-website-standard.md
  - docs/design/lenses-studio-shell.md
  - docs/design/wizard-flow-studio.md
  - docs/PAGE-LAYOUT-TAXONOMY.md
  - docs/design/ux-audit/README.md
  - docs/design/ux-audit/ai-enabled-design-principles.md
  - docs/design/ux-audit/component-design-ruleset-taxonomy.md
  - docs/design/ux-audit/deterministic-design-rules.md
  - docs/design/ux-audit/element-level-ruleset-matrix.md
  - docs/design/ux-audit/industry-standard-page-quality.md
showcase_url: null
screenshot_url: null
screenshot_status: "not-applicable"
---

# Kdt — Design terminology docs

## Identity

- **Hash:** Kdt
- **Name:** Design terminology docs
- **Type:** docs-family
- **Category:** docs (governance sources, not DOM surfaces)
- **Source paths:** Markdown under `docs/design/` and `docs/PAGE-LAYOUT-TAXONOMY.md` (see frontmatter)
- **Showcase URL / status:** Not a rendered showcase route; documents inform generators and contracts.
- **Screenshot URL / status:** Not applicable—no DOM hash for this row.

## Purpose

Aggregate **non-generated** design reference prose that defines Forge enterprise UI vocabulary, studio shells, wizard flows, and the page-layout taxonomy. Catalog reviewers use these files to judge whether emitted HTML meets naming, density, and trust rules before hashing regressions.

## Covered children

This family does not enumerate three-letter DOM hashes; it **covers the source documents themselves** as referenced by registry `source_paths`:

- `docs/design/forge-enterprise-ui.md` — baseline UI terminology and tokens.
- `docs/design/forge-enterprise-ai-website-standard.md` + v2 addendum — public/marketing/handbook tone and structure.
- `docs/design/lenses-studio-shell.md` — desktop studio framing for Lenses metaphors.
- `docs/design/wizard-flow-studio.md` — guided-flow expectations.
- `docs/PAGE-LAYOUT-TAXONOMY.md` — mapping from marketing patterns to KS layouts.
- `docs/design/ux-audit/` — deterministic vs AI-review principles, element ruleset matrix, taxonomy crosswalks authored with Website UX Auditor runs.

**Follow-up:** When a new long-lived design doc under `docs/design/` materially affects visuals, **forge-ks** maintainer adds its path to this row’s `source_paths` in `visual-registry.yaml` in the same PR as the doc lands.

## Expected look

N/A at pixel level—content is Markdown. “Look” means consistent definitions: headings declare scope; tables map terms; cross-links resolve to current catalog contracts.

## Anatomy

- Hierarchical Markdown: topic → principles → checklists; avoid orphan bullets without section headers.

## States

- **Current:** version notes or date stamps where drift risk is high (AI addendum + taxonomy).
- **Superseded:** older sections must point to replacement headings—**forge-ks** removes contradictions when found.

## Variants

- English-only in-repo; localization follows workspace localization scope doc when translated copies are introduced.

## Responsive behavior

N/A for source files; authored preview must read well at handbook line lengths (roughly 72–90ch in rendered HTML).

## Accessibility contract

- Source Markdown uses ordered heading levels for eventual autodoc consumers; diagrams (if added) require alt or companion text in the same change.

## Enterprise look and feel rules

- Terminology favors governed, reviewable, evidence-first language per Forge copy rules—no faux compliance claims.

## Deterministic checks

- Terminology pages cross-link to registry hashes and inventory rows without orphan slugs (`DET.INVENTORY.CROSSWALK`).
- Contracts referenced from Kdt include `## Deterministic checks` sections when they govern emitted surfaces.
- Prose length and heading order stay within handbook readability gates on generated previews (`DET.PROSE.LENGTH`, `DET.SECTION.HEADING`).

## Content rules

- Define terms once and cross-link; do not duplicate full layout contracts—point to `docs/design/catalog/**` instead.
- Taxonomy tables stay in sync with `components/layouts.py` symbol names; **forge-ks** updates when new layouts ship.

## Forbidden patterns

- Speculative customer stories or metrics in normative design docs.
- Empty section headings with no owner—track gaps in backlog with a named follow-up instead.

## Implementation notes

- Consumers (handbook sites) may embed excerpts via forge-autodoc; KS itself references these files in CI and human review.
- Inventory tool may flag new `docs/design/*.md` paths—extend `source_paths` here when inventory warns.

## Screenshot acceptance

- N/A; validation is editorial and link integrity (plus catalog check when registry paths change).

## Change policy

- Update **`Kdt`** `source_paths` whenever covered Markdown moves or splits; keep prose and registry aligned in one commit.

## Changelog

- 2026-05-19 — Phase 05: registered `docs/design/ux-audit/*` under **Kdt** + inventory alignment.
- 2026-05-18 — Phase 04: authored family contract; listed covered source docs; removed stubs.
