# Holographic badge (`Hbd`)

**Hash:** `Hbd` · **Slug:** `holo-badge` · **Showcase:** `#sec-holo-badge`

Emitter: `components/spatial.py::render_holo_badge` · CSS root: `.ks-badge--holo`

## Purpose

Compact holo label for status or tier callouts.

## Expected behavior

Small pill badge with pointer-driven holo sheen.

## States

Pointer updates CSS vars; reduced motion static.

## Oracle scenarios

`hbd-dom-present`, `hbd-pointer-move`

Machine oracle: [`../oracles/Hbd.json`](../oracles/Hbd.json) · Contract: [`../../catalog/components/Hbd-holo-badge.md`](../../catalog/components/Hbd-holo-badge.md)

## Accessibility

- Root emits `hash` and `data-ks-hash="Hbd"` with `data-ks-type="component"`.
- Interactive controls remain keyboard reachable; decorative layers use `aria-hidden` where applicable.
- Motion-heavy effects respect `prefers-reduced-motion: reduce` (see reduced-motion scenario ids).
