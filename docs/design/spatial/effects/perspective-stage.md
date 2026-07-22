# Perspective stage (`Pst`)

**Hash:** `Pst` · **Slug:** `perspective-stage` · **Showcase:** `#sec-perspective-stage`

Emitter: `components/spatial.py::render_perspective_stage` · CSS root: `.ks-section--perspective-stage`

## Purpose

Section wrapper with layered translateZ content plane.

## Expected behavior

Stage section; child layer floats above background plane.

## States

Static staged depth.

## Oracle scenarios

`pst-dom-present`

Machine oracle: [`../oracles/Pst.json`](../oracles/Pst.json) · Contract: [`../../catalog/components/Pst-perspective-stage.md`](../../catalog/components/Pst-perspective-stage.md)

## Accessibility

- Root emits `hash` and `data-ks-hash="Pst"` with `data-ks-type="component"`.
- Interactive controls remain keyboard reachable; decorative layers use `aria-hidden` where applicable.
- Motion-heavy effects respect `prefers-reduced-motion: reduce` (see reduced-motion scenario ids).
