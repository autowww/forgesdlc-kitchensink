# Cube glow button (`Cgb`)

**Hash:** `Cgb` · **Slug:** `cube-glow-button` · **Showcase:** `#sec-cube-btn`

Emitter: `components/spatial.py::render_cube_glow_button` · CSS root: `.ks-btn--cube`

## Purpose

Gradient CTA with pointer-tilt cube face.

## Expected behavior

Pill CTA with inner cube scene; glow on hover/focus.

## States

Default rest pose; pointer depth tilts face.

## Oracle scenarios

`cgb-dom-present`, `cgb-pointer-hover`

Machine oracle: [`../oracles/Cgb.json`](../oracles/Cgb.json) · Contract: [`../../catalog/components/Cgb-cube-glow-button.md`](../../catalog/components/Cgb-cube-glow-button.md)

## Accessibility

- Root emits `hash` and `data-ks-hash="Cgb"` with `data-ks-type="component"`.
- Interactive controls remain keyboard reachable; decorative layers use `aria-hidden` where applicable.
- Motion-heavy effects respect `prefers-reduced-motion: reduce` (see reduced-motion scenario ids).
