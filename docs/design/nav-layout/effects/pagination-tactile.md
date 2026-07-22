# Pagination Tactile (`Pgt`)

**Hash:** `Pgt` · **Slug:** `pagination-tactile` · **Showcase:** `controls.html` `#sec-pagination-tactile`

Emitter: `components/nav_layout.py::render_pagination_tactile` · CSS root: `.ks-nav--pagination-tactile`

## Purpose

Governed nav-layout primitive: pagination tactile.

## Expected behavior

See showcase section `#sec-pagination-tactile` on `controls.html`.

## States

Default interactive demo; reduced-motion path documented when motion is material.

## Oracle scenarios

`pgt-dom-present`

Machine oracle: [`../oracles/Pgt.json`](../oracles/Pgt.json) · Contract: [`../../catalog/components/Pgt-pagination-tactile.md`](../../catalog/components/Pgt-pagination-tactile.md)

## Accessibility

- Root emits `hash` and `data-ks-hash="Pgt"` with `data-ks-type="component"`.
- Interactive controls remain keyboard reachable; decorative layers use `aria-hidden` where applicable.
- Motion-heavy effects respect `prefers-reduced-motion: reduce`.
