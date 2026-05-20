---
hash: "Ktx"
name: "Doc ToC sidebar"
type: "chrome-region"
status: "active"
source_paths:
  - components/layouts.py
  - components/components.py
showcase_url: null
screenshot_url: null
screenshot_status: "not-applicable"
---

# Ktx — Doc ToC sidebar

## Identity

- **Hash:** Ktx
- **Name:** Doc ToC sidebar
- **Type:** chrome-region
- **Category:** chrome-region
- **Source paths:** `components/layouts.py`, `components/components.py`
- **Showcase URL / status:** Not applicable as a standalone public URL; surface appears inside composed pages.
- **Screenshot URL / status:** No standalone screenshot URL; status **not-applicable** (capture via parent page or planned automation).

## Purpose

Reusable chrome region **Doc ToC sidebar** (`slug: doc-toc-sidebar`) embedded by layouts in `components/layouts.py` for consistent handbook, product, or showcase shells.

## Expected look

- Narrow **in-page ToC** column (`.col-lg-4.col-xl-3.order-1.order-lg-2`): mirrors heading hierarchy with subtle indent stepped lists.
- Active anchor state tracks scroll position without shouting over article body styles ([forge-enterprise-ai-website-standard.md](../../../design/forge-enterprise-ai-website-standard.md)).
- Paired with chapter/handbook layouts—never mistaken for **Ksr** doc IA rail.

## Anatomy

Region root matches registry `root_selector`; nests links, controls, or metadata expected for **doc-toc-sidebar** without replacing page `main` content.

Registry **root_selector:** `.col-lg-4.col-xl-3.order-1.order-lg-2`.

## States

- **Default:** stable layout chrome and main content visible.
- **Interactive:** expand/collapse, modal, or nav open states only where the page or chrome contract includes those behaviors—preserve focus management documented under Accessibility.
- **Loading / empty:** museum pages should still render landmarks if a section has no examples; consumer pages should print helpful empty copy (not blank silence).
- **Reduced motion:** decorative motion (backgrounds, carousels) must degrade when users prefer reduced motion (`Ksj` / `Ksc` coordination).

## Variants

- Single canonical visual identity per hash; Do not ship alternate themes per hash. Theme packs (`Ksc` children) may restyle tokens but must not break landmark structure or hash roots.

## Responsive behavior

- **Ktx** stacks beneath article **or** hides behind toggle per layout variant—never squeezes body line length below readable widths.
- Sticky behaviors (if enabled) degrade gracefully when overflow clipping would trap focus.

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

- Showcase/build output honors **Ktx** markers: emitted roots include both `hash="Ktx"` and `data-ks-hash="Ktx"` where `emit_marker_in_showcase` / museum rules apply.
- Structural root for audits: .col-lg-4.col-xl-3.order-1.order-lg-2: DOM snapshots and screenshot acceptance anchor here or at an explicitly documented child.
- Heading-index links map to real `id` targets inside `main`; broken anchors fail CI when heading text changes.
- Sticky ToC clears fixed masthead offsets so focused targets are not clipped.

## AI-enabled review cues

- For **Doc ToC sidebar** (`doc-toc-sidebar`), does the chrome read as purposeful product IA rather than decorative Bootstrap filler?
- At condensed widths, collapsed affordances remain obvious (motion, affordance cues, labeling); no mystery-meat menus.
- Credibility check: typography and spacing match Forge enterprise tone ([forge-enterprise-ai-website-standard.md](../../../design/forge-enterprise-ai-website-standard.md)) without looking like a generic template swap.

## Forbidden patterns

- Anonymous wrapper stacks with no landmarks for primary content.
- Icon-only controls in chrome without accessible names.
- Rendering full site indexes or auto link walls in hero regions reserved for human-curated messaging.
- Hard-coded animation that cannot be reduced or disabled when motion preference requests it.

## Implementation notes

Rendered from `components/layouts.py` within: render_toc_sidebar, showcase_page, chapter_page. Use `chrome_region_attrs("doc-toc-sidebar")` patterns per `ks_catalog_hashes.py`.

## Screenshot acceptance

- When **screenshot_status** is `planned` or `captured`, imagery must show the hash-bearing root (or representative child clearly tied to this hash) at a neutral desktop width (~1440px) unless the contract targets mobile-only surfaces.
- Chrome-only hashes may remain textual acceptance: DOM snapshot tests or inventory markers prove presence even if no PNG ships.
- Contrast checks: primary text and interactive labels meet WCAG AA against active theme tokens.

## Change policy

- Keep this hash when adjusting copy, spacing, token values, accessibility fixes, or non-breaking markup refactors that preserve the surface’s role and landmark pattern.
- Allocate a new hash (see `tools/design-catalog/allocate-visual-hash.mjs`) when the layout’s job changes, primary landmarks move, or consumers would reasonably need a visual regression split.

## Changelog

- 2026-05-18 — Phase 04: replaced stub contract with authored guidance.
