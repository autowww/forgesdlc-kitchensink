# Rgb Keyboard (`Kbd`)

**Hash:** `Kbd` · **Slug:** `rgb-keyboard` · **Showcase:** `#sec-rgb-keyboard`

Emitter: `components/spatial_wave2.py` or `components/spatial.py` · CSS: `css/ks-spatial-wave2.css`

## Purpose

RGB keyboard surface

## Expected behavior

Governed spatial primitive with hash marker, reduced-motion fallback, and preserve-3d support gate.

## Oracle scenarios

See [`../oracles/Kbd.json`](../oracles/Kbd.json).

## Accessibility

- Root emits `hash` and `data-ks-hash="Kbd"`.
- Motion respects `prefers-reduced-motion: reduce`.
