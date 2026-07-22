# Stepper Wizard (`Swz`)

**Hash:** `Swz` · **Slug:** `stepper-wizard` · **Showcase:** `controls.html` `#sec-stepper-wizard`

Emitter: `components/nav_layout.py::render_stepper_wizard` · CSS root: `.ks-nav--stepper-wizard`

## Purpose

Governed nav-layout primitive: stepper wizard.

## Expected behavior

See showcase section `#sec-stepper-wizard` on `controls.html`.

## States

Default interactive demo; reduced-motion path documented when motion is material.

## Oracle scenarios

`swz-dom-present`

Machine oracle: [`../oracles/Swz.json`](../oracles/Swz.json) · Contract: [`../../catalog/components/Swz-stepper-wizard.md`](../../catalog/components/Swz-stepper-wizard.md)

## Accessibility

- Root emits `hash` and `data-ks-hash="Swz"` with `data-ks-type="component"`.
- Interactive controls remain keyboard reachable; decorative layers use `aria-hidden` where applicable.
- Motion-heavy effects respect `prefers-reduced-motion: reduce`.
