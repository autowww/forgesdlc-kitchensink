# Hol — Holographic card

**Hash:** `Hol` · **Type:** component · **Family:** spatial · **Status:** active

Source: `components/spatial.py::render_holo_card` · Showcase anchor: `#sec-holo-card`

## Purpose

Premium pointer-driven iridescent glare on a card surface.

## Expected look

Dark forge card with animated glare layer; CSS vars --ks-rx/--ks-ry track pointer.

## States

Idle neutral tilt; pointer move updates glare; reduced motion dampens motion.

## Deterministic checks

Oracle scenarios (see `docs/design/spatial/oracles/Hol.json`):

- **hol-dom-present** — root `[data-ks-hash="Hol"]` visible; threshold 1.0 after scenario actions.
- **hol-pointer-move** — root `[data-ks-hash="Hol"]` visible; threshold 1.0 after scenario actions.
- **hol-reduced-motion** — root `[data-ks-hash="Hol"]` visible; threshold 1.0 after scenario actions.

## Root element

```html
<!-- class varies: .ks-card--holo -->
<div class="ks-card--holo" hash="Hol" data-ks-hash="Hol"
     data-ks-type="component" data-ks-name="holo-card">
```
