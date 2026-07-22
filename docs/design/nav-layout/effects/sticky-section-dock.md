# Sticky Section Dock (`Ssd`)

**Hash:** `Ssd` · **Slug:** `sticky-section-dock` · **Showcase:** `navigation.html` `#sec-sticky-section-dock`

Emitter: `components/nav_layout.py::render_sticky_section_dock` · CSS root: `.ks-nav--sticky-section-dock`

## Purpose

Governed nav-layout primitive: sticky section dock.

## Expected behavior

See showcase section `#sec-sticky-section-dock` on `navigation.html`.

## States

Default interactive demo; reduced-motion path documented when motion is material.

## Oracle scenarios

`ssd-dom-present`

Machine oracle: [`../oracles/Ssd.json`](../oracles/Ssd.json) · Contract: [`../../catalog/components/Ssd-sticky-section-dock.md`](../../catalog/components/Ssd-sticky-section-dock.md)

## Accessibility

- Root emits `hash` and `data-ks-hash="Ssd"` with `data-ks-type="component"`.
- Interactive controls remain keyboard reachable; decorative layers use `aria-hidden` where applicable.
- Motion-heavy effects respect `prefers-reduced-motion: reduce`.
