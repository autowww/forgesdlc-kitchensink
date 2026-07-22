# Dcb — Draggable cube

**Hash:** `Dcb` · **Type:** component · **Family:** spatial · **Status:** active

Source: `components/spatial.py::render_draggable_cube` · Showcase anchor: `#sec-draggable-cube`

## Purpose

Drag-to-rotate cube with face lighting simulation.

## Expected look

Cube scene; drag updates rotation; face opacity simulates light.

## States

Idle; dragging rotates scene.

## Deterministic checks

Oracle scenarios (see `docs/design/spatial/oracles/Dcb.json`):

- **dcb-dom-present** — root `[data-ks-hash="Dcb"]` visible; threshold 1.0 after scenario actions.
- **dcb-drag-rotate** — root `[data-ks-hash="Dcb"]` visible; threshold 1.0 after scenario actions.

## Root element

```html
<!-- class varies: .ks-cube--draggable -->
<div class="ks-cube--draggable" hash="Dcb" data-ks-hash="Dcb"
     data-ks-type="component" data-ks-name="draggable-cube">
```
