# Segmented Control (`Svc`)

**Hash:** `Svc` · **Slug:** `segmented-control` · **Showcase:** `controls.html` `#sec-segmented-control`

Emitter: `components/nav_layout.py::render_segmented_control` · CSS root: `.ks-nav--segmented-control`

## Purpose

Governed nav-layout primitive: segmented control.

## Expected behavior

See showcase section `#sec-segmented-control` on `controls.html`.

## States

Default interactive demo; reduced-motion path documented when motion is material.

## Oracle scenarios

`svc-dom-present`

Machine oracle: [`../oracles/Svc.json`](../oracles/Svc.json) · Contract: [`../../catalog/components/Svc-segmented-control.md`](../../catalog/components/Svc-segmented-control.md)

## Accessibility

- Root emits `hash` and `data-ks-hash="Svc"` with `data-ks-type="component"`.
- Interactive controls remain keyboard reachable; decorative layers use `aria-hidden` where applicable.
- Motion-heavy effects respect `prefers-reduced-motion: reduce`.
