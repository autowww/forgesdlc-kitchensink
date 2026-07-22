# Pgt — Pagination Tactile

**Hash:** `Pgt` · **Type:** component · **Family:** nav-layout · **Status:** active

Source: `components/nav_layout.py::render_pagination_tactile` · Showcase: `controls.html` `#sec-pagination-tactile`

## Purpose

Governed nav-layout primitive: pagination tactile.

## Expected look

See showcase section `#sec-pagination-tactile` on `controls.html`.

## Deterministic checks

Oracle scenarios (see `docs/design/nav-layout/oracles/Pgt.json`):

- **pgt-dom-present** — root `[data-ks-hash="Pgt"]` visible; threshold 1.0 after scenario actions.

## Root element

```html
<div class="ks-nav--pagination-tactile" hash="Pgt" data-ks-hash="Pgt"
     data-ks-type="component" data-ks-name="pagination-tactile">
```
