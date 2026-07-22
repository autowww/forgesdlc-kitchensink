# Iso — Isometric tile

**Hash:** `Iso` · **Type:** component · **Family:** spatial · **Status:** active

Source: `components/spatial.py::render_iso_tile` · Showcase anchor: `#sec-iso-tile`

## Purpose

Bento tile with isometric lift (rotateX 60deg, rotateZ -45deg).

## Expected look

Elevated card tile in iso projection.

## States

Static iso pose.

## Deterministic checks

Oracle scenarios (see `docs/design/spatial/oracles/Iso.json`):

- **iso-dom-present** — root `[data-ks-hash="Iso"]` visible; threshold 1.0 after scenario actions.

## Root element

```html
<!-- class varies: .ks-tile--iso -->
<div class="ks-tile--iso" hash="Iso" data-ks-hash="Iso"
     data-ks-type="component" data-ks-name="isometric-tile">
```
