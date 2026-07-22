# Cube gallery (`Cbg`)

**Hash:** `Cbg` · **Slug:** `cube-gallery` · **Showcase:** `#sec-cube-gallery`

Emitter: `components/spatial.py::render_cube_gallery` · CSS root: `.ks-cube-gallery`

## Purpose

Six-face cube scene rotated by pointer X.

## Expected behavior

Perspective scene with labeled faces; pointer drives rotateY.

## States

Pointer X maps to scene rotation.

## Oracle scenarios

`cbg-dom-present`, `cbg-pointer-rotate`

Machine oracle: [`../oracles/Cbg.json`](../oracles/Cbg.json) · Contract: [`../../catalog/components/Cbg-cube-gallery.md`](../../catalog/components/Cbg-cube-gallery.md)

## Accessibility

- Root emits `hash` and `data-ks-hash="Cbg"` with `data-ks-type="component"`.
- Interactive controls remain keyboard reachable; decorative layers use `aria-hidden` where applicable.
- Motion-heavy effects respect `prefers-reduced-motion: reduce` (see reduced-motion scenario ids).
