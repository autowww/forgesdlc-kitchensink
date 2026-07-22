# Disclosure Stack (`Dst`)

**Hash:** `Dst` · **Slug:** `disclosure-stack` · **Showcase:** `controls.html` `#sec-disclosure-stack`

Emitter: `components/nav_layout.py::render_disclosure_stack` · CSS root: `.ks-nav--disclosure-stack`

## Purpose

Governed nav-layout primitive: disclosure stack.

## Expected behavior

See showcase section `#sec-disclosure-stack` on `controls.html`.

## States

Default interactive demo; reduced-motion path documented when motion is material.

## Oracle scenarios

`dst-dom-present`

Machine oracle: [`../oracles/Dst.json`](../oracles/Dst.json) · Contract: [`../../catalog/components/Dst-disclosure-stack.md`](../../catalog/components/Dst-disclosure-stack.md)

## Accessibility

- Root emits `hash` and `data-ks-hash="Dst"` with `data-ks-type="component"`.
- Interactive controls remain keyboard reachable; decorative layers use `aria-hidden` where applicable.
- Motion-heavy effects respect `prefers-reduced-motion: reduce`.
