---
hash: "Mkt"
name: "Marketing interior layout"
type: "layout"
status: "active"
source_paths:
  - components/layouts.py
showcase_url: "https://ks.forgesdlc.com/showcase/preview-marketing.html"
screenshot_url: "https://ks.forgesdlc.com/showcase/screenshots/Mkt.png"
screenshot_status: "planned"
---

# Mkt — Marketing interior layout

## Identity

- **Hash:** Mkt
- **Name:** Marketing interior layout
- **Type:** layout
- **Category:** layout
- **Source paths:** `components/layouts.py`
- **Showcase URL / status:** https://ks.forgesdlc.com/showcase/preview-marketing.html (active preview page)
- **Screenshot URL / status:** https://ks.forgesdlc.com/showcase/screenshots/Mkt.png — status **planned**

## Purpose

Interior marketing or editorial page: readable column width with repeated section pattern for campaigns, articles, or deep dives.

## Expected look

- **Marketing interior** frame for narrative sections—supports cards, strips, and diagrams without showcase density.
- Sidebars are rare; emphasis stays on scannable headings and deliberate whitespace ([forge-enterprise-ai-website-standard.md](../../../design/forge-enterprise-ai-website-standard.md)).

## Anatomy

Comfortable reading column; section bands; may include pull quotes, figures, or secondary CTAs.

Registry **root_selector:** `div.container-fluid.px-0`.

## States

- **Default:** stable layout chrome and main content visible.
- **Interactive:** expand/collapse, modal, or nav open states only where the page or chrome contract includes those behaviors—preserve focus management documented under Accessibility.
- **Loading / empty:** museum pages should still render landmarks if a section has no examples; consumer pages should print helpful empty copy (not blank silence).
- **Reduced motion:** decorative motion (backgrounds, carousels) must degrade when users prefer reduced motion (`Ksj` / `Ksc` coordination).

## Variants

- Single canonical visual identity per hash; Do not ship alternate themes per hash. Theme packs (`Ksc` children) may restyle tokens but must not break landmark structure or hash roots.

## Responsive behavior

- Multi-column marketing bands become single column `md` and below with preserved heading order.
- Imagery and diagrams preserve aspect without forcing viewport scroll jank.

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

- Showcase/build output honors **Mkt** markers: emitted roots include both `hash="Mkt"` and `data-ks-hash="Mkt"` where `emit_marker_in_showcase` / museum rules apply.
- Structural root for audits: div.container-fluid.px-0: DOM snapshots and screenshot acceptance anchor here or at an explicitly documented child.
- Interior marketing rhythm (sections → cards → CTA rail) preserves vertical spacing tokens; tables of technical detail are folded behind disclosure or sibling pages.
- No autoplay media in first viewport unless muted, labeled, and covered by reduced-motion fallbacks coordinated with **Ksj**.

## AI-enabled review cues

- Does **Marketing interior layout** read as the correct *role* for consumers (handbook vs museum vs landing) rather than an accidental mash-up of two layouts?
- Under studio lighting (screenshots at ~1440px), does vertical rhythm reinforce scan-friendly hierarchy (not cramped headings or orphaned whitespace bands)?
- When paired with diagrams or dense tables, does chrome stay visually subordinate while remaining discoverable?

## Forbidden patterns

- Anonymous wrapper stacks with no landmarks for primary content.
- Icon-only controls in chrome without accessible names.
- Rendering full site indexes or auto link walls in hero regions reserved for human-curated messaging.
- Hard-coded animation that cannot be reduced or disabled when motion preference requests it.

## Implementation notes

Python `marketing_page` in `components/layouts.py`.

## Screenshot acceptance

- When **screenshot_status** is `planned` or `captured`, imagery must show the hash-bearing root (or representative child clearly tied to this hash) at a neutral desktop width (~1440px) unless the contract targets mobile-only surfaces.
- Chrome-only hashes may remain textual acceptance: DOM snapshot tests or inventory markers prove presence even if no PNG ships.
- Contrast checks: primary text and interactive labels meet WCAG AA against active theme tokens.

## Change policy

- Keep this hash when adjusting copy, spacing, token values, accessibility fixes, or non-breaking markup refactors that preserve the surface’s role and landmark pattern.
- Allocate a new hash (see `tools/design-catalog/allocate-visual-hash.mjs`) when the layout’s job changes, primary landmarks move, or consumers would reasonably need a visual regression split.

## Changelog

- 2026-05-18 — Phase 04: replaced stub contract with authored guidance.
