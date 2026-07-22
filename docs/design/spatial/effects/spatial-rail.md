# Spatial rail (`Srl`)

**Hash:** `Srl` · **Slug:** `spatial-rail` · **Showcase:** `#sec-spatial-rail`

Emitter: `components/spatial.py::render_spatial_rail` · CSS root: `.fs-rail--spatial`

## Purpose

Coverflow card rail — scroll shifts per-item rotateY and translateZ.

## Expected behavior

Horizontal scroll track; center item prominent; side items angled.

## States

Scroll updates --ks-rail-ry and --ks-rail-z per item.

## Oracle scenarios

`srl-dom-present`, `srl-scroll-coverflow`, `srl-orbit-mode`

Machine oracle: [`../oracles/Srl.json`](../oracles/Srl.json) · Contract: [`../../catalog/components/Srl-spatial-rail.md`](../../catalog/components/Srl-spatial-rail.md)

## Accessibility

- Root emits `hash` and `data-ks-hash="Srl"` with `data-ks-type="component"`.
- Interactive controls remain keyboard reachable; decorative layers use `aria-hidden` where applicable.
- Motion-heavy effects respect `prefers-reduced-motion: reduce` (see reduced-motion scenario ids).
