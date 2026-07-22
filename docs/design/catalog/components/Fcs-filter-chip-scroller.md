# Fcs — Filter Chip Scroller

**Hash:** `Fcs` · **Type:** component · **Family:** nav-layout · **Status:** active

Source: `components/nav_layout.py::render_filter_chip_scroller` · Showcase: `controls.html` `#sec-filter-chip-scroller`

## Purpose

Governed nav-layout primitive: filter chip scroller.

## Expected look

See showcase section `#sec-filter-chip-scroller` on `controls.html`.

## Deterministic checks

Oracle scenarios (see `docs/design/nav-layout/oracles/Fcs.json`):

- **fcs-dom-present** — root `[data-ks-hash="Fcs"]` visible; threshold 1.0 after scenario actions.

## Root element

```html
<div class="ks-nav--filter-chip-scroller" hash="Fcs" data-ks-hash="Fcs"
     data-ks-type="component" data-ks-name="filter-chip-scroller">
```
