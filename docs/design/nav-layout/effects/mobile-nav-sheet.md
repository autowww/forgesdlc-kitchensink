# Mobile Nav Sheet (`Mns`)

**Hash:** `Mns` · **Slug:** `mobile-nav-sheet` · **Showcase:** `navigation.html` `#sec-mobile-nav-sheet`

Emitter: `components/nav_layout.py::render_mobile_nav_sheet` · CSS root: `.ks-nav--mobile-nav-sheet`

## Purpose

Governed nav-layout primitive: mobile nav sheet.

## Expected behavior

See showcase section `#sec-mobile-nav-sheet` on `navigation.html`.

## States

Default interactive demo; reduced-motion path documented when motion is material.

## Oracle scenarios

`mns-dom-present`

Machine oracle: [`../oracles/Mns.json`](../oracles/Mns.json) · Contract: [`../../catalog/components/Mns-mobile-nav-sheet.md`](../../catalog/components/Mns-mobile-nav-sheet.md)

## Accessibility

- Root emits `hash` and `data-ks-hash="Mns"` with `data-ks-type="component"`.
- Interactive controls remain keyboard reachable; decorative layers use `aria-hidden` where applicable.
- Motion-heavy effects respect `prefers-reduced-motion: reduce`.
