# Cbg — Cube gallery

**Hash:** `Cbg` · **Type:** component · **Family:** spatial · **Status:** active

Source: `components/spatial.py::render_cube_gallery` · Showcase anchor: `#sec-cube-gallery`

## Purpose

Six-face cube scene rotated by pointer X.

## Expected look

Perspective scene with labeled faces; pointer drives rotateY.

## States

Pointer X maps to scene rotation.

## Deterministic checks

Oracle scenarios (see `docs/design/spatial/oracles/Cbg.json`):

- **cbg-dom-present** — root `[data-ks-hash="Cbg"]` visible; threshold 1.0 after scenario actions.
- **cbg-pointer-rotate** — root `[data-ks-hash="Cbg"]` visible; threshold 1.0 after scenario actions.

## Root element

```html
<!-- class varies: .ks-cube-gallery -->
<div class="ks-cube-gallery" hash="Cbg" data-ks-hash="Cbg"
     data-ks-type="component" data-ks-name="cube-gallery">
```
