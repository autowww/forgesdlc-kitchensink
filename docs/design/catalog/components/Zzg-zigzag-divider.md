# Zzg — Zigzag 3D divider

**Hash:** `Zzg` · **Type:** component · **Family:** spatial · **Status:** active

Source: `components/spatial.py::render_zigzag_divider` · Showcase anchor: `#sec-zigzag`

## Purpose

Decorative paper-cut section edge using pure CSS.

## Expected look

Horizontal zigzag band with conic-gradient depth illusion.

## States

Static separator; no interaction.

## Deterministic checks

Oracle scenarios (see `docs/design/spatial/oracles/Zzg.json`):

- **zzg-dom-present** — root `[data-ks-hash="Zzg"]` visible; threshold 1.0 after scenario actions.

## Root element

```html
<!-- class varies: .ks-divider--zigzag-3d -->
<div class="ks-divider--zigzag-3d" hash="Zzg" data-ks-hash="Zzg"
     data-ks-type="component" data-ks-name="zigzag-divider">
```
