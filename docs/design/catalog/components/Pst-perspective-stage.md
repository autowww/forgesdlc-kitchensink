# Pst — Perspective stage

**Hash:** `Pst` · **Type:** component · **Family:** spatial · **Status:** active

Source: `components/spatial.py::render_perspective_stage` · Showcase anchor: `#sec-perspective-stage`

## Purpose

Section wrapper with layered translateZ content plane.

## Expected look

Stage section; child layer floats above background plane.

## States

Static staged depth.

## Deterministic checks

Oracle scenarios (see `docs/design/spatial/oracles/Pst.json`):

- **pst-dom-present** — root `[data-ks-hash="Pst"]` visible; threshold 1.0 after scenario actions.

## Root element

```html
<!-- class varies: .ks-section--perspective-stage -->
<div class="ks-section--perspective-stage" hash="Pst" data-ks-hash="Pst"
     data-ks-type="component" data-ks-name="perspective-stage">
```
