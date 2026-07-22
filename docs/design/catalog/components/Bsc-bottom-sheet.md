# Bsc — Bottom Sheet

**Hash:** `Bsc` · **Type:** component · **Family:** nav-layout · **Status:** active

Source: `components/nav_layout.py::render_bottom_sheet` · Showcase: `overlays-transitions.html` `#sec-bottom-sheet`

## Purpose

Governed nav-layout primitive: bottom sheet.

## Expected look

See showcase section `#sec-bottom-sheet` on `overlays-transitions.html`.

## Deterministic checks

Oracle scenarios (see `docs/design/nav-layout/oracles/Bsc.json`):

- **bsc-dom-present** — root `[data-ks-hash="Bsc"]` visible; threshold 1.0 after scenario actions.

## Root element

```html
<div class="ks-nav--bottom-sheet" hash="Bsc" data-ks-hash="Bsc"
     data-ks-type="component" data-ks-name="bottom-sheet">
```
