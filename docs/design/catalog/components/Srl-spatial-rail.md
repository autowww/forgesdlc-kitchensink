# Srl — Spatial rail

**Hash:** `Srl` · **Type:** component · **Family:** spatial · **Status:** active

Source: `components/spatial.py::render_spatial_rail` · Showcase anchor: `#sec-spatial-rail`

## Purpose

Coverflow card rail — scroll shifts per-item rotateY and translateZ.

## Expected look

Horizontal scroll track; center item prominent; side items angled.

## States

Scroll updates --ks-rail-ry and --ks-rail-z per item.

## Deterministic checks

Oracle scenarios (see `docs/design/spatial/oracles/Srl.json`):

- **srl-dom-present** — root `[data-ks-hash="Srl"]` visible; threshold 1.0 after scenario actions.
- **srl-scroll-coverflow** — root `[data-ks-hash="Srl"]` visible; threshold 1.0 after scenario actions.

## Root element

```html
<!-- class varies: .fs-rail--spatial -->
<div class="fs-rail--spatial" hash="Srl" data-ks-hash="Srl"
     data-ks-type="component" data-ks-name="spatial-rail">
```
