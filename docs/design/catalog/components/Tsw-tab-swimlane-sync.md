# Tsw — Tab Swimlane Sync

**Hash:** `Tsw` · **Type:** component · **Family:** nav-layout · **Status:** active

Source: `components/nav_layout.py::render_tab_swimlane_sync` · Showcase: `navigation.html` `#sec-tab-swimlane-sync`

## Purpose

Governed nav-layout primitive: tab swimlane sync.

## Expected look

See showcase section `#sec-tab-swimlane-sync` on `navigation.html`.

## Deterministic checks

Oracle scenarios (see `docs/design/nav-layout/oracles/Tsw.json`):

- **tss-dom-present** — root `[data-ks-hash="Tsw"]` visible; threshold 1.0 after scenario actions.

## Root element

```html
<div class="ks-nav--tab-swimlane-sync" hash="Tsw" data-ks-hash="Tsw"
     data-ks-type="component" data-ks-name="tab-swimlane-sync">
```
