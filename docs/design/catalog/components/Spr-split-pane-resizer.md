# Spr — Split Pane Resizer

**Hash:** `Spr` · **Type:** component · **Family:** nav-layout · **Status:** active

Source: `components/nav_layout.py::render_split_pane_resizer` · Showcase: `layout-shells.html` `#sec-split-pane-resizer`

## Purpose

Governed nav-layout primitive: split pane resizer.

## Expected look

See showcase section `#sec-split-pane-resizer` on `layout-shells.html`.

## Deterministic checks

Oracle scenarios (see `docs/design/nav-layout/oracles/Spr.json`):

- **spr-dom-present** — root `[data-ks-hash="Spr"]` visible; threshold 1.0 after scenario actions.

## Root element

```html
<div class="ks-nav--split-pane-resizer" hash="Spr" data-ks-hash="Spr"
     data-ks-type="component" data-ks-name="split-pane-resizer">
```
