# Zigzag 3D divider (`Zzg`)

**Hash:** `Zzg` · **Slug:** `zigzag-divider` · **Showcase:** `#sec-zigzag`

Emitter: `components/spatial.py::render_zigzag_divider` · CSS root: `.ks-divider--zigzag-3d`

## Purpose

Decorative paper-cut section edge using pure CSS.

## Expected behavior

Horizontal zigzag band with conic-gradient depth illusion.

## States

Static separator; no interaction.

## Oracle scenarios

`zzg-dom-present`

Machine oracle: [`../oracles/Zzg.json`](../oracles/Zzg.json) · Contract: [`../../catalog/components/Zzg-zigzag-divider.md`](../../catalog/components/Zzg-zigzag-divider.md)

## Accessibility

- Root emits `hash` and `data-ks-hash="Zzg"` with `data-ks-type="component"`.
- Interactive controls remain keyboard reachable; decorative layers use `aria-hidden` where applicable.
- Motion-heavy effects respect `prefers-reduced-motion: reduce` (see reduced-motion scenario ids).
