# Mega Menu (`Mmg`)

**Hash:** `Mmg` · **Slug:** `mega-menu` · **Showcase:** `navigation.html` `#sec-mega-menu`

Emitter: `components/nav_layout.py::render_mega_menu` · CSS root: `.ks-nav--mega-menu`

## Purpose

Governed nav-layout primitive: mega menu.

## Expected behavior

See showcase section `#sec-mega-menu` on `navigation.html`.

## States

Default interactive demo; reduced-motion path documented when motion is material.

## Oracle scenarios

`mmg-dom-present`

Machine oracle: [`../oracles/Mmg.json`](../oracles/Mmg.json) · Contract: [`../../catalog/components/Mmg-mega-menu.md`](../../catalog/components/Mmg-mega-menu.md)

## Accessibility

- Root emits `hash` and `data-ks-hash="Mmg"` with `data-ks-type="component"`.
- Interactive controls remain keyboard reachable; decorative layers use `aria-hidden` where applicable.
- Motion-heavy effects respect `prefers-reduced-motion: reduce`.
