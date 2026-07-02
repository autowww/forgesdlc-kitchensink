---
hash: "Hbk"
name: "Handbook layout"
type: "layout"
status: "active"
source_paths:
  - components/layouts.py
showcase_url: "https://ks.forgesdlc.com/showcase/preview-handbook.html"
screenshot_url: "https://ks.forgesdlc.com/showcase/screenshots/Hbk.png"
screenshot_status: "planned"
---

# Hbk — Handbook layout

## Identity

- **Hash:** Hbk
- **Name:** Handbook layout
- **Type:** layout
- **Category:** layout
- **Source paths:** `components/layouts.py`
- **Showcase URL / status:** https://ks.forgesdlc.com/showcase/preview-handbook.html (active preview page)
- **Screenshot URL / status:** https://ks.forgesdlc.com/showcase/screenshots/Hbk.png — status **planned**

## Purpose

Provides the handbook shell: fluid container, doc sidebar rail, optional off-canvas nav, and reading column for long-form documentation and museum-style docs pages.

## Expected look

- **Handbook shell**: fluid container with **Kpn** masthead, optional **Kbc**, **Ksr** doc rail, wide reading `main`, optional **Ktx** ToC column, **Ksf** footer.
- Optical weight favors long-form reading: predictable column widths, subdued chrome ([forge-enterprise-ai-website-standard.md](../../../design/forge-enterprise-ai-website-standard.md)).

## Anatomy

Outer `container-fluid` shell; left doc sidebar (`aside.forge-sidebar`); optional mobile off-canvas; `main` column with page marker; footer region when enabled by layout helper.

When both **Ksr** (left doc sidebar) and **Ktx** (on-page ToC) are present, body copy uses **`.ks-doc-toc-flow`**: prose in **`.ks-doc-toc-prose`** (measure `--ks-prose-max`) and the ToC rail in **`.ks-doc-toc-rail`**. Do not center **`.doc-content`** with `mx-auto` beside Ksr — that creates handbook dead gutter on wide viewports (see `DET.LAYOUT.GRID_CONSISTENCY`).

Registry **root_selector:** `div.container-fluid.px-0`.

## States

- **Default:** stable layout chrome and main content visible.
- **Interactive:** expand/collapse, modal, or nav open states only where the page or chrome contract includes those behaviors—preserve focus management documented under Accessibility.
- **Loading / empty:** museum pages should still render landmarks if a section has no examples; consumer pages should print helpful empty copy (not blank silence).
- **Reduced motion:** decorative motion (backgrounds, carousels) must degrade when users prefer reduced motion (`Ksj` / `Ksc` coordination).

## Variants

- Single canonical visual identity per hash; Do not ship alternate themes per hash. Theme packs (`Ksc` children) may restyle tokens but must not break landmark structure or hash roots.

## Responsive behavior

- Below `lg`, **Ksr**/**Ktx** collapse per variant; `main` spans full width with comfortable gutters.
- Wide tables/diagrams scroll inside regional containers.

## Accessibility contract

- Include ordered landmarks: banner/nav/main/footer as emitted by the layout; skip link where handbook pages provide one.
- Maintain logical heading order inside `main`; do not skip levels for styling.
- Focus states remain visible against KS dark shells; modals trap focus and restore on close.
- Informative images and diagrams need text equivalents; decorative backgrounds use `aria-hidden` or empty alt patterns per standard.

## Enterprise look and feel rules

- Spacious vertical rhythm, high-contrast readable body text, disciplined accent usage, and bounded motion consistent with trust-first operator tools.
- Prefer evidence-oriented language in developer-facing museum pages; avoid hype adjectives unless tied to concrete mechanisms.

## Content rules

- Page titles and hero copy match slug intent; internal museum pages may use instructive tone.
- Code samples and diagrams cite stable paths; when content is illustrative, label it as demo data (see page-type guidelines).
- Cross-link to `docs/design/catalog/page-types/Ks-page-type-design-guidelines.md` when auditing IA-level decisions.

## Deterministic checks

- Showcase/build output honors **Hbk** markers: emitted roots include both `hash="Hbk"` and `data-ks-hash="Hbk"` where `emit_marker_in_showcase` / museum rules apply.
- Structural root for audits: div.container-fluid.px-0: DOM snapshots and screenshot acceptance anchor here or at an explicitly documented child.
- Handbook shells pair sidebar / ToC rails with a single primary `article` or `main` region; axe (or DOM query) reports no duplicate banner landmarks.
- When breadcrumbs are emitted, `doc-breadcrumb` entries align with handbook IA (no stale slugs); links resolve in built showcase output.

## AI-enabled review cues

- Does **Handbook layout** read as the correct *role* for consumers (handbook vs museum vs landing) rather than an accidental mash-up of two layouts?
- Under studio lighting (screenshots at ~1440px), does vertical rhythm reinforce scan-friendly hierarchy (not cramped headings or orphaned whitespace bands)?
- When paired with diagrams or dense tables, does chrome stay visually subordinate while remaining discoverable?

## Forbidden patterns

- Anonymous wrapper stacks with no landmarks for primary content.
- Icon-only controls in chrome without accessible names.
- Rendering full site indexes or auto link walls in hero regions reserved for human-curated messaging.
- Hard-coded animation that cannot be reduced or disabled when motion preference requests it.

## Implementation notes

Python `handbook_page` in `components/layouts.py`; uses `layout_shell_attrs` / `page_main_attrs` from `components/ks_catalog_hashes.py` for hash markers.

## Screenshot acceptance

- When **screenshot_status** is `planned` or `captured`, imagery must show the hash-bearing root (or representative child clearly tied to this hash) at a neutral desktop width (~1440px) unless the contract targets mobile-only surfaces.
- Chrome-only hashes may remain textual acceptance: DOM snapshot tests or inventory markers prove presence even if no PNG ships.
- Contrast checks: primary text and interactive labels meet WCAG AA against active theme tokens.

## Change policy

- Keep this hash when adjusting copy, spacing, token values, accessibility fixes, or non-breaking markup refactors that preserve the surface’s role and landmark pattern.
- Allocate a new hash (see `tools/design-catalog/allocate-visual-hash.mjs`) when the layout’s job changes, primary landmarks move, or consumers would reasonably need a visual regression split.

## Changelog

- 2026-05-18 — Phase 04: replaced stub contract with authored guidance.
