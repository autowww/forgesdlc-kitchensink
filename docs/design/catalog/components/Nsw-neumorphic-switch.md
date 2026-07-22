# Nsw — Neumorphic switch

**Hash:** `Nsw` · **Type:** component · **Family:** spatial · **Status:** active

Source: `components/spatial.py::render_volumetric_switch(tactile=True)` · Showcase anchor: `#sec-neumorphic-switch`

## Purpose

Recessed neumorphic variant of the volumetric switch.

## Expected look

Soft inset track; thumb sits in carved groove.

## States

Off/on thumb positions with tactile shadows.

## Deterministic checks

Oracle scenarios (see `docs/design/spatial/oracles/Nsw.json`):

- **nsw-dom-present** — root `[data-ks-hash="Nsw"]` visible; threshold 1.0 after scenario actions.
- **nsw-toggle-on** — root `[data-ks-hash="Nsw"]` visible; threshold 1.0 after scenario actions.

## Root element

```html
<!-- class varies: .ks-switch--tactile -->
<div class="ks-switch--tactile" hash="Nsw" data-ks-hash="Nsw"
     data-ks-type="component" data-ks-name="neumorphic-switch">
```
