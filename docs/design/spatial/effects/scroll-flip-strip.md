# Scroll Flip Strip (`Stf`)

**Hash:** `Stf` · **Slug:** `scroll-flip-strip` · **Showcase:** `#sec-scroll-flip-strip`

Emitter: `components/spatial_wave2.py` or `components/spatial.py` · CSS: `css/ks-spatial-wave2.css`

## Purpose

Scroll flip strip

## Expected behavior

Governed spatial primitive with hash marker, reduced-motion fallback, and preserve-3d support gate.

## Oracle scenarios

See [`../oracles/Stf.json`](../oracles/Stf.json).

## Accessibility

- Root emits `hash` and `data-ks-hash="Stf"`.
- Motion respects `prefers-reduced-motion: reduce`.
