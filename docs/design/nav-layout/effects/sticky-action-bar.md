# Sticky Action Bar (`Sab`)

**Hash:** `Sab` · **Slug:** `sticky-action-bar` · **Showcase:** `controls.html` `#sec-sticky-action-bar`

Emitter: `components/nav_layout.py::render_sticky_action_bar` · CSS root: `.ks-nav--sticky-action-bar`

## Purpose

Governed nav-layout primitive: sticky action bar.

## Expected behavior

See showcase section `#sec-sticky-action-bar` on `controls.html`.

## States

Default interactive demo; reduced-motion path documented when motion is material.

## Oracle scenarios

`sab-dom-present`

Machine oracle: [`../oracles/Sab.json`](../oracles/Sab.json) · Contract: [`../../catalog/components/Sab-sticky-action-bar.md`](../../catalog/components/Sab-sticky-action-bar.md)

## Accessibility

- Root emits `hash` and `data-ks-hash="Sab"` with `data-ks-type="component"`.
- Interactive controls remain keyboard reachable; decorative layers use `aria-hidden` where applicable.
- Motion-heavy effects respect `prefers-reduced-motion: reduce`.
