# Mpx — Media frame parallax

**Hash:** `Mpx` · **Type:** component · **Family:** spatial · **Status:** active

Source: `components/spatial.py::render_media_frame_parallax` · Showcase anchor: `#sec-media-parallax`

## Purpose

Inner media layer depth shift on hover.

## Expected look

Card frame; inner content scales and translateZ on hover.

## States

Rest flat; hover parallax lift.

## Deterministic checks

Oracle scenarios (see `docs/design/spatial/oracles/Mpx.json`):

- **mpx-dom-present** — root `[data-ks-hash="Mpx"]` visible; threshold 1.0 after scenario actions.
- **mpx-hover-lift** — root `[data-ks-hash="Mpx"]` visible; threshold 1.0 after scenario actions.

## Root element

```html
<!-- class varies: .ks-media--frame-parallax -->
<div class="ks-media--frame-parallax" hash="Mpx" data-ks-hash="Mpx"
     data-ks-type="component" data-ks-name="media-parallax">
```
