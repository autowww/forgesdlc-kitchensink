# Floating header (`Flh`)

**Hash:** `Flh` · **Slug:** `floating-header` · **Showcase:** `#sec-floating-header`

Emitter: `components/spatial.py::render_floating_header` · CSS root: `.ks-display--depth--float`

## Purpose

Scroll-linked volumetric headline variant.

## Expected behavior

Display depth text with scroll-driven float offset.

## States

Scroll updates translateZ/offset; reduced motion static depth.

## Oracle scenarios

`flh-dom-present`, `flh-scroll-offset`

Machine oracle: [`../oracles/Flh.json`](../oracles/Flh.json) · Contract: [`../../catalog/components/Flh-floating-header.md`](../../catalog/components/Flh-floating-header.md)

## Accessibility

- Root emits `hash` and `data-ks-hash="Flh"` with `data-ks-type="component"`.
- Interactive controls remain keyboard reachable; decorative layers use `aria-hidden` where applicable.
- Motion-heavy effects respect `prefers-reduced-motion: reduce` (see reduced-motion scenario ids).
