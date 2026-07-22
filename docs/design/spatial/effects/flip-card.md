# Flip card (`Flp`)

**Hash:** `Flp` · **Slug:** `flip-card` · **Showcase:** `#sec-flip-card`

Emitter: `components/spatial.py::render_flip_card` · CSS root: `.ks-card--flip`

## Purpose

Reveal back-face content on demand with a governed Y-axis flip.

## Expected behavior

Card with visible Flip control; inner faces stack in 3D; back face uses glass treatment.

## States

Default shows front; checked trigger rotates inner ~180deg on Y; reduced motion hides back without rotation.

## Oracle scenarios

`flp-dom-present`, `flp-reduced-motion`, `flp-flip-toggle`, `flp-stack-variant`

Machine oracle: [`../oracles/Flp.json`](../oracles/Flp.json) · Contract: [`../../catalog/components/Flp-flip-card.md`](../../catalog/components/Flp-flip-card.md)

## Accessibility

- Root emits `hash` and `data-ks-hash="Flp"` with `data-ks-type="component"`.
- Interactive controls remain keyboard reachable; decorative layers use `aria-hidden` where applicable.
- Motion-heavy effects respect `prefers-reduced-motion: reduce` (see reduced-motion scenario ids).
