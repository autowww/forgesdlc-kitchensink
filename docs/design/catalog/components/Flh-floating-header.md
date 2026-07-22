# Flh — Floating header

**Hash:** `Flh` · **Type:** component · **Family:** spatial · **Status:** active

Source: `components/spatial.py::render_floating_header` · Showcase anchor: `#sec-floating-header`

## Purpose

Scroll-linked volumetric headline variant.

## Expected look

Display depth text with scroll-driven float offset.

## States

Scroll updates translateZ/offset; reduced motion static depth.

## Deterministic checks

Oracle scenarios (see `docs/design/spatial/oracles/Flh.json`):

- **flh-dom-present** — root `[data-ks-hash="Flh"]` visible; threshold 1.0 after scenario actions.
- **flh-scroll-offset** — root `[data-ks-hash="Flh"]` visible; threshold 1.0 after scenario actions.

## Root element

```html
<!-- class varies: .ks-display--depth--float -->
<div class="ks-display--depth--float" hash="Flh" data-ks-hash="Flh"
     data-ks-type="component" data-ks-name="floating-header">
```
