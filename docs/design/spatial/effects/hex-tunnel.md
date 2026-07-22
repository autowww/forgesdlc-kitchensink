# Hex Tunnel (`Hex`)

**Hash:** `Hex` · **Slug:** `hex-tunnel` · **Showcase:** `#sec-hex-tunnel`

Emitter: `components/spatial_wave2.py` or `components/spatial.py` · CSS: `css/ks-spatial-wave2.css`

## Purpose

Hex tunnel ambient

## Expected behavior

Governed spatial primitive with hash marker, reduced-motion fallback, and preserve-3d support gate.

## Oracle scenarios

See [`../oracles/Hex.json`](../oracles/Hex.json).

## Accessibility

- Root emits `hash` and `data-ks-hash="Hex"`.
- Motion respects `prefers-reduced-motion: reduce`.
