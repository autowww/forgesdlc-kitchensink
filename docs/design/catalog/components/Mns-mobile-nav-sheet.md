# Mns — Mobile Nav Sheet

**Hash:** `Mns` · **Type:** component · **Family:** nav-layout · **Status:** active

Source: `components/nav_layout.py::render_mobile_nav_sheet` · Showcase: `navigation.html` `#sec-mobile-nav-sheet`

## Purpose

Governed nav-layout primitive: mobile nav sheet.

## Expected look

See showcase section `#sec-mobile-nav-sheet` on `navigation.html`.

## Deterministic checks

Oracle scenarios (see `docs/design/nav-layout/oracles/Mns.json`):

- **mns-dom-present** — root `[data-ks-hash="Mns"]` visible; threshold 1.0 after scenario actions.

## Root element

```html
<div class="ks-nav--mobile-nav-sheet" hash="Mns" data-ks-hash="Mns"
     data-ks-type="component" data-ks-name="mobile-nav-sheet">
```
