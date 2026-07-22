# Bdt — Breadcrumb Depth

**Hash:** `Bdt` · **Type:** component · **Family:** nav-layout · **Status:** active

Source: `components/nav_layout.py::render_breadcrumb_depth` · Showcase: `navigation.html` `#sec-breadcrumb-depth`

## Purpose

Governed nav-layout primitive: breadcrumb depth.

## Expected look

See showcase section `#sec-breadcrumb-depth` on `navigation.html`.

## Deterministic checks

Oracle scenarios (see `docs/design/nav-layout/oracles/Bdt.json`):

- **bdt-dom-present** — root `[data-ks-hash="Bdt"]` visible; threshold 1.0 after scenario actions.

## Root element

```html
<div class="ks-nav--breadcrumb-depth" hash="Bdt" data-ks-hash="Bdt"
     data-ks-type="component" data-ks-name="breadcrumb-depth">
```
