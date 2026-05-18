# 01 — Discover current visual inventory

## Goal

Produce a source-derived list of all hash-addressable KS visuals with no reliance on example registry hashes.

## Files to inspect

- `components/layouts.py`, `components/*.py`
- `generator/pages/*.py`, `generator/layout_previews.py`, `generator/build-showcase.py`
- `react/*.tsx`, `showcase-react-app/src/**/*`
- `css/*.css`, `js/*.js`, `assets/svg/*.svg`
- `museum/studio/**/*`
- `docs/design/*.md`, `docs/PAGE-LAYOUT-TAXONOMY.md`

## Expected changes

- `docs/design/catalog/visual-inventory.generated.json`
- `docs/design/catalog/visual-inventory.generated.md`

## Inventory record fields (kit)

`proposed_name`, `proposed_slug`, `proposed_type`, `source_path`, `source_symbol`, `visual_root_selector` (guess), page/showcase path guess, `needs_own_contract`, `family_group`, `confidence`, `notes`.

## Validation

`node tools/design-catalog/inventory-ks-visuals.mjs --repo . --out docs/design/catalog/visual-inventory.generated.json`

## Stop condition

Inventory + coverage summary complete; **no** final hash allocation (that is `03`).

## Risks

False negatives on dynamic HTML; mark `confidence: low` and follow up.
