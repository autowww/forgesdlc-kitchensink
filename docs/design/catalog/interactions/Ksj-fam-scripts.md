---
hash: "Ksj"
name: "Kitchen Sink interaction scripts"
type: "script-family"
status: "active"
source_paths: ["js/nested-roadmap.js","js/showcase.js","js/forge-theme.js","js/ks-diagram-modal.js","js/forge-data-charts.js","js/roadmap-dates.js","js/ks-tilt-tiles.js","js/ks-diagram-catalog.js","js/ks-animated-backgrounds.js","js/forge-ambient.js","js/ks-living-motion.js","js/fs-home-expand-tiles.js","js/fs-nav-dropdown.js","js/diagram-modal-zoom.js","js/fs-presentation.js","js/svg-background-gallery.js","js/portal-nav.js","js/docs-nav.js"]
showcase_url: ""
screenshot_url: ""
screenshot_status: "not-applicable"
---

# Ksj — Kitchen Sink interaction scripts

## Identity

- **Hash:** Ksj
- **Name:** Kitchen Sink interaction scripts
- **Type:** script-family
- **Category:** client-side interaction modules
- **Source paths:** see frontmatter (`js/*.js` list)
- **Showcase URL / status:** Behaviors exercised across many showcase pages—not one bundle URL.
- **Screenshot URL / status:** Not applicable at family row; capture motion/nav states on affected pages or recordings when helpful.

## Purpose

Govern client-side behaviors shipped under `js/`. Child registry rows (**`LJa`**, **`TNH`**, **`Kfr`**, **`pUW`**, **`Bru`**) group modules by navigation, motion/theme, diagrams, roadmap editing, and presentation tiles so inventory ↔ registry alignment stays testable.

## Expected look

- Progressive enhancement on KS pages: expanded nav/dropdowns keep visible focus paths; modal/chart surfaces use restrained status coloring ([forge-enterprise-ai-website-standard.md](../../../design/forge-enterprise-ai-website-standard.md)).
- Motion-backed scripts (**`TNH`**, ambient companions) honor reduction prefs—static layouts remain credible when animation is off.
- Presentation and roadmap interactions expose explicit affordances (fullscreen exit, edit handles) suitable for operator tooling.

## Anatomy

- **Navigation (`LJa`):** portal/docs/showcase menus and dropdown affordances.
- **Theme & motion (`TNH`):** runtime theme selection, ambient layers, optional motion for backgrounds and living SVG scenes (respecting reduction prefs).
- **Diagrams & charts (`Kfr`):** modal hosts, zoom, catalog browsing, chart bindings.
- **Roadmap (`pUW`):** nested roadmap interactions and timeline edits.
- **Presentation (`Bru`):** fullscreen decks, tilt tiles, home tile expansion.

## Content rules

- Scripts attach to DOM hooks emitted by Python/React primitives; do not require undocumented IDs.
- Progressive enhancement: core content remains usable when JS fails aside from explicitly interactive demos.

## States

- Default plus modal-open, expanded-nav, presentation-fullscreen, and reduced-motion branches where implemented.

## Variants

- Split strictly along **child hashes** in `visual-registry.yaml`; avoid registering unrelated bundles on the same row.

## Responsive behavior

- Touch-friendly hit areas for nav (`LJa`); chart/modal flows usable at narrow widths (`Kfr`).

## Accessibility contract

- Keyboard reachability for nav and modal closures; focus trapping inside modal shells where applicable.
- Respect **`prefers-reduced-motion`** for ambient/motion scripts coordinated with **`TNH`** and **`Ksc`** layers.

## Enterprise look and feel rules

- Motion accents reinforce hierarchy rather than distract; keep durations moderate.

## Deterministic checks

- Scripts respect `prefers-reduced-motion` for decorative transitions tied to KS surfaces (`DET.MOTION.PREFERS_REDUCED`).
- No autoplay flash or seizure-risk loops on public pages (`DET.MOTION.NO_AUTO_PLAY_FLASH`).
- Progressive enhancement: core navigation and modals work without script errors in auditor smoke (`DET.JS.PROGRESSIVE`, `DET.JS.NO_CONSOLE_ERROR`).

## Forbidden patterns

- Hijacking global shortcuts without documented affordances.
- Sole reliance on hover-only controls without keyboard/touch equivalents.

## Source paths

- `js/nested-roadmap.js`
- `js/showcase.js`
- `js/forge-theme.js`
- `js/ks-diagram-modal.js`
- `js/forge-data-charts.js`
- `js/roadmap-dates.js`
- `js/ks-tilt-tiles.js`
- `js/ks-diagram-catalog.js`
- `js/ks-animated-backgrounds.js`
- `js/forge-ambient.js`
- `js/ks-living-motion.js`
- `js/fs-home-expand-tiles.js`
- `js/fs-nav-dropdown.js`
- `js/diagram-modal-zoom.js`
- `js/fs-presentation.js`
- `js/svg-background-gallery.js`
- `js/portal-nav.js`
- `js/docs-nav.js`

## Covered children

- **LJa** — Portal, docs, nav, showcase: `portal-nav.js`, `docs-nav.js`, `fs-nav-dropdown.js`, `showcase.js`.
- **TNH** — Theme, ambient, motion: `forge-theme.js`, `forge-ambient.js`, `ks-living-motion.js`, `ks-animated-backgrounds.js`, `svg-background-gallery.js`.
- **Kfr** — Diagrams and charts: `ks-diagram-modal.js`, `diagram-modal-zoom.js`, `ks-diagram-catalog.js`, `forge-data-charts.js`.
- **pUW** — Roadmap: `nested-roadmap.js`, `roadmap-dates.js`.
- **Bru** — Tiles and presentation: `fs-presentation.js`, `ks-tilt-tiles.js`, `fs-home-expand-tiles.js`.

## Dependencies

- DOM structures from **`Kpr`** components and **`Rpf`** React primitives plus stylesheet hooks from **`Ksc`** children.

## Implementation notes

- Add new modules under `js/` and register them on the correct child hash (`LJa`, `TNH`, `Kfr`, `pUW`, `Bru`) in `visual-registry.yaml`.

## Screenshot acceptance

- Prefer lightweight screen recordings or stills for modal/nav transitions; static PNGs optional. Automated checks should ensure scripts load without uncaught exceptions on showcase pages.

## Change policy

Keep **`Ksj`** as roll-up; add modules by extending the correct child row's **`source_paths`** or allocating a new hash when behavior splits visually.

## Changelog

- Phase 03: replaced stub markers; clarified child grouping and accessibility expectations.
- 2026-05-18 — Phase 04: Identity, Covered children, implementation and acceptance alignment.
