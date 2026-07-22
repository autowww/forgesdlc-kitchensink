# Media frame parallax (`Mpx`)

**Hash:** `Mpx` · **Slug:** `media-parallax` · **Showcase:** `#sec-media-parallax`

Emitter: `components/spatial.py::render_media_frame_parallax` · CSS root: `.ks-media--frame-parallax`

## Purpose

Inner media layer depth shift on hover.

## Expected behavior

Card frame; inner content scales and translateZ on hover.

## States

Rest flat; hover parallax lift.

## Oracle scenarios

`mpx-dom-present`, `mpx-hover-lift`

Machine oracle: [`../oracles/Mpx.json`](../oracles/Mpx.json) · Contract: [`../../catalog/components/Mpx-media-parallax.md`](../../catalog/components/Mpx-media-parallax.md)

## Accessibility

- Root emits `hash` and `data-ks-hash="Mpx"` with `data-ks-type="component"`.
- Interactive controls remain keyboard reachable; decorative layers use `aria-hidden` where applicable.
- Motion-heavy effects respect `prefers-reduced-motion: reduce` (see reduced-motion scenario ids).
