# Gcb — Governed Combobox

**Hash:** `Gcb` · **Type:** component · **Family:** nav-layout · **Status:** active

Source: `components/nav_layout.py::render_governed_combobox` · Showcase: `controls.html` `#sec-governed-combobox`

## Purpose

Governed nav-layout primitive: governed combobox.

## Expected look

See showcase section `#sec-governed-combobox` on `controls.html`.

## Deterministic checks

Oracle scenarios (see `docs/design/nav-layout/oracles/Gcb.json`):

- **gcb-dom-present** — root `[data-ks-hash="Gcb"]` visible; threshold 1.0 after scenario actions.

## Root element

```html
<div class="ks-nav--governed-combobox" hash="Gcb" data-ks-hash="Gcb"
     data-ks-type="component" data-ks-name="governed-combobox">
```
