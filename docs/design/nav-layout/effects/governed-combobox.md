# Governed Combobox (`Gcb`)

**Hash:** `Gcb` · **Slug:** `governed-combobox` · **Showcase:** `controls.html` `#sec-governed-combobox`

Emitter: `components/nav_layout.py::render_governed_combobox` · CSS root: `.ks-nav--governed-combobox`

## Purpose

Governed nav-layout primitive: governed combobox.

## Expected behavior

See showcase section `#sec-governed-combobox` on `controls.html`.

## States

Default interactive demo; reduced-motion path documented when motion is material.

## Oracle scenarios

`gcb-dom-present`

Machine oracle: [`../oracles/Gcb.json`](../oracles/Gcb.json) · Contract: [`../../catalog/components/Gcb-governed-combobox.md`](../../catalog/components/Gcb-governed-combobox.md)

## Accessibility

- Root emits `hash` and `data-ks-hash="Gcb"` with `data-ks-type="component"`.
- Interactive controls remain keyboard reachable; decorative layers use `aria-hidden` where applicable.
- Motion-heavy effects respect `prefers-reduced-motion: reduce`.
