# Mmg — Mega Menu

**Hash:** `Mmg` · **Type:** component · **Family:** nav-layout · **Status:** active

Source: `components/nav_layout.py::render_mega_menu` · Showcase: `navigation.html` `#sec-mega-menu`

## Purpose

Governed nav-layout primitive: mega menu.

## Expected look

See showcase section `#sec-mega-menu` on `navigation.html`.

## Deterministic checks

Oracle scenarios (see `docs/design/nav-layout/oracles/Mmg.json`):

- **mmg-dom-present** — root `[data-ks-hash="Mmg"]` visible; threshold 1.0 after scenario actions.

## Root element

```html
<div class="ks-nav--mega-menu" hash="Mmg" data-ks-hash="Mmg"
     data-ks-type="component" data-ks-name="mega-menu">
```
