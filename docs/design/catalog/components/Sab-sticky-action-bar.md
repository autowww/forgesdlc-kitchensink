# Sab — Sticky Action Bar

**Hash:** `Sab` · **Type:** component · **Family:** nav-layout · **Status:** active

Source: `components/nav_layout.py::render_sticky_action_bar` · Showcase: `controls.html` `#sec-sticky-action-bar`

## Purpose

Governed nav-layout primitive: sticky action bar.

## Expected look

See showcase section `#sec-sticky-action-bar` on `controls.html`.

## Deterministic checks

Oracle scenarios (see `docs/design/nav-layout/oracles/Sab.json`):

- **sab-dom-present** — root `[data-ks-hash="Sab"]` visible; threshold 1.0 after scenario actions.

## Root element

```html
<div class="ks-nav--sticky-action-bar" hash="Sab" data-ks-hash="Sab"
     data-ks-type="component" data-ks-name="sticky-action-bar">
```
