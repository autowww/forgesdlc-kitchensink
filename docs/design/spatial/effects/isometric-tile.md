# Isometric tile (`Iso`)

**Hash:** `Iso` · **Slug:** `isometric-tile` · **Showcase:** `#sec-iso-tile`

Emitter: `components/spatial.py::render_iso_tile` · CSS root: `.ks-tile--iso`

## Purpose

Bento tile with isometric lift (rotateX 60deg, rotateZ -45deg).

## Expected behavior

Elevated card tile in iso projection.

## States

Static iso pose.

## Oracle scenarios

`iso-dom-present`

Machine oracle: [`../oracles/Iso.json`](../oracles/Iso.json) · Contract: [`../../catalog/components/Iso-isometric-tile.md`](../../catalog/components/Iso-isometric-tile.md)

## Accessibility

- Root emits `hash` and `data-ks-hash="Iso"` with `data-ks-type="component"`.
- Interactive controls remain keyboard reachable; decorative layers use `aria-hidden` where applicable.
- Motion-heavy effects respect `prefers-reduced-motion: reduce` (see reduced-motion scenario ids).
