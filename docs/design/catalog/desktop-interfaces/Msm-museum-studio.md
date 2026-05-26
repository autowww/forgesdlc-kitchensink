---
hash: "Msm"
name: "Museum studio desktop shell"
type: "desktop-interface"
status: "active"
source_paths:
  - museum/studio/index.html
showcase_url: null
screenshot_url: "https://ks.forgesdlc.com/showcase/screenshots/Msm.png"
screenshot_status: "planned"
---

# Msm — Museum studio desktop shell

## Identity

- **Hash:** Msm
- **Name:** Museum studio desktop shell
- **Type:** desktop-interface
- **Category:** desktop-interface
- **Source paths:** `museum/studio/index.html`
- **Showcase URL / status:** Local Vite bundle (see `museum/studio/` README)—not guaranteed as a single static ks.forgesdlc URL in every hosting layout.
- **Screenshot URL / status:** `https://ks.forgesdlc.com/showcase/screenshots/Msm.png` — **planned** until the capture pipeline pins a representative frame.

## Purpose

Govern the **Vite-built museum studio** shell used as a desktop-oriented explorer for KS visuals. Operators browse hashes without treating the shell as a public marketing page.

Chrome SVG assets ship under child **`vYA`**; hashed JavaScript bundles under `museum/studio/assets/` stay **deferred** from per-file registry rows until filenames stabilize (see `visual-registry-coverage.md`).

## Expected look

- Vite/Electron studio shell mirrors Forge desktop prototypes: dark panels, crisp separators, monospace-friendly diagnostics lanes ([forge-enterprise-ai-website-standard.md](../../../design/forge-enterprise-ai-website-standard.md)).
- Reads as an internal operator explorer—not a consumer landing; slightly denser chrome is acceptable when controls stay labeled.
- Co-shipped SVG chrome (**`vYA`**) aligns stroke weights with KS icon vocabulary.

## Anatomy

- **Shell (`Msm`):** HTML bootstrap, mount targets, and studio framing for nested routes/components. Semantic landmarks (`main`, `nav`) match other Forge desktop prototypes.
- **Chrome graphics (`vYA`):** `icons.svg` sprite and `favicon.svg` co-shipped with the shell.

## States

- Cold load, hydrated app state after JS bundles execute; offline/error states should remain readable (surface copy inside shell).

## Variants

- Single maintained museum variant; experimental forks need their own registry entries if visuals diverge.

## Responsive behavior

- Desktop-first; minimum widths documented in studio README should prevent crushed controls—scroll containers preferred over overlapping HUDs.

## Accessibility contract

- Keyboard traversal through chrome controls; icon-only buttons expose **`aria-label`** or visible tooltips.

## Enterprise look and feel rules

- Visual density aligns with Forge studio metaphors—muted backgrounds, high-contrast interactive accents.

## Content rules

- Avoid embedding undocumented remote assets; bundle icons locally under **`vYA`** paths.
- When adding studio copy, keep operator tone—no fabricated customer stories.

## Forbidden patterns

- Shipping mutable CDN URLs for critical chrome assets without pinning/version notes.

## Covered children

- **vYA** — `museum/studio/icons.svg`, `museum/studio/favicon.svg` (chrome graphics family-covered under this contract).

## Dependencies

- Build outputs under `museum/studio/assets/*` consumed by the shell (content-hashed filenames deferred per registry coverage notes).

## Deterministic checks

- Emitted roots include both `hash="Msm"` and `data-ks-hash="Msm"` on the studio shell wrapper (`data-ks-type="desktop-interface"`).
- When `data-persistent-chrome="true"` or `data-route-contract="persistent-shell"`, contracted regions (`header`, `nav`/`aside`, `main`) mount outside the workspace swap pane with stable `id` and `data-shell-region` markers across crawled routes.
- Global shell navigation link signatures stay identical between routes; route-local tabs and breadcrumbs live inside `main` only.
- Chrome SVG assets under **`vYA`** resolve from bundled paths—no undocumented remote chrome URLs in production shells.

## Implementation notes

- Rebuild studio after structural edits; keep registry **`notes`** on the `Msm` row synchronized when deferring hashed chunk files.

## Screenshot acceptance

- Planned PNG must show framed studio chrome clearly; until capture lands, rely on local smoke tests and checklist in `visual-registry-coverage.md`.
- Deferred bundles must not block screenshot tasks for the shell frame itself.

## Change policy

Keep **`Msm`** for iterative studio refinements; allocate successor hashes only when the shell pattern forks visually for a different product.

## Changelog

- Phase 03: replaced stub markers; clarified chrome versus deferred bundles.
- 2026-05-18 — Phase 04: Identity, Covered children, screenshot acceptance, section alignment.
