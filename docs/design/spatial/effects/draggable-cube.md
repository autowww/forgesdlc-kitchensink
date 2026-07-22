# Draggable cube (`Dcb`)

**Hash:** `Dcb` · **Slug:** `draggable-cube` · **Showcase:** `#sec-draggable-cube`

Emitter: `components/spatial.py::render_draggable_cube` · CSS root: `.ks-cube--draggable`

## Purpose

Drag-to-rotate cube with face lighting simulation.

## Expected behavior

Cube scene; drag updates rotation; face opacity simulates light.

## States

Idle; dragging rotates scene.

## Oracle scenarios

`dcb-dom-present`, `dcb-drag-rotate`

Machine oracle: [`../oracles/Dcb.json`](../oracles/Dcb.json) · Contract: [`../../catalog/components/Dcb-draggable-cube.md`](../../catalog/components/Dcb-draggable-cube.md)

## Accessibility

- Root emits `hash` and `data-ks-hash="Dcb"` with `data-ks-type="component"`.
- Interactive controls remain keyboard reachable; decorative layers use `aria-hidden` where applicable.
- Motion-heavy effects respect `prefers-reduced-motion: reduce` (see reduced-motion scenario ids).
