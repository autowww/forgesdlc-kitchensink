---
hash: "Frp"
name: "Forge React primitives"
type: "page"
status: "active"
source_paths:
  - generator/pages/forge_react_primitives.py
showcase_url: "https://ks.forgesdlc.com/cases/showcase/forge-react-primitives.html"
screenshot_url: "https://ks.forgesdlc.com/cases/showcase/screenshots/Frp.png"
screenshot_status: "planned"
---

# Frp — Forge React primitives

## Identity

- **Hash:** Frp
- **Name:** Forge React primitives
- **Type:** page
- **Category:** page
- **Source paths:** `generator/pages/forge_react_primitives.py`
- **Showcase URL / status:** https://ks.forgesdlc.com/cases/showcase/forge-react-primitives.html (active preview page)
- **Screenshot URL / status:** https://ks.forgesdlc.com/cases/showcase/screenshots/Frp.png — status **planned**

## Purpose

Showcase museum page **forge-react-primitives** (`generator/pages/forge-react-primitives.py`) documenting Forge React primitives patterns for KS maintainers and consumers.

## Expected look

- **React primitives** museum page hosts interactive **Rpf** family components—studio chrome, monospace data lanes, disciplined status signals.
- Each mount exposes child hashes via `data-ks-hash`; styling flows from `forge-react-primitives.css` ([forge-enterprise-ai-website-standard.md](../../../design/forge-enterprise-ai-website-standard.md)).

## Anatomy

`main#main` content region inside the showcase shell, with sections composed from Python page builders and `Kpr` renderers as needed.

Registry **root_selector:** `main#main`.

## States

- **Default:** stable layout chrome and main content visible.
- **Interactive:** expand/collapse, modal, or nav open states only where the page or chrome contract includes those behaviors—preserve focus management documented under Accessibility.
- **Loading / empty:** museum pages should still render landmarks if a section has no examples; consumer pages should print helpful empty copy (not blank silence).
- **Reduced motion:** decorative motion (backgrounds, carousels) must degrade when users prefer reduced motion (`Ksj` / `Ksc` coordination).

## Variants

- Single canonical visual identity per hash; Do not ship alternate themes per hash. Theme packs (`Ksc` children) may restyle tokens but must not break landmark structure or hash roots.

## Responsive behavior

- Interactive demos stack; grids horizontal-scroll inside labelled panels.

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

- Showcase/build output honors **Frp** markers: emitted roots include both `hash="Frp"` and `data-ks-hash="Frp"` where `emit_marker_in_showcase` / museum rules apply.
- Structural root for audits: main#main: DOM snapshots and screenshot acceptance anchor here or at an explicitly documented child.
- Page generator `forge_react_primitives.py` composes inside the advertised parent layout; built HTML for slug `forge-react-primitives` includes the nested layout hash markers expected by showcase inventory.
- `main#main` (or contracted root) headings follow one H1 convention per view; supplementary cards do not spoof heading levels.

## AI-enabled review cues

- Does **Forge React primitives** storytelling match the KS museum intent (education, reassurance, parity with consumer sites), not accidental placeholder copy?
- Are technical blocks (API tables, prose blocks) progressively disclosed consistent with Forge landing doctrine?
- Screenshot or DOM review: hero / first-scroll real estate reinforces the visitor job for **forge-react-primitives**.

## Forbidden patterns

- Anonymous wrapper stacks with no landmarks for primary content.
- Icon-only controls in chrome without accessible names.
- Rendering full site indexes or auto link walls in hero regions reserved for human-curated messaging.
- Hard-coded animation that cannot be reduced or disabled when motion preference requests it.

## Implementation notes

Implemented in `generator/pages/forge-react-primitives.py`; registered in showcase build. Cross-check markers with inventory output.

## Screenshot acceptance

- When **screenshot_status** is `planned` or `captured`, imagery must show the hash-bearing root (or representative child clearly tied to this hash) at a neutral desktop width (~1440px) unless the contract targets mobile-only surfaces.
- Chrome-only hashes may remain textual acceptance: DOM snapshot tests or inventory markers prove presence even if no PNG ships.
- Contrast checks: primary text and interactive labels meet WCAG AA against active theme tokens.

## Change policy

- Keep this hash when adjusting copy, spacing, token values, accessibility fixes, or non-breaking markup refactors that preserve the surface’s role and landmark pattern.
- Allocate a new hash (see `tools/design-catalog/allocate-visual-hash.mjs`) when the layout’s job changes, primary landmarks move, or consumers would reasonably need a visual regression split.

## Changelog

- 2026-05-18 — Phase 04: replaced stub contract with authored guidance.
