# Cgb — Cube glow button

**Hash:** `Cgb` · **Type:** component · **Family:** spatial · **Status:** active

Source: `components/spatial.py::render_cube_glow_button` · Showcase anchor: `#sec-cube-btn`

## Purpose

Gradient CTA with pointer-tilt cube face.

## Expected look

Pill CTA with inner cube scene; glow on hover/focus.

## States

Default rest pose; pointer depth tilts face.

## Deterministic checks

Oracle scenarios (see `docs/design/spatial/oracles/Cgb.json`):

- **cgb-dom-present** — root `[data-ks-hash="Cgb"]` visible; threshold 1.0 after scenario actions.
- **cgb-pointer-hover** — root `[data-ks-hash="Cgb"]` visible; threshold 1.0 after scenario actions.

## Root element

```html
<!-- class varies: .ks-btn--cube -->
<div class="ks-btn--cube" hash="Cgb" data-ks-hash="Cgb"
     data-ks-type="component" data-ks-name="cube-glow-button">
```
