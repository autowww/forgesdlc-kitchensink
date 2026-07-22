# Bottom Sheet (`Bsc`)

**Hash:** `Bsc` · **Slug:** `bottom-sheet` · **Showcase:** `overlays-transitions.html` `#sec-bottom-sheet`

Emitter: `components/nav_layout.py::render_bottom_sheet` · CSS root: `.ks-nav--bottom-sheet`

## Purpose

Governed nav-layout primitive: bottom sheet.

## Expected behavior

See showcase section `#sec-bottom-sheet` on `overlays-transitions.html`.

## States

Default interactive demo; reduced-motion path documented when motion is material.

## Oracle scenarios

`bsc-dom-present`

Machine oracle: [`../oracles/Bsc.json`](../oracles/Bsc.json) · Contract: [`../../catalog/components/Bsc-bottom-sheet.md`](../../catalog/components/Bsc-bottom-sheet.md)

## Accessibility

- Root emits `hash` and `data-ks-hash="Bsc"` with `data-ks-type="component"`.
- Interactive controls remain keyboard reachable; decorative layers use `aria-hidden` where applicable.
- Motion-heavy effects respect `prefers-reduced-motion: reduce`.
