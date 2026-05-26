---
hash: "Kpr"
name: "Python HTML renderer helpers"
type: "python-renderer-family"
status: "active"
source_paths: ["components/components.py","components/presentation.py","components/enterprise_marketing.py","components/marketing_sections.py","components/nested_roadmap.py","components/diagram_catalog.py","components/transforms.py","components/living_background.py","components/roadmap_date_editor.py","components/diagram_modal_fragment.py"]
showcase_url: ""
screenshot_url: ""
screenshot_status: "not-applicable"
---

# Kpr — Python HTML renderer helpers

## Identity

- **Hash:** Kpr
- **Name:** Python HTML renderer helpers
- **Type:** python-renderer-family
- **Category:** governed Python modules emitting HTML fragments
- **Source paths:** see frontmatter (all `components/*.py` covered by child hashes)
- **Showcase URL / status:** No single URL; validation happens on showcase pages composing these modules.
- **Screenshot URL / status:** Not applicable at family level; capture via layout and page registry rows.

## Purpose

Govern Python modules that emit HTML fragments for KS generators and consumers. Child hashes (**`VtQ`** … **`Khx`**) map one-to-one with `components/*.py` surfaces so inventory anchors stay precise.

## Expected look

- Emitted fragments inherit **`Ksc`** tokens—readable body type, disciplined accents, no orphaned bespoke hex stacks ([forge-enterprise-ai-website-standard.md](../../../design/forge-enterprise-ai-website-standard.md)).
- Builders favor semantic sections sized for handbook/product shells inside existing layouts—not alternate mastheads that fight **Kpn**/**Hbk** landmarks.
- **`Khx`** helpers keep hash markers deterministic in DOM; other modules bias toward quiet separators and evidence-first density.

## Anatomy

- **Composable UI builders (`VtQ`, `pvx`, `rJd`, `VPc`):** cards, heroes, marketing slices, presentation shells.
- **Structural flows (`ARv`, `Gtf`, `nzA`):** roadmap, diagram catalog/listing, modal fragments.
- **Transforms & chrome (`qrv`):** HTML transforms applied across layouts.
- **Living backgrounds (`vZr`):** SVG/CSS-backed scenic blocks.
- **Editors (`bNG`):** roadmap date tooling embedded in pages.
- **Hash utilities (`Khx`):** standardized `hash` / `data-ks-hash` attribute emission helpers.

## Content rules

- Visible roots produced by these modules must emit **`hash="XYZ"`** and **`data-ks-hash="XYZ"`** matching their registry hash unless explicitly covered by a layout parent documented in the row notes.
- Prefer semantic HTML landmarks consistent with layouts in `components/layouts.py`.

## States

- Default rendering plus interactive states declared per component (expanded nav, modal open, editing mode) where applicable.

## Variants

- Split along module boundaries listed under **Per-module registry children**; do not merge unrelated renderers on one hash.

## Responsive behavior

- Patterns inherit KS grid/spacing; marketing and roadmap modules must collapse cleanly at mobile breakpoints without horizontal scroll traps.

## Accessibility contract

- Interactive controls expose names and roles; modal fragments coordinate focus return; diagrams include textual summaries when acting as primary content.

## Enterprise look and feel rules

- Dense data displays (roadmaps, catalogs) prioritize scanability—consistent typography scale and muted chrome.

## Deterministic checks

- Showcase/build output honors family hashes under **Kpr** (`hash` / `data-ks-hash` on governed roots per child contract).
- Python renderers emit expected landmarks and card titles; elevated surfaces use `var(--forge-*)` elevation tokens, not raw `box-shadow` literals (`DET.SURFACE.ELEVATION_TOKEN`).
- Inventory crosswalk lists each child hash with `source_paths` and registry status (`DET.INVENTORY.CROSSWALK`, `DET.HASH.REGISTRY_ROW`).

## Forbidden patterns

- Emitting anonymous `<div>` soup without landmarks for primary sections.
- Hard-coded external brand assets without licensing notes.

## Source paths

- `components/components.py`
- `components/presentation.py`
- `components/enterprise_marketing.py`
- `components/marketing_sections.py`
- `components/nested_roadmap.py`
- `components/diagram_catalog.py`
- `components/transforms.py`
- `components/living_background.py`
- `components/roadmap_date_editor.py`
- `components/diagram_modal_fragment.py`

## Covered children

- **VtQ** — `components/components.py`
- **pvx** — `components/presentation.py`
- **rJd** — `components/enterprise_marketing.py`
- **VPc** — `components/marketing_sections.py`
- **ARv** — `components/nested_roadmap.py`
- **Gtf** — `components/diagram_catalog.py`
- **qrv** — `components/transforms.py`
- **vZr** — `components/living_background.py`
- **bNG** — `components/roadmap_date_editor.py`
- **nzA** — `components/diagram_modal_fragment.py`
- **Khx** — `components/ks_hash_attrs.py`, `components/ks_catalog_hashes.py` (hash attributes and catalog layout wiring)

## Dependencies

- Layout helpers from `components/layouts.py`, styling from **`Ksc`** children, optional behaviors from **`Ksj`** scripts.

## Implementation notes

- Import renderers from `components/*.py`; use `ks_hash_attrs` / `chrome_region_attrs` helpers for marker emission.
- When adding a module, extend the correct child hash row in `visual-registry.yaml` before merging.

## Screenshot acceptance

- No family PNG; accept screenshots on pages that compose each module (see page/layout contracts). DOM snapshots must show child hashes on visible roots.

## Change policy

Keep **`Kpr`** roll-up; add modules by extending child rows or allocating hashes when an emitter splits responsibilities.

## Changelog

- Phase 03: replaced stub markers; documented module-level constraints.
- 2026-05-18 — Phase 04: Identity, Covered children label, implementation and screenshot acceptance sections.
