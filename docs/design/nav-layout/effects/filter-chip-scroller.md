# Filter Chip Scroller (`Fcs`)

**Hash:** `Fcs` · **Slug:** `filter-chip-scroller` · **Showcase:** `controls.html` `#sec-filter-chip-scroller`

Emitter: `components/nav_layout.py::render_filter_chip_scroller` · CSS root: `.ks-nav--filter-chip-scroller`

## Purpose

Governed nav-layout primitive: filter chip scroller.

## Expected behavior

See showcase section `#sec-filter-chip-scroller` on `controls.html`.

## States

Default interactive demo; reduced-motion path documented when motion is material.

## Oracle scenarios

`fcs-dom-present`

Machine oracle: [`../oracles/Fcs.json`](../oracles/Fcs.json) · Contract: [`../../catalog/components/Fcs-filter-chip-scroller.md`](../../catalog/components/Fcs-filter-chip-scroller.md)

## Accessibility

- Root emits `hash` and `data-ks-hash="Fcs"` with `data-ks-type="component"`.
- Interactive controls remain keyboard reachable; decorative layers use `aria-hidden` where applicable.
- Motion-heavy effects respect `prefers-reduced-motion: reduce`.
