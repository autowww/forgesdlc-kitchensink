# Ssd — Sticky Section Dock

**Hash:** `Ssd` · **Type:** component · **Family:** nav-layout · **Status:** active

Source: `components/nav_layout.py::render_sticky_section_dock` · Showcase: `navigation.html` `#sec-sticky-section-dock`

## Purpose

Governed nav-layout primitive: sticky section dock.

## Expected look

See showcase section `#sec-sticky-section-dock` on `navigation.html`.

## Deterministic checks

Oracle scenarios (see `docs/design/nav-layout/oracles/Ssd.json`):

- **ssd-dom-present** — root `[data-ks-hash="Ssd"]` visible; threshold 1.0 after scenario actions.

## Root element

```html
<div class="ks-nav--sticky-section-dock" hash="Ssd" data-ks-hash="Ssd"
     data-ks-type="component" data-ks-name="sticky-section-dock">
```
