---
hash: "Hdc"
name: "Handbook chapter main"
type: "page"
status: "active"
source_paths:
  - forge-autodoc/forge_autodoc/page.py
showcase_url: null
screenshot_url: null
screenshot_status: "not-applicable"
---

# Hdc — Handbook chapter main

## Identity

- **Hash:** Hdc
- **Name:** Handbook chapter main
- **Type:** page
- **Category:** page
- **Source paths:** `forge-autodoc/forge_autodoc/page.py`
- **Showcase URL / status:** Not applicable as a standalone public URL; surface appears inside composed pages.
- **Screenshot URL / status:** No standalone screenshot URL; status **not-applicable** (capture via parent page or planned automation).

## Purpose

`Hdc` governs the default `<main>` landmark that **forge-autodoc** emits for handbook HTML (`assemble_handbook_page` in `forge-autodoc/forge_autodoc/page.py`): the reader-facing column for chapter prose, headings, diagrams, and continuation navigation inside consumer handbooks—not the static KS showcase generator tree.

## Expected look

- **Handbook chapter main** body showcases long-form autodoc/handbook HTML inside **Chp**/**Hbk** shells.
- Heading ladder, callouts, and code blocks adopt handbook rhythm ([forge-enterprise-ai-website-standard.md](../../../design/forge-enterprise-ai-website-standard.md)).

## Anatomy

Single `<main id="…" class="…">` wrapper (registry `main#main`) containing the assembled chapter body: title block, Markdown-rendered sections, optional diagrams, and handbook-specific chrome hooks expected by `docs-theme` / site injectors.

Registry **root_selector:** `main#main`.

## States

- **Default:** stable layout chrome and main content visible.
- **Interactive:** expand/collapse, modal, or nav open states only where the page or chrome contract includes those behaviors—preserve focus management documented under Accessibility.
- **Loading / empty:** museum pages should still render landmarks if a section has no examples; consumer pages should print helpful empty copy (not blank silence).
- **Reduced motion:** decorative motion (backgrounds, carousels) must degrade when users prefer reduced motion (`Ksj` / `Ksc` coordination).

## Variants

- Single canonical visual identity per hash; Do not ship alternate themes per hash. Theme packs (`Ksc` children) may restyle tokens but must not break landmark structure or hash roots.

## Responsive behavior

- Long-form body uses responsive typography; code blocks and tables scroll regionally.

## Accessibility contract

- Include ordered landmarks: banner/nav/main/footer as emitted by the layout; skip link where handbook pages provide one.
- Maintain logical heading order inside `main`; do not skip levels for styling.
- Focus states remain visible against KS dark shells; modals trap focus and restore on close.
- Informative images and diagrams need text equivalents; decorative backgrounds use `aria-hidden` or empty alt patterns per standard.

## Enterprise look and feel rules

- Spacious vertical rhythm, high-contrast readable body text, disciplined accent usage, and bounded motion consistent with trust-first operator tools.
- Prefer evidence-oriented language in developer-facing museum pages; avoid hype adjectives unless tied to concrete mechanisms.

## Content rules

- Chapter title matches the handbook heading hierarchy; avoid orphan `<h1>` duplication when site shells add their own title bands.
- Code samples and diagrams cite stable paths; consumer content stays authoritative—KS contracts govern structure, not editorial backlog.
- Use `docs/handbook` page-type guidance in `page-types/Ks-page-type-design-guidelines.md` when auditing reading flow.

## Deterministic checks

- Showcase/build output honors **Hdc** markers: emitted roots include both `hash="Hdc"` and `data-ks-hash="Hdc"` where `emit_marker_in_showcase` / museum rules apply.
- Structural root for audits: main#main: DOM snapshots and screenshot acceptance anchor here or at an explicitly documented child.
- Page generator `page.py` composes inside the advertised parent layout; built HTML for slug `handbook-chapter` includes the nested layout hash markers expected by showcase inventory.
- `main#main` (or contracted root) headings follow one H1 convention per view; supplementary cards do not spoof heading levels.

## AI-enabled review cues

- Does **Handbook chapter main** storytelling match the KS museum intent (education, reassurance, parity with consumer sites), not accidental placeholder copy?
- Are technical blocks (API tables, prose blocks) progressively disclosed consistent with Forge landing doctrine?
- Screenshot or DOM review: hero / first-scroll real estate reinforces the visitor job for **handbook-chapter**.

## Forbidden patterns

- Anonymous wrapper stacks with no landmarks for primary content.
- Icon-only controls in chrome without accessible names.
- Rendering full site indexes or auto link walls in hero regions reserved for human-curated messaging.
- Hard-coded animation that cannot be reduced or disabled when motion preference requests it.

## Implementation notes

Trace `assemble_handbook_page` and related helpers in `forge-autodoc/forge_autodoc/page.py`. Consumers embed forge-autodoc via their Python build; after changing markers or layout expectations, bump the `kitchensink` submodule and rebuild the consumer site. Inventory lists this row as a `page-instance`; it is intentionally absent from static `showcase/` HTML.

## Screenshot acceptance

- When **screenshot_status** is `planned` or `captured`, imagery must show the hash-bearing root (or representative child clearly tied to this hash) at a neutral desktop width (~1440px) unless the contract targets mobile-only surfaces.
- Chrome-only hashes may remain textual acceptance: DOM snapshot tests or inventory markers prove presence even if no PNG ships.
- Contrast checks: primary text and interactive labels meet WCAG AA against active theme tokens.

## Change policy

- Keep this hash when adjusting copy, spacing, token values, accessibility fixes, or non-breaking markup refactors that preserve the surface’s role and landmark pattern.
- Allocate a new hash (see `tools/design-catalog/allocate-visual-hash.mjs`) when the layout’s job changes, primary landmarks move, or consumers would reasonably need a visual regression split.

## Changelog

- 2026-05-18 — Phase 04: replaced stub contract with authored guidance.
