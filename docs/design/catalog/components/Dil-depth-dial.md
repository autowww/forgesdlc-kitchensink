# Dil — Depth dial

**Hash:** `Dil` · **Type:** component · **Family:** spatial · **Status:** active

Source: `components/spatial.py::render_depth_dial` · Showcase anchor: `#sec-depth-dial`

## Purpose

Conic-gradient dial showing value via @property --ks-dial-angle.

## Expected look

Circular dial with centered value label and depth ring.

## States

Static angle from inline style or CSS var.

## Deterministic checks

Oracle scenarios (see `docs/design/spatial/oracles/Dil.json`):

- **dil-dom-present** — root `[data-ks-hash="Dil"]` visible; threshold 1.0 after scenario actions.

## Root element

```html
<!-- class varies: .ks-dial--depth -->
<div class="ks-dial--depth" hash="Dil" data-ks-hash="Dil"
     data-ks-type="component" data-ks-name="depth-dial">
```
