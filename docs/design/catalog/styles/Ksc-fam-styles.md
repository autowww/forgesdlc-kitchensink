---
hash: "Ksc"
name: "Kitchen Sink stylesheets"
type: "style-family"
status: "active"
source_paths: ["css/forge-theme.css","css/forge-react-primitives.css","css/script-assembly.css","css/forge-fleet-admin.css","css/tile-dropdown.css","css/nested-roadmap.css","css/forgesdlc-theme.css","css/docs-theme.css","css/wizard-flow.css","css/workspace-lens.css","css/forgesdlc-pack-minimal.css","css/forgesdlc-pack-contrast.css","css/forgesdlc-pack-focus.css","css/forgesdlc-pack-showcase.css","css/forgesdlc-pack-enterprise.css","css/forge-data-charts.css","css/forge-ambient.css","css/forge-ambient-themes.css","css/ks-living-background.css","css/forge-light-theme.css","css/svg-background-gallery.css","css/ks-animated-backgrounds.css"]
showcase_url: ""
screenshot_url: ""
screenshot_status: "not-applicable"
---

# Ksc — Kitchen Sink stylesheets

## Identity

- **Hash:** Ksc
- **Name:** Kitchen Sink stylesheets
- **Type:** style-family
- **Category:** CSS themes and assemblies
- **Source paths:** see frontmatter (full CSS inventory)
- **Showcase URL / status:** Styles apply across showcase and consumers—no isolated URL.
- **Screenshot URL / status:** Not applicable at family row; verify via composed pages per child hash.

## Purpose

Roll-up contract for Kitchen Sink CSS. Concrete visuals are attributed per **child** registry hashes (**`Ech`**, **`Mar`**, **`DVN`**, **`FXK`**, **`KEm`**) so generators and reviewers can trace stylesheet changes to the right governance row.

## Expected look

- **Layered themes:** core Forge / product / handbook tokens (**`Ech`**) set baseline typography, surfaces, and accent discipline ([forge-enterprise-ai-website-standard.md](../../../design/forge-enterprise-ai-website-standard.md)).
- **Composed assemblies:** shared controls, roadmaps, charts, and motion helpers (**`DVN`**) keep museum and consumer pages visually coherent without one-off CSS islands.
- **Desktop chrome:** Fleet admin, wizard, and workspace lens shells (**`FXK`**) read as operator-grade dark UI with readable focus and dense tables.
- **Ambient layers:** gradients/noise/backdrops (**`KEm`**) stay subordinate to foreground content and honor reduced-motion companions (**`Ksj`**).

## Anatomy

- **Layered themes:** core Forge / product / handbook tokens (**`Ech`**), optional preset packs and light surfaces (**`Mar`**).
- **Composed UI:** primitives assembly, roadmap, charts, motion-backed backgrounds (**`DVN`**).
- **Desktop-style shells:** Fleet admin, wizard, workspace lens chrome (**`FXK`**).
- **Atmospheric layers:** ambient backgrounds and theme variants (**`KEm`**).

## Content rules

- Prefer tokens and documented spacing rhythm from the Forge enterprise UI docs; avoid ad-hoc hex stacks unless migrating tokens deliberately.
- Packs (**`Mar`**) may swap accents and density but must keep WCAG contrast for core body and interactive targets unless explicitly labeled experimental.

## States

- Default theme loads plus optional **`prefers-color-scheme`** / runtime toggles driven by **`TNH`** scripts (`forge-theme.js`, ambient companions).

## Variants

- **Core (`Ech`), packs/light (`Mar`), shared assemblies (`DVN`), desktop chrome (`FXK`), ambient (`KEm`)** — each maps to registry paths listed below.

## Responsive behavior

- Layout breakpoints align with Bootstrap 5 conventions inherited by KS pages; chrome-heavy surfaces (**`FXK`**) must keep usable tap targets at narrow widths.

## Accessibility contract

- Visible focus rings remain readable against KS backgrounds; motion-heavy backgrounds (**`DVN`**, **`KEm`**) pair with **`prefers-reduced-motion`** handling implemented in companion scripts (see **`Ksj`** family).

## Enterprise look and feel rules

- Typography and color ramps stay consistent with Forge marketing and handbook consumers; avoid novelty gradients that break trust-heavy tone.

## Forbidden patterns

- Shipping unreadable contrast for primary actions solely for aesthetic effect.
- Hidden reliance on motion-only cues without static equivalents.

## Source paths

- `css/forge-theme.css`
- `css/forge-react-primitives.css`
- `css/script-assembly.css`
- `css/forge-fleet-admin.css`
- `css/tile-dropdown.css`
- `css/nested-roadmap.css`
- `css/forgesdlc-theme.css`
- `css/docs-theme.css`
- `css/wizard-flow.css`
- `css/workspace-lens.css`
- `css/forgesdlc-pack-minimal.css`
- `css/forgesdlc-pack-contrast.css`
- `css/forgesdlc-pack-focus.css`
- `css/forgesdlc-pack-showcase.css`
- `css/forgesdlc-pack-enterprise.css`
- `css/forge-data-charts.css`
- `css/forge-ambient.css`
- `css/forge-ambient-themes.css`
- `css/ks-living-background.css`
- `css/forge-light-theme.css`
- `css/svg-background-gallery.css`
- `css/ks-animated-backgrounds.css`

## Covered children

- **Ech** — Core site themes: `forge-theme.css`, `forgesdlc-theme.css`, `docs-theme.css`.
- **Mar** — Theme packs and light theme: `forgesdlc-pack-*.css`, `forge-light-theme.css`.
- **DVN** — Shared UI and diagram surfaces (primitives assembly, roadmaps, charts, motion helpers).
- **FXK** — Desktop chrome: Fleet admin, wizard flow, workspace lens.
- **KEm** — Ambient layers: `forge-ambient.css`, `forge-ambient-themes.css`.

## Dependencies

- Bootstrap 5.3 baseline referenced through Forge KS layouts and components.
- Companion **`Ksj`** interaction modules attach classes and data attributes expected by these sheets.

## Implementation notes

- When splitting or merging CSS groups, update the corresponding child hash (`Ech`, `Mar`, `DVN`, `FXK`, `KEm`) before merge.

## Screenshot acceptance

- No family-level PNG; regression relies on page screenshots plus visual diff tooling when enabled.

## Change policy

Keep **`Ksc`** for compatible refinements; allocate new child hashes when a stylesheet group gains an independent visual identity consumers must pin separately.

## Changelog

- Phase 03: replaced stub markers; documented child constraints and governance expectations.
- 2026-05-18 — Phase 04: Identity, Covered children, implementation notes alignment.
