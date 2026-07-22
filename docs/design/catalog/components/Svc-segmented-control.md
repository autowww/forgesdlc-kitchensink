# Svc — Segmented Control

**Hash:** `Svc` · **Type:** component · **Family:** nav-layout · **Status:** active

Source: `components/nav_layout.py::render_segmented_control` · Showcase: `controls.html` `#sec-segmented-control`

## Purpose

Governed nav-layout primitive: segmented control.

## Expected look

See showcase section `#sec-segmented-control` on `controls.html`.

## Deterministic checks

Oracle scenarios (see `docs/design/nav-layout/oracles/Svc.json`):

- **svc-dom-present** — root `[data-ks-hash="Svc"]` visible; threshold 1.0 after scenario actions.

## Root element

```html
<div class="ks-nav--segmented-control" hash="Svc" data-ks-hash="Svc"
     data-ks-type="component" data-ks-name="segmented-control">
```
