# Editorial Peek Rail (`Epr`)

**Hash:** `Epr` · **Slug:** `editorial-peek-rail` · **Showcase:** `presentation.html` `#sec-editorial-peek-rail`

Emitter: `components/nav_layout.py::render_editorial_peek_rail` · CSS root: `.ks-nav--editorial-peek-rail`

## Purpose

Governed nav-layout primitive: editorial peek rail.

## Expected behavior

See showcase section `#sec-editorial-peek-rail` on `presentation.html`.

## States

Default interactive demo; reduced-motion path documented when motion is material.

## Oracle scenarios

`epr-dom-present`

Machine oracle: [`../oracles/Epr.json`](../oracles/Epr.json) · Contract: [`../../catalog/components/Epr-editorial-peek-rail.md`](../../catalog/components/Epr-editorial-peek-rail.md)

## Accessibility

- Root emits `hash` and `data-ks-hash="Epr"` with `data-ks-type="component"`.
- Interactive controls remain keyboard reachable; decorative layers use `aria-hidden` where applicable.
- Motion-heavy effects respect `prefers-reduced-motion: reduce`.
