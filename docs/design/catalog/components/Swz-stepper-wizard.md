# Swz — Stepper Wizard

**Hash:** `Swz` · **Type:** component · **Family:** nav-layout · **Status:** active

Source: `components/nav_layout.py::render_stepper_wizard` · Showcase: `controls.html` `#sec-stepper-wizard`

## Purpose

Governed nav-layout primitive: stepper wizard.

## Expected look

See showcase section `#sec-stepper-wizard` on `controls.html`.

## Deterministic checks

Oracle scenarios (see `docs/design/nav-layout/oracles/Swz.json`):

- **swz-dom-present** — root `[data-ks-hash="Swz"]` visible; threshold 1.0 after scenario actions.

## Root element

```html
<div class="ks-nav--stepper-wizard" hash="Swz" data-ks-hash="Swz"
     data-ks-type="component" data-ks-name="stepper-wizard">
```
