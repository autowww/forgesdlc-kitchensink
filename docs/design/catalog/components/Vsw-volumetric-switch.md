# Vsw — Volumetric switch

**Hash:** `Vsw` · **Type:** component · **Family:** spatial · **Status:** active

Source: `components/spatial.py::render_volumetric_switch` · Showcase anchor: `#sec-volumetric-switch`

## Purpose

Toggle with physical thumb translation on Z and X.

## Expected look

Recessed track; cyan fill when on; thumb lifts on translateZ.

## States

Off (thumb left); on (thumb right, track filled).

## Deterministic checks

Oracle scenarios (see `docs/design/spatial/oracles/Vsw.json`):

- **vsw-dom-present** — root `[data-ks-hash="Vsw"]` visible; threshold 1.0 after scenario actions.
- **vsw-toggle-on** — root `[data-ks-hash="Vsw"]` visible; threshold 1.0 after scenario actions.

## Root element

```html
<!-- class varies: .ks-switch--volumetric -->
<div class="ks-switch--volumetric" hash="Vsw" data-ks-hash="Vsw"
     data-ks-type="component" data-ks-name="volumetric-switch">
```
