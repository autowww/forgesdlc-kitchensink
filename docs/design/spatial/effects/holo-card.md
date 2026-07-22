# Holographic card (`Hol`)

**Hash:** `Hol` · **Slug:** `holo-card` · **Showcase:** `#sec-holo-card`

Emitter: `components/spatial.py::render_holo_card` · CSS root: `.ks-card--holo`

## Purpose

Premium pointer-driven iridescent glare on a card surface.

## Expected behavior

Dark forge card with animated glare layer; CSS vars --ks-rx/--ks-ry track pointer.

## States

Idle neutral tilt; pointer move updates glare; reduced motion dampens motion.

## Oracle scenarios

`hol-dom-present`, `hol-pointer-move`, `hol-reduced-motion`

Machine oracle: [`../oracles/Hol.json`](../oracles/Hol.json) · Contract: [`../../catalog/components/Hol-holo-card.md`](../../catalog/components/Hol-holo-card.md)

## Accessibility

- Root emits `hash` and `data-ks-hash="Hol"` with `data-ks-type="component"`.
- Interactive controls remain keyboard reachable; decorative layers use `aria-hidden` where applicable.
- Motion-heavy effects respect `prefers-reduced-motion: reduce` (see reduced-motion scenario ids).
