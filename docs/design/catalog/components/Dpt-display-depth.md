# Dpt — Display depth

**Hash:** `Dpt` · **Type:** component · **Family:** spatial · **Status:** active

Source: `components/spatial.py::render_display_depth` · Showcase anchor: `#sec-display-depth`

## Purpose

Lift display typography with perspective and translateZ.

## Expected look

Headline text extruded above section plane with subtle shadow stack.

## States

Static volumetric headline.

## Deterministic checks

Oracle scenarios (see `docs/design/spatial/oracles/Dpt.json`):

- **dpt-dom-present** — root `[data-ks-hash="Dpt"]` visible; threshold 1.0 after scenario actions.

## Root element

```html
<!-- class varies: .ks-display--depth -->
<div class="ks-display--depth" hash="Dpt" data-ks-hash="Dpt"
     data-ks-type="component" data-ks-name="display-depth">
```
