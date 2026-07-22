# Anchor Jump Menu (`Ajm`)

**Hash:** `Ajm` · **Slug:** `anchor-jump-menu` · **Showcase:** `navigation.html` `#sec-anchor-jump-menu`

Emitter: `components/nav_layout.py::render_anchor_jump_menu` · CSS root: `.ks-nav--anchor-jump-menu`

## Purpose

Governed nav-layout primitive: anchor jump menu.

## Expected behavior

See showcase section `#sec-anchor-jump-menu` on `navigation.html`.

## States

Default interactive demo; reduced-motion path documented when motion is material.

## Oracle scenarios

`ajm-dom-present`

Machine oracle: [`../oracles/Ajm.json`](../oracles/Ajm.json) · Contract: [`../../catalog/components/Ajm-anchor-jump-menu.md`](../../catalog/components/Ajm-anchor-jump-menu.md)

## Accessibility

- Root emits `hash` and `data-ks-hash="Ajm"` with `data-ks-type="component"`.
- Interactive controls remain keyboard reachable; decorative layers use `aria-hidden` where applicable.
- Motion-heavy effects respect `prefers-reduced-motion: reduce`.
