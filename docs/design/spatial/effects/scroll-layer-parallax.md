# Scroll Layer Parallax (`Slp`)

**Hash:** `Slp` · **Slug:** `scroll-layer-parallax` · **Showcase:** `#sec-scroll-layer-parallax`

Emitter: `components/spatial_wave2.py` or `components/spatial.py` · CSS: `css/ks-spatial-wave2.css`

## Purpose

Scroll layer parallax

## Expected behavior

Governed spatial primitive with hash marker, reduced-motion fallback, and preserve-3d support gate.

## Oracle scenarios

See [`../oracles/Slp.json`](../oracles/Slp.json).

## Accessibility

- Root emits `hash` and `data-ks-hash="Slp"`.
- Motion respects `prefers-reduced-motion: reduce`.
