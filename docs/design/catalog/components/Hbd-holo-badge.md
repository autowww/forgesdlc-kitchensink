# Hbd — Holographic badge

**Hash:** `Hbd` · **Type:** component · **Family:** spatial · **Status:** active

Source: `components/spatial.py::render_holo_badge` · Showcase anchor: `#sec-holo-badge`

## Purpose

Compact holo label for status or tier callouts.

## Expected look

Small pill badge with pointer-driven holo sheen.

## States

Pointer updates CSS vars; reduced motion static.

## Deterministic checks

Oracle scenarios (see `docs/design/spatial/oracles/Hbd.json`):

- **hbd-dom-present** — root `[data-ks-hash="Hbd"]` visible; threshold 1.0 after scenario actions.
- **hbd-pointer-move** — root `[data-ks-hash="Hbd"]` visible; threshold 1.0 after scenario actions.

## Root element

```html
<!-- class varies: .ks-badge--holo -->
<div class="ks-badge--holo" hash="Hbd" data-ks-hash="Hbd"
     data-ks-type="component" data-ks-name="holo-badge">
```
