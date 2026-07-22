# Breadcrumb Depth (`Bdt`)

**Hash:** `Bdt` · **Slug:** `breadcrumb-depth` · **Showcase:** `navigation.html` `#sec-breadcrumb-depth`

Emitter: `components/nav_layout.py::render_breadcrumb_depth` · CSS root: `.ks-nav--breadcrumb-depth`

## Purpose

Governed nav-layout primitive: breadcrumb depth.

## Expected behavior

See showcase section `#sec-breadcrumb-depth` on `navigation.html`.

## States

Default interactive demo; reduced-motion path documented when motion is material.

## Oracle scenarios

`bdt-dom-present`

Machine oracle: [`../oracles/Bdt.json`](../oracles/Bdt.json) · Contract: [`../../catalog/components/Bdt-breadcrumb-depth.md`](../../catalog/components/Bdt-breadcrumb-depth.md)

## Accessibility

- Root emits `hash` and `data-ks-hash="Bdt"` with `data-ks-type="component"`.
- Interactive controls remain keyboard reachable; decorative layers use `aria-hidden` where applicable.
- Motion-heavy effects respect `prefers-reduced-motion: reduce`.
