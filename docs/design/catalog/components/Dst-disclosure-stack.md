# Dst — Disclosure Stack

**Hash:** `Dst` · **Type:** component · **Family:** nav-layout · **Status:** active

Source: `components/nav_layout.py::render_disclosure_stack` · Showcase: `controls.html` `#sec-disclosure-stack`

## Purpose

Governed nav-layout primitive: disclosure stack.

## Expected look

See showcase section `#sec-disclosure-stack` on `controls.html`.

## Deterministic checks

Oracle scenarios (see `docs/design/nav-layout/oracles/Dst.json`):

- **dst-dom-present** — root `[data-ks-hash="Dst"]` visible; threshold 1.0 after scenario actions.

## Root element

```html
<div class="ks-nav--disclosure-stack" hash="Dst" data-ks-hash="Dst"
     data-ks-type="component" data-ks-name="disclosure-stack">
```
