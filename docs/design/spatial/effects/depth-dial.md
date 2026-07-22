# Depth dial (`Dil`)

**Hash:** `Dil` · **Slug:** `depth-dial` · **Showcase:** `#sec-depth-dial`

Emitter: `components/spatial.py::render_depth_dial` · CSS root: `.ks-dial--depth`

## Purpose

Conic-gradient dial showing value via @property --ks-dial-angle.

## Expected behavior

Circular dial with centered value label and depth ring.

## States

Static angle from inline style or CSS var.

## Oracle scenarios

`dil-dom-present`

Machine oracle: [`../oracles/Dil.json`](../oracles/Dil.json) · Contract: [`../../catalog/components/Dil-depth-dial.md`](../../catalog/components/Dil-depth-dial.md)

## Accessibility

- Root emits `hash` and `data-ks-hash="Dil"` with `data-ks-type="component"`.
- Interactive controls remain keyboard reachable; decorative layers use `aria-hidden` where applicable.
- Motion-heavy effects respect `prefers-reduced-motion: reduce` (see reduced-motion scenario ids).
