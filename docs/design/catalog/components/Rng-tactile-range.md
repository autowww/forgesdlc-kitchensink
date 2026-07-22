# Rng — Tactile range

**Hash:** `Rng` · **Type:** component · **Family:** spatial · **Status:** active

Source: `components/spatial.py::render_tactile_range` · Showcase anchor: `#sec-tactile-range`

## Purpose

Native range input with recessed track and glassy thumb.

## Expected look

Horizontal slider with neumorphic track and spherical thumb.

## States

Value drag updates thumb position along track.

## Deterministic checks

Oracle scenarios (see `docs/design/spatial/oracles/Rng.json`):

- **rng-dom-present** — root `[data-ks-hash="Rng"]` visible; threshold 1.0 after scenario actions.
- **rng-value-change** — root `[data-ks-hash="Rng"]` visible; threshold 1.0 after scenario actions.

## Root element

```html
<!-- class varies: .ks-range--tactile -->
<div class="ks-range--tactile" hash="Rng" data-ks-hash="Rng"
     data-ks-type="component" data-ks-name="tactile-range">
```
