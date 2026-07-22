# Ajm — Anchor Jump Menu

**Hash:** `Ajm` · **Type:** component · **Family:** nav-layout · **Status:** active

Source: `components/nav_layout.py::render_anchor_jump_menu` · Showcase: `navigation.html` `#sec-anchor-jump-menu`

## Purpose

Governed nav-layout primitive: anchor jump menu.

## Expected look

See showcase section `#sec-anchor-jump-menu` on `navigation.html`.

## Deterministic checks

Oracle scenarios (see `docs/design/nav-layout/oracles/Ajm.json`):

- **ajm-dom-present** — root `[data-ks-hash="Ajm"]` visible; threshold 1.0 after scenario actions.

## Root element

```html
<div class="ks-nav--anchor-jump-menu" hash="Ajm" data-ks-hash="Ajm"
     data-ks-type="component" data-ks-name="anchor-jump-menu">
```
