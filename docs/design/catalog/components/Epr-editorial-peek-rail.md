# Epr — Editorial Peek Rail

**Hash:** `Epr` · **Type:** component · **Family:** nav-layout · **Status:** active

Source: `components/nav_layout.py::render_editorial_peek_rail` · Showcase: `presentation.html` `#sec-editorial-peek-rail`

## Purpose

Governed nav-layout primitive: editorial peek rail.

## Expected look

See showcase section `#sec-editorial-peek-rail` on `presentation.html`.

## Deterministic checks

Oracle scenarios (see `docs/design/nav-layout/oracles/Epr.json`):

- **epr-dom-present** — root `[data-ks-hash="Epr"]` visible; threshold 1.0 after scenario actions.

## Root element

```html
<div class="ks-nav--editorial-peek-rail" hash="Epr" data-ks-hash="Epr"
     data-ks-type="component" data-ks-name="editorial-peek-rail">
```
