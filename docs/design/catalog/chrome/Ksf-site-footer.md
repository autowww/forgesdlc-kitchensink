---
hash: "Ksf"
name: "Site footer region"
type: "chrome-region"
status: "active"
source_paths:
  - components/layouts.py
showcase_url: null
screenshot_url: null
screenshot_status: "not-applicable"
---

# Ksf — Site footer region

## Identity

- **Hash:** Ksf
- **Name:** Site footer region
- **Type:** chrome-region
- **Category:** chrome-region
- **Source paths:** `components/layouts.py`
- **Showcase URL / status:** Not applicable as a standalone public URL; surface appears inside composed pages.
- **Screenshot URL / status:** No standalone screenshot URL; status **not-applicable** (capture via parent page or planned automation).

## Purpose

Reusable chrome region **Site footer region** (`slug: site-footer`) embedded by layouts in `components/layouts.py` for consistent handbook, product, or showcase shells.

## Expected look

- **Footer** band (`.ks-site-footer-region`): balanced columns for links/meta; quieter typography than body copy.
- Separates closing utilities (copyright, secondary links) from page conclusions without competing with CTAs in `main` ([forge-enterprise-ai-website-standard.md](../../../design/forge-enterprise-ai-website-standard.md)).
- Decorative dividers or glyphs remain non-semantic (`aria-hidden` where appropriate).

## Anatomy

Region root matches registry `root_selector`; nests links, controls, or metadata expected for **site-footer** without replacing page `main` content.

Registry **root_selector:** `.ks-site-footer-region`.

## States

- **Default:** stable layout chrome and main content visible.
- **Interactive:** expand/collapse, modal, or nav open states only where the page or chrome contract includes those behaviors—preserve focus management documented under Accessibility.
- **Loading / empty:** museum pages should still render landmarks if a section has no examples; consumer pages should print helpful empty copy (not blank silence).
- **Reduced motion:** decorative motion (backgrounds, carousels) must degrade when users prefer reduced motion (`Ksj` / `Ksc` coordination).

## Variants

- Single canonical visual identity per hash; Do not ship alternate themes per hash. Theme packs (`Ksc` children) may restyle tokens but must not break landmark structure or hash roots.

## Responsive behavior

- Footer columns stack by `sm`/`md` with readable link grouping; legal/meta lines wrap instead of tiny horizontal scroll.
- Maintain tap spacing between dense footer links.

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

- Showcase/build output honors **Ksf** markers: emitted roots include both `hash="Ksf"` and `data-ks-hash="Ksf"` where `emit_marker_in_showcase` / museum rules apply.
- Structural root for audits: .ks-site-footer-region: DOM snapshots and screenshot acceptance anchor here or at an explicitly documented child.
- `site-footer` contains secondary IA and meta links only; no takeover of primary CTA lanes reserved for page body.
- Footer columns stack predictably below `md` without horizontal scroll traps.

## AI-enabled review cues

- For **Site footer region** (`site-footer`), does the chrome read as purposeful product IA rather than decorative Bootstrap filler?
- At condensed widths, collapsed affordances remain obvious (motion, affordance cues, labeling); no mystery-meat menus.
- Credibility check: typography and spacing match Forge enterprise tone ([forge-enterprise-ai-website-standard.md](../../../design/forge-enterprise-ai-website-standard.md)) without looking like a generic template swap.

## Forbidden patterns

- Anonymous wrapper stacks with no landmarks for primary content.
- Icon-only controls in chrome without accessible names.
- Rendering full site indexes or auto link walls in hero regions reserved for human-curated messaging.
- Hard-coded animation that cannot be reduced or disabled when motion preference requests it.

## Implementation notes

Rendered from `components/layouts.py` within: handbook_page, chapter_page, showcase_page, product_page. Use `chrome_region_attrs("site-footer")` patterns per `ks_catalog_hashes.py`.

## Screenshot acceptance

- When **screenshot_status** is `planned` or `captured`, imagery must show the hash-bearing root (or representative child clearly tied to this hash) at a neutral desktop width (~1440px) unless the contract targets mobile-only surfaces.
- Chrome-only hashes may remain textual acceptance: DOM snapshot tests or inventory markers prove presence even if no PNG ships.
- Contrast checks: primary text and interactive labels meet WCAG AA against active theme tokens.

## Change policy

- Keep this hash when adjusting copy, spacing, token values, accessibility fixes, or non-breaking markup refactors that preserve the surface’s role and landmark pattern.
- Allocate a new hash (see `tools/design-catalog/allocate-visual-hash.mjs`) when the layout’s job changes, primary landmarks move, or consumers would reasonably need a visual regression split.

## Changelog

- 2026-05-18 — Phase 04: replaced stub contract with authored guidance.
