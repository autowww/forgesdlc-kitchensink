# Tlz — tilt

**Hash:** `Tlz` · **Type:** component · **Family:** spatial · **Status:** active

Source: `components/spatial.py::render_tilt_css_card` · Showcase anchor: `#sec-tilt-css`

## Purpose

Nine-zone pointer tilt without JavaScript via sibling selectors.

## Expected look

Forge card inner surface tilts subtly when a zone radio is selected.

## States

Neutral center; zone selection applies rotateX/Y on inner card.

## Deterministic checks

Oracle scenarios (see `docs/design/spatial/oracles/Tlz.json`):

- **tlz-dom-present** — root `[data-ks-hash="Tlz"]` visible; threshold 1.0 after scenario actions.
- **tlz-zone-select** — root `[data-ks-hash="Tlz"]` visible; threshold 1.0 after scenario actions.

## Root element

```html
<!-- class varies: .ks-tilt--css -->
<div class="ks-tilt--css" hash="Tlz" data-ks-hash="Tlz"
     data-ks-type="component" data-ks-name="tilt-css">
```
